'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Toast } from '@/components/ui/Toast';
import type { HiringIntakeForm } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const [forms, setForms] = useState<HiringIntakeForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/hiring-forms');
      const data = await response.json();
      if (data.success) {
        setForms(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error);
      setToast({ message: 'Failed to load forms', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewForm = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/hiring-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (data.success) {
        router.push(`/hiring/${data.data.formId}`);
      } else {
        setToast({ message: 'Failed to create form', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to create form:', error);
      setToast({ message: 'Failed to create form', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this intake?')) return;
    
    try {
      const response = await fetch(`/api/hiring-forms/${formId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setForms(forms.filter(f => f.formId !== formId));
        setToast({ message: 'Intake deleted successfully', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to delete form:', error);
      setToast({ message: 'Failed to delete intake', type: 'error' });
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--stone-50)' }}>
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
              boxShadow: '0 4px 14px -4px rgba(168, 85, 247, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }} className="text-gradient">
                HireU Intake
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#78716c', margin: 0 }}>
                Job requisition intake forms
              </p>
            </div>
          </div>
          <Button onClick={createNewForm} loading={isCreating}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Hiring Intake
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', padding: '48px 32px', width: '100%' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-in">
          <h2 style={{ 
            fontSize: '3rem', 
            fontWeight: 700, 
            marginBottom: '16px',
            color: '#292524'
          }}>
            Streamline Your <span className="text-gradient">Hiring Intake</span>
          </h2>
          <p style={{ 
            fontSize: '1.125rem', 
            maxWidth: '640px', 
            margin: '0 auto',
            color: '#57534e',
            lineHeight: 1.7
          }}>
            Create comprehensive job requisition forms with your clients. Collaborate in real-time, 
            capture every detail, and sync directly to Loxo.
          </p>
        </section>

        {/* Forms List */}
        <section>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#292524', margin: 0 }}>
              Recent Hiring Intakes
            </h3>
            <span style={{ fontSize: '0.875rem', color: '#78716c' }}>
              {forms.length} {forms.length === 1 ? 'intake' : 'intakes'}
            </span>
          </div>

          {isLoading ? (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="card-elevated" style={{ padding: '24px' }}>
                  <div className="skeleton" style={{ height: '24px', width: '75%', marginBottom: '16px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '50%', marginBottom: '8px' }} />
                  <div className="skeleton" style={{ height: '16px', width: '66%' }} />
                </div>
              ))}
            </div>
          ) : forms.length === 0 ? (
            <div style={{ 
              textAlign: 'center',
              padding: '64px 32px',
              borderRadius: '16px',
              border: '2px dashed #e7e5e4',
              background: 'rgba(255,255,255,0.5)'
            }}>
              <div style={{ 
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                borderRadius: '50%',
                background: '#f5f5f4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#44403c' }}>
                No hiring intakes yet
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#78716c', marginBottom: '24px' }}>
                Start your first client intake meeting
              </p>
              <Button onClick={createNewForm} loading={isCreating}>
                Create First Intake
              </Button>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {forms.map((form, index) => (
                <div 
                  key={form.formId}
                  className="card-elevated animate-fade-in"
                  style={{ 
                    padding: '24px',
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <Badge status={form.status} />
                    <button
                      onClick={() => deleteForm(form.formId)}
                      style={{ 
                        padding: '8px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#a8a29e',
                        transition: 'all 0.2s'
                      }}
                      title="Delete form"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  
                  <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '4px', color: '#292524' }}>
                    {form.data.jobTitle || 'Untitled Position'}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: '#57534e', marginBottom: '4px' }}>
                    {form.data.clientCompany?.name || 'No company'}
                  </p>
                  {form.data.clientCompany?.contactName && (
                    <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
                      Contact: {form.data.clientCompany.contactName}
                    </p>
                  )}
                  
                  <div style={{ 
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f5f5f4',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontSize: '0.75rem', color: '#a8a29e' }}>
                      Updated {formatDate(form.updatedAt)}
                    </span>
                    <Link
                      href={`/hiring/${form.formId}`}
                      style={{ 
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#9333ea',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {form.status === 'submitted' ? 'View' : 'Edit'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Features Section */}
        <section style={{ 
          marginTop: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px'
        }}>
          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <div style={{ 
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              background: '#f3e8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#292524' }}>
              Real-time Collaboration
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#57534e', lineHeight: 1.6 }}>
              Work with clients live during intake calls
            </p>
          </div>

          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <div style={{ 
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="9" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="12" y2="17" />
              </svg>
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#292524' }}>
              Comprehensive Intake
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#57534e', lineHeight: 1.6 }}>
              Capture all 10 sections: compensation, timeline, skills, and more
            </p>
          </div>

          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <div style={{ 
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '12px',
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', color: '#292524' }}>
              Direct Loxo Integration
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#57534e', lineHeight: 1.6 }}>
              Create jobs in Loxo with one click
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid #e7e5e4',
        marginTop: 'auto'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
            HireU Intake • Built for modern recruitment teams
          </p>
        </div>
      </footer>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
