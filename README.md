# HireU Intake

A real-time collaborative candidate intake form application built with Next.js, MongoDB, and Socket.IO. Multiple team members can simultaneously edit forms, with changes synced instantly across all connected clients.

## Features

- **Real-time Collaboration**: Multiple users can edit the same form simultaneously
- **Live Presence**: See who else is editing the form
- **Field Locking**: Prevents conflicts when two users edit the same field
- **Auto-save**: Changes are saved automatically as you type
- **Loxo Integration**: Submit validated candidate data directly to Loxo ATS
- **Modern UI**: Beautiful, professional design with smooth animations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Real-time**: Socket.IO
- **Database**: MongoDB
- **Validation**: Zod
- **API Client**: Axios

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Loxo API credentials

## Setup

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create a `.env.local` file:
   ```env
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/hireu-intake

   # Loxo API
   LOXO_API_BASE_URL=https://app.loxo.co/api
   LOXO_AGENCY_SLUG=agencies/YOUR_AGENCY_ID
   LOXO_API_KEY=your_api_key_here

   # Socket.IO
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

## Running the Application

### Development Mode

You need to run both the Next.js dev server and the Socket.IO server in separate terminals:

**Terminal 1 - Next.js** (Port 3000):
```bash
npm run dev
```

**Terminal 2 - Socket.IO** (Port 3001):
```bash
npm run dev:socket
```

The app will be available at `http://localhost:3000`
Socket.IO server runs on `http://localhost:3001`

> **Note**: Make sure MongoDB is running locally or update `MONGODB_URI` in `.env.local` to point to your MongoDB Atlas cluster.

### Production Mode

Build and run with the combined server:
```bash
npm run build
npm run start:all
```

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API routes
│   │   └── forms/       # Form CRUD endpoints
│   ├── form/            # Form editor pages
│   └── page.tsx         # Homepage/dashboard
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── form/           # Form-specific components
├── hooks/              # Custom React hooks
│   └── useSocket.ts    # Socket.IO hook
├── lib/                # Utilities
│   ├── db/             # MongoDB connection
│   ├── loxo/           # Loxo API client
│   ├── socket/         # Socket.IO server
│   └── validation/     # Zod schemas
└── types/              # TypeScript types
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/forms` | List all forms |
| POST | `/api/forms` | Create new form |
| GET | `/api/forms/[formId]` | Get single form |
| PUT | `/api/forms/[formId]` | Update form |
| DELETE | `/api/forms/[formId]` | Delete form |
| POST | `/api/forms/[formId]/submit` | Submit to Loxo |

## Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-form` | Client→Server | Join form room |
| `leave-form` | Client→Server | Leave form room |
| `field-update` | Client→Server | Update field value |
| `field-updated` | Server→Room | Broadcast field change |
| `field-lock` | Client→Server | Lock field for editing |
| `field-unlock` | Client→Server | Unlock field |
| `collaborators` | Server→Client | Active users list |

## Form Fields

| Field | Type | Required |
|-------|------|----------|
| Full Name | text | Yes |
| Email | email | Yes |
| Phone | tel | No |
| LinkedIn URL | url | No |
| Current Title | text | No |
| Current Company | text | No |
| City/State/Country | text | No |
| Description | textarea | No |
| Tags/Skills | array | No |
| Compensation | number | No |

## License

MIT
# NHU_Intake_Nate
