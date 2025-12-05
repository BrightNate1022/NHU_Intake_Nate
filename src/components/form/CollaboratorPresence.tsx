'use client';

import type { Collaborator } from '@/types';

interface CollaboratorPresenceProps {
  collaborators: Collaborator[];
  currentUserId?: string;
}

export function CollaboratorPresence({ collaborators, currentUserId }: CollaboratorPresenceProps) {
  // Filter out current user and limit to show max 5
  const otherCollaborators = collaborators.filter(c => c.odId !== currentUserId);
  const displayedCollaborators = otherCollaborators.slice(0, 5);
  const remainingCount = otherCollaborators.length - 5;

  if (otherCollaborators.length === 0) {
    return (
      <div 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.8125rem',
          color: 'var(--stone-500)'
        }}
      >
        <div 
          style={{ 
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--success)'
          }}
        />
        <span>Just you</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {displayedCollaborators.map((collaborator, index) => (
          <div
            key={collaborator.odId}
            className="collaborator-avatar"
            style={{ 
              backgroundColor: collaborator.color || '#6366f1',
              zIndex: displayedCollaborators.length - index,
              marginLeft: index > 0 ? '-8px' : 0
            }}
            title={`Collaborator ${index + 1}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        ))}
        {remainingCount > 0 && (
          <div 
            className="collaborator-avatar"
            style={{ backgroundColor: 'var(--stone-400)', zIndex: 0, marginLeft: '-8px' }}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      <span style={{ fontSize: '0.8125rem', color: 'var(--stone-600)' }}>
        {otherCollaborators.length} {otherCollaborators.length === 1 ? 'collaborator' : 'collaborators'} editing
      </span>
    </div>
  );
}
