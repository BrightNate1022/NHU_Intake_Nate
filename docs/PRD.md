# Product Requirements Document (PRD)
## HireU Collaborative Intake Form Application

### Version: 1.0
### Date: December 3, 2025

---

## 1. Executive Summary

HireU Intake is a Next.js web application that enables real-time collaborative editing of candidate intake forms. Multiple team members can simultaneously view and edit form fields, with changes synced instantly across all connected clients. Once completed and validated, the form data is submitted to the Loxo recruitment platform via their API.

---

## 2. Problem Statement

Recruitment teams need a streamlined way to:
- Collaboratively gather candidate information from multiple sources
- See real-time updates when team members contribute data
- Ensure data quality through validation before submission
- Submit validated candidate data directly to their ATS (Loxo)

---

## 3. Goals & Objectives

### Primary Goals
1. **Real-time Collaboration**: Multiple users can edit the same intake form simultaneously
2. **Data Persistence**: Form progress is saved automatically to MongoDB
3. **Validation**: Comprehensive validation before Loxo submission
4. **Integration**: Seamless submission to Loxo API

### Success Metrics
- Form data syncs within 100ms across clients
- Zero data loss during collaboration
- 99% successful Loxo submission rate
- Support for 10+ simultaneous editors per form

---

## 4. User Personas

### Recruiter
- Initiates new intake forms for candidates
- Fills in candidate information from various sources
- Reviews and validates data before submission
- Submits finalized forms to Loxo

### Coordinator
- Assists recruiters in data entry
- May work on multiple forms simultaneously
- Needs to see real-time updates from team members

### Manager
- Oversees form completion status
- May occasionally contribute to forms
- Monitors submission success

---

## 5. Functional Requirements

### 5.1 Form Management

| ID | Requirement | Priority |
|----|-------------|----------|
| FM-01 | Create new intake forms with unique shareable URLs | P0 |
| FM-02 | List all active intake forms | P0 |
| FM-03 | Delete/archive completed forms | P1 |
| FM-04 | Form auto-save every 5 seconds | P0 |
| FM-05 | Form status tracking (draft, in-progress, complete, submitted) | P1 |

### 5.2 Intake Form Fields

Based on Loxo API requirements:

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | text | Yes | Min 2 characters |
| Email | email | Yes | Valid email format |
| Phone | tel | No | E.164 format |
| LinkedIn URL | url | No | Valid LinkedIn URL |
| Current Title | text | No | - |
| Current Company | text | No | - |
| Location (City) | text | No | - |
| Location (State) | text | No | - |
| Location (Country) | text | No | - |
| Description/Notes | textarea | No | Max 5000 chars |
| Tags/Skills | multi-select | No | - |
| Resume | file | No | PDF, DOC, DOCX, max 10MB |
| Source | select | No | From Loxo source_types |
| Compensation | number | No | Positive number |
| Compensation Notes | text | No | - |

### 5.3 Real-time Collaboration

| ID | Requirement | Priority |
|----|-------------|----------|
| RT-01 | Show active collaborators on the form | P0 |
| RT-02 | Field-level locking while another user is editing | P1 |
| RT-03 | Visual indicator of remote changes | P0 |
| RT-04 | Cursor presence (show where others are typing) | P2 |
| RT-05 | Conflict resolution for simultaneous edits | P1 |

### 5.4 Loxo Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| LX-01 | Submit validated form data to Loxo People API | P0 |
| LX-02 | Handle and display API errors | P0 |
| LX-03 | Store Loxo person ID after successful submission | P1 |
| LX-04 | Prevent duplicate submissions | P0 |
| LX-05 | Resume upload to Loxo (if provided) | P2 |

### 5.5 Validation

| ID | Requirement | Priority |
|----|-------------|----------|
| VL-01 | Client-side validation with immediate feedback | P0 |
| VL-02 | Server-side validation before Loxo submission | P0 |
| VL-03 | Email format validation | P0 |
| VL-04 | Phone number format validation | P1 |
| VL-05 | URL validation for LinkedIn/website | P1 |
| VL-06 | Required field enforcement | P0 |

---

## 6. Non-Functional Requirements

### 6.1 Performance
- Initial page load under 2 seconds
- Real-time sync latency under 100ms
- Support 50 concurrent forms
- Support 10 concurrent editors per form

### 6.2 Security
- API key stored in environment variables (server-side only)
- No client-side exposure of Loxo credentials
- Input sanitization to prevent XSS
- CSRF protection

### 6.3 Reliability
- Automatic reconnection on WebSocket disconnect
- Offline form data preservation
- Graceful degradation without real-time features

### 6.4 Scalability
- Horizontal scaling via Socket.IO adapters
- MongoDB replica set support
- Stateless application design

---

## 7. Technical Architecture

### 7.1 Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS |
| Real-time | Socket.IO |
| Database | MongoDB |
| State Management | React hooks + Socket.IO events |
| Validation | Zod |
| API Client | Axios |

### 7.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                                │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  React/Next.js  │  │  Socket.IO     │  │   Form UI    │ │
│  │    Frontend     │←→│    Client      │  │  Components  │ │
│  └────────┬────────┘  └───────┬────────┘  └──────────────┘ │
└───────────┼───────────────────┼─────────────────────────────┘
            │                   │
            │ HTTP              │ WebSocket
            ▼                   ▼
┌───────────────────────────────────────────────────────────────┐
│                     Next.js Server                             │
│  ┌────────────────┐  ┌────────────────┐  ┌─────────────────┐ │
│  │  API Routes    │  │  Socket.IO     │  │  Server Actions │ │
│  │  /api/forms    │  │    Server      │  │  (Validation)   │ │
│  └───────┬────────┘  └───────┬────────┘  └────────┬────────┘ │
└──────────┼───────────────────┼───────────────────┼───────────┘
           │                   │                    │
           ▼                   ▼                    ▼
┌─────────────────┐  ┌─────────────────┐   ┌──────────────────┐
│    MongoDB      │  │   Room State    │   │    Loxo API      │
│   (Persistence) │  │   (In-Memory)   │   │  (Submission)    │
└─────────────────┘  └─────────────────┘   └──────────────────┘
```

### 7.3 Data Flow

1. **Form Creation**
   - User creates form → API generates unique ID → Stored in MongoDB
   - Returns shareable URL

2. **Real-time Editing**
   - User joins form → Socket.IO joins room
   - User edits field → Emit to room → Broadcast to others
   - Periodic auto-save to MongoDB

3. **Submission**
   - User clicks submit → Server-side validation
   - Valid → POST to Loxo API → Update form status
   - Invalid → Return errors → Display to user

### 7.4 Database Schema

```typescript
// IntakeForm Collection
{
  _id: ObjectId,
  formId: string,           // UUID for URL
  status: 'draft' | 'in_progress' | 'complete' | 'submitted',
  loxoPersonId: number | null,
  createdAt: Date,
  updatedAt: Date,
  submittedAt: Date | null,
  data: {
    name: string,
    email: string,
    phone: string,
    linkedinUrl: string,
    title: string,
    company: string,
    city: string,
    state: string,
    country: string,
    description: string,
    tags: string[],
    sourceTypeId: number,
    compensation: number,
    compensationNotes: string
  },
  collaborators: [{
    odId: string,           // Socket ID
    joinedAt: Date,
    lastActiveAt: Date
  }]
}
```

---

## 8. User Interface

### 8.1 Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Dashboard with form list and create button |
| Form Editor | `/form/[formId]` | Real-time collaborative form |
| Success | `/form/[formId]/success` | Post-submission confirmation |

### 8.2 UI Components

- **FormHeader**: Form title, status badge, collaborator avatars
- **FormField**: Individual field with label, input, validation
- **CollaboratorPresence**: Shows active users
- **SubmitPanel**: Validation status, submit button
- **StatusBadge**: Visual status indicator
- **Toast/Notifications**: Real-time update notifications

### 8.3 Design Principles

- Clean, professional aesthetic suitable for recruitment
- Clear visual hierarchy
- Obvious validation feedback
- Responsive (desktop-first, mobile-friendly)
- Dark mode support

---

## 9. API Endpoints

### Internal API (Next.js)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/forms` | List all forms |
| POST | `/api/forms` | Create new form |
| GET | `/api/forms/[formId]` | Get form data |
| PUT | `/api/forms/[formId]` | Update form data |
| DELETE | `/api/forms/[formId]` | Delete form |
| POST | `/api/forms/[formId]/submit` | Validate and submit to Loxo |

### Socket.IO Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join-form` | Client→Server | `{ formId }` | Join form room |
| `leave-form` | Client→Server | `{ formId }` | Leave form room |
| `field-update` | Client→Server | `{ formId, field, value }` | Field change |
| `field-updated` | Server→Room | `{ field, value, userId }` | Broadcast change |
| `field-lock` | Client→Server | `{ formId, field }` | Lock field |
| `field-locked` | Server→Room | `{ field, userId }` | Broadcast lock |
| `field-unlock` | Client→Server | `{ formId, field }` | Unlock field |
| `collaborators` | Server→Client | `[{ id, joinedAt }]` | Active users |
| `user-joined` | Server→Room | `{ userId }` | New collaborator |
| `user-left` | Server→Room | `{ userId }` | Collaborator left |

---

## 10. Implementation Phases

### Phase 1: Foundation (Days 1-2)
- [ ] Project setup (Next.js, TypeScript, Tailwind)
- [ ] MongoDB connection and schema
- [ ] Basic form CRUD API routes
- [ ] Form UI components (no real-time)

### Phase 2: Real-time (Days 3-4)
- [ ] Socket.IO server setup
- [ ] Socket.IO client integration
- [ ] Real-time field syncing
- [ ] Collaborator presence

### Phase 3: Loxo Integration (Day 5)
- [ ] Loxo API client
- [ ] Form validation with Zod
- [ ] Submit flow with error handling
- [ ] Success state management

### Phase 4: Polish (Day 6)
- [ ] UI refinements
- [ ] Error handling improvements
- [ ] Testing
- [ ] Documentation

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Socket.IO connection issues | High | Implement reconnection logic, fallback to polling |
| Loxo API failures | Medium | Queue failed submissions, retry logic |
| Data conflicts | Medium | Last-write-wins with field-level timestamps |
| Performance with many users | Medium | Debounce updates, optimize renders |

---

## 12. Out of Scope (v1.0)

- User authentication/authorization
- Form templates
- Bulk import
- Loxo job association
- Email notifications
- Form versioning/history
- Advanced conflict resolution (CRDT)

---

## 13. Success Criteria

1. ✅ Two users can edit the same form and see real-time updates
2. ✅ Form data persists across browser refreshes
3. ✅ Validated form successfully creates a Person in Loxo
4. ✅ Invalid forms show clear error messages
5. ✅ Application handles WebSocket disconnects gracefully

---

## 14. References

- [Loxo API Documentation](https://loxo.readme.io/reference/loxo-api)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/)

