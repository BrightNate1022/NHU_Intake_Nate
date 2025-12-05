'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HiringIntakeFormEditor } from '@/components/form/HiringIntakeFormEditor';
import type { HiringIntakeForm } from '@/types';

export default function HiringFormPage() {
  const params = useParams();
  const formId = params.formId as string;
  const [form, setForm] = useState<HiringIntakeForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`/api/hiring-forms/${formId}`);
        const data = await response.json();

        if (!response.ok) {
          // If form doesn't exist, create a new one
          if (response.status === 404) {
            const createResponse = await fetch('/api/hiring-forms', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ formId }),
            });
            const createData = await createResponse.json();
            
            if (createResponse.ok) {
              setForm(createData.data);
            } else {
              setError(createData.error || 'Failed to create form');
            }
          } else {
            setError(data.error || 'Failed to load form');
          }
        } else {
          setForm(data.data);
        }
      } catch {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }

    if (formId) {
      fetchForm();
    }
  }, [formId]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--stone-50)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--stone-200)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--stone-500)' }}>Loading hiring intake form...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--stone-50)'
      }}>
        <div style={{ 
          textAlign: 'center',
          padding: '48px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 style={{ margin: '0 0 8px', color: 'var(--stone-900)' }}>Error Loading Form</h2>
          <p style={{ color: 'var(--stone-500)', margin: 0 }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!form) {
    return null;
  }

  return <HiringIntakeFormEditor initialForm={form} />;
}

