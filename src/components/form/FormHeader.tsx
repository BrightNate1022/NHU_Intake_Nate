'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { CollaboratorPresence } from './CollaboratorPresence';
import type { FormStatus, Collaborator } from '@/types';

interface FormHeaderProps {
  status: FormStatus;
  collaborators: Collaborator[];
  currentUserId?: string;
  isConnected: boolean;
}

export function FormHeader({ status, collaborators, currentUserId, isConnected }: FormHeaderProps) {
  return (
    <header className="header">
      <div className="header-inner" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link 
            href="/" 
            className="btn-ghost btn-sm"
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <div style={{ width: '1px', height: '28px', backgroundColor: 'var(--stone-200)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <h1 style={{ 
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--stone-800)',
              margin: 0,
              fontFamily: "'Crimson Pro', Georgia, serif",
              letterSpacing: '-0.01em'
            }}>
              Candidate Intake
            </h1>
            <Badge status={status} />
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <CollaboratorPresence 
            collaborators={collaborators}
            currentUserId={currentUserId}
          />
          <div className="status-indicator">
            <div className={`status-dot ${!isConnected ? 'disconnected' : ''}`} />
            <span style={{ color: isConnected ? 'var(--success)' : 'var(--stone-400)' }}>
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
