import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--stone-50)' }}
    >
      <div className="text-center max-w-md">
        <div 
          style={{ 
            width: '80px',
            height: '80px',
            margin: '0 auto 24px auto',
            borderRadius: '50%',
            backgroundColor: 'var(--stone-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            style={{ color: 'var(--stone-400)' }}
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        
        <h1 
          className="mb-3"
          style={{ 
            fontSize: '3rem',
            fontWeight: 600,
            color: 'var(--purple-600)',
            fontFamily: "'Crimson Pro', Georgia, serif"
          }}
        >
          404
        </h1>
        <h2 
          className="mb-4"
          style={{ 
            fontSize: '1.5rem',
            fontWeight: 500,
            color: 'var(--purple-700)',
            fontFamily: "'Crimson Pro', Georgia, serif"
          }}
        >
          Form Not Found
        </h2>
        <p 
          className="mb-8"
          style={{ 
            color: 'var(--stone-500)',
            fontSize: '1rem',
            lineHeight: 1.6
          }}
        >
          The form you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        
        <Link href="/">
          <Button>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
