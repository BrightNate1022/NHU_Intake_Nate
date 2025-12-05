# HireU Intake Form - Implementation TODO

## Phase 1: Project Setup & Foundation

### 1.1 Initial Setup
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS
- [ ] Set up project directory structure
- [ ] Create environment variables file (.env.local)
- [ ] Set up ESLint and Prettier configuration
- [ ] Create README.md with setup instructions

### 1.2 Database Setup
- [ ] Set up MongoDB connection utility
- [ ] Create IntakeForm schema/types
- [ ] Implement database connection pooling
- [ ] Create seed data for development

### 1.3 API Routes - Forms CRUD
- [ ] POST /api/forms - Create new intake form
- [ ] GET /api/forms - List all forms
- [ ] GET /api/forms/[formId] - Get single form
- [ ] PUT /api/forms/[formId] - Update form data
- [ ] DELETE /api/forms/[formId] - Delete form

### 1.4 UI Foundation
- [ ] Create root layout with global styles
- [ ] Build homepage with form list
- [ ] Create "New Form" button and flow
- [ ] Build form page layout structure
- [ ] Create form field components
  - [ ] TextInput
  - [ ] EmailInput
  - [ ] PhoneInput
  - [ ] URLInput
  - [ ] TextArea
  - [ ] Select
  - [ ] MultiSelect (tags)
  - [ ] FileUpload
- [ ] Build form header component
- [ ] Build form footer with submit button

---

## Phase 2: Real-time Collaboration

### 2.1 Socket.IO Server Setup
- [ ] Install Socket.IO dependencies
- [ ] Create custom server for Socket.IO
- [ ] Configure Socket.IO with Next.js
- [ ] Implement form room management
  - [ ] join-form event handler
  - [ ] leave-form event handler
  - [ ] disconnect handler

### 2.2 Socket.IO Events - Field Sync
- [ ] Implement field-update event (client → server)
- [ ] Implement field-updated broadcast (server → room)
- [ ] Add debouncing for rapid field updates
- [ ] Handle concurrent edits

### 2.3 Socket.IO Events - Field Locking
- [ ] Implement field-lock event
- [ ] Implement field-unlock event
- [ ] Track locked fields per form
- [ ] Auto-unlock on user disconnect

### 2.4 Collaborator Presence
- [ ] Track active collaborators per form
- [ ] Implement user-joined event
- [ ] Implement user-left event
- [ ] Build presence UI component
- [ ] Show collaborator avatars/indicators

### 2.5 Client Integration
- [ ] Create Socket.IO client hook (useSocket)
- [ ] Create form sync hook (useFormSync)
- [ ] Integrate with form field components
- [ ] Add visual indicators for remote changes
- [ ] Implement reconnection handling

---

## Phase 3: Loxo Integration

### 3.1 Loxo API Client
- [ ] Create Loxo API client utility
- [ ] Implement createPerson function
- [ ] Implement error handling for API calls
- [ ] Add retry logic for failed requests
- [ ] Create types for Loxo API responses

### 3.2 Form Validation
- [ ] Create Zod schema for intake form
- [ ] Implement client-side validation
- [ ] Implement server-side validation
- [ ] Add validation error display
- [ ] Create validation summary component

### 3.3 Submit Flow
- [ ] POST /api/forms/[formId]/submit endpoint
- [ ] Validate form data server-side
- [ ] Transform form data to Loxo format
- [ ] Call Loxo People API
- [ ] Handle success response
- [ ] Handle error response
- [ ] Update form status in MongoDB
- [ ] Store Loxo person ID

### 3.4 Success State
- [ ] Create success page/modal
- [ ] Show Loxo person ID
- [ ] Prevent duplicate submissions
- [ ] Add "Create Another" option

---

## Phase 4: UI & UX Polish

### 4.1 Design Refinements
- [ ] Implement consistent color scheme
- [ ] Add loading states/skeletons
- [ ] Add transitions and animations
- [ ] Implement toast notifications
- [ ] Add dark mode support
- [ ] Mobile responsiveness

### 4.2 Error Handling
- [ ] Global error boundary
- [ ] API error toast messages
- [ ] WebSocket error handling
- [ ] Offline state handling
- [ ] Retry UI for failed operations

### 4.3 Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader labels
- [ ] Focus management
- [ ] ARIA attributes

### 4.4 Performance
- [ ] Debounce form updates
- [ ] Optimize re-renders
- [ ] Lazy load components
- [ ] Image optimization (if needed)

---

## Phase 5: Testing & Documentation

### 5.1 Testing
- [ ] Unit tests for validation
- [ ] Integration tests for API routes
- [ ] E2E tests for form flow
- [ ] Real-time sync testing

### 5.2 Documentation
- [ ] Update README with full instructions
- [ ] Document environment variables
- [ ] API documentation
- [ ] Deployment guide

---

## File Structure

```
hireuIntake/
├── docs/
│   ├── LOXO_API.md
│   ├── PRD.md
│   └── TODO.md
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── form/
│   │   │   └── [formId]/
│   │   │       ├── page.tsx
│   │   │       └── success/
│   │   │           └── page.tsx
│   │   └── api/
│   │       ├── forms/
│   │       │   ├── route.ts
│   │       │   └── [formId]/
│   │       │       ├── route.ts
│   │       │       └── submit/
│   │       │           └── route.ts
│   │       └── socket/
│   │           └── route.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Toast.tsx
│   │   ├── form/
│   │   │   ├── FormField.tsx
│   │   │   ├── FormHeader.tsx
│   │   │   ├── FormFooter.tsx
│   │   │   ├── CollaboratorPresence.tsx
│   │   │   └── ValidationSummary.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── FormList.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── mongodb.ts
│   │   │   └── models/
│   │   │       └── IntakeForm.ts
│   │   ├── loxo/
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   ├── socket/
│   │   │   ├── server.ts
│   │   │   └── events.ts
│   │   └── validation/
│   │       └── schema.ts
│   ├── hooks/
│   │   ├── useSocket.ts
│   │   ├── useFormSync.ts
│   │   └── useFormValidation.ts
│   └── types/
│       └── index.ts
├── server.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── .env.local
```

---

## Environment Variables

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/hireu-intake

# Loxo API
LOXO_API_BASE_URL=https://app.loxo.co/api
LOXO_AGENCY_SLUG=agencies/4134
LOXO_API_KEY=ccbb77facc3cf6482bfac9bec96d1efa12347c28281efd4e5f5371aa4d75ec30459c606d8b5b151f92f5e3bceed137d3b0ac6b6181c101fb528ac06f8ad227e53b3c6d77c47c6f56093da041fb4473cc242d8232ac436ffa1fccc4baee93296ec8c1ebbc69f2927524e33102f9ad6b1590064bc3585f4b6377044b29fd482689

# Socket.IO
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

---

## Quick Start Commands

```bash
# Initialize project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir

# Install dependencies
npm install mongodb socket.io socket.io-client zod axios uuid
npm install -D @types/uuid

# Run development
npm run dev

# Run with custom server (for Socket.IO)
npx ts-node server.ts
```

