'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { TagInput } from '@/components/ui/TagInput';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { CollaboratorPresence } from './CollaboratorPresence';
import type { HiringIntakeFormData, HiringIntakeForm, FormStatus, Collaborator } from '@/types';

// Default empty form data
const defaultHiringIntakeFormData: HiringIntakeFormData = {
  clientCompany: {
    name: '',
    address: {},
    contactName: '',
    contacts: [],
    feeStructure: { rawString: '' },
  },
  meetingDate: '',
  jobTitle: '',
};

interface HiringIntakeFormEditorProps {
  initialForm: HiringIntakeForm;
}

// Generate a random user color
const getRandomColor = () => {
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Generate anonymous user name
const getAnonName = () => `User ${Math.floor(Math.random() * 9000) + 1000}`;

export function HiringIntakeFormEditor({ initialForm }: HiringIntakeFormEditorProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<HiringIntakeFormData>(
    initialForm.data || defaultHiringIntakeFormData
  );
  const [_status, setStatus] = useState<FormStatus>(initialForm.status);
  const [loxoJobId, setLoxoJobId] = useState<number | null | undefined>(initialForm.loxoJobId);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<string>('client');
  
  // Real-time collaboration state
  const socketRef = useRef<Socket | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const userRef = useRef({ name: getAnonName(), color: getRandomColor() });
  const isRemoteUpdate = useRef(false);
  
  // Auto-save debounce ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const formDataRef = useRef(formData);

  // Keep formDataRef in sync
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Socket.IO connection for real-time collaboration
  useEffect(() => {
    // Connect to same origin - Socket.IO is on the same server
    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      socket.emit('join-hiring-form', {
        formId: initialForm.formId,
        user: userRef.current,
      });
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
      setIsConnected(false);
    });

    // Receive collaborators list
    socket.on('collaborators-update', (users: Collaborator[]) => {
      setCollaborators(users.filter(u => u.odId !== socket.id));
    });

    // Receive form updates from other users
    socket.on('form-update', (data: { formData: HiringIntakeFormData; user: string }) => {
      if (data.user !== userRef.current.name) {
        console.log('Received form update from:', data.user);
        isRemoteUpdate.current = true;
        setFormData(data.formData);
        setLastSaved(new Date());
        setTimeout(() => { isRemoteUpdate.current = false; }, 100);
      }
    });

    // Receive initial form data when joining
    socket.on('form-data', (data: HiringIntakeFormData) => {
      console.log('Received initial form data');
      isRemoteUpdate.current = true;
      setFormData(data);
      setTimeout(() => { isRemoteUpdate.current = false; }, 100);
    });

    // User joined notification
    socket.on('user-joined', ({ name }) => {
      if (name) {
        setToast({ message: `${name} joined`, type: 'info' });
      }
    });

    // User left notification
    socket.on('user-left', ({ name }) => {
      if (name) {
        setToast({ message: `${name} left`, type: 'info' });
      }
    });

    return () => {
      socket.emit('leave-hiring-form', { formId: initialForm.formId });
      socket.disconnect();
    };
  }, [initialForm.formId]);

  // Broadcast form changes to collaborators
  const broadcastChange = useCallback((newData: HiringIntakeFormData) => {
    if (socketRef.current?.connected && !isRemoteUpdate.current) {
      socketRef.current.emit('form-change', {
        formId: initialForm.formId,
        formData: newData,
        user: userRef.current.name,
      });
    }
  }, [initialForm.formId]);

  // Auto-save to MongoDB (debounced) - only if not connected to socket (socket saves automatically)
  const autoSave = useCallback(async () => {
    // Skip auto-save if socket is connected (socket server handles saves)
    if (socketRef.current?.connected) {
      setLastSaved(new Date());
      return;
    }
    
    try {
      const response = await fetch(`/api/hiring-forms/${initialForm.formId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formDataRef.current }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(data.data.status);
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  }, [initialForm.formId]);

  // Trigger auto-save on form data change (debounced 1.5s)
  useEffect(() => {
    // Don't trigger auto-save for remote updates
    if (isRemoteUpdate.current) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [formData, autoSave]);

  // Update nested field helper
  const updateField = <T extends keyof HiringIntakeFormData>(
    field: T,
    value: HiringIntakeFormData[T]
  ) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      broadcastChange(newData);
      return newData;
    });
  };

  // Update deeply nested field helper
  const updateNestedField = (path: string, value: unknown) => {
    setFormData(prev => {
      const newData = { ...prev };
      const parts = path.split('.');
      let current: Record<string, unknown> = newData;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part] || typeof current[part] !== 'object') {
          current[part] = {};
        }
        current[part] = { ...(current[part] as Record<string, unknown>) };
        current = current[part] as Record<string, unknown>;
      }
      
      current[parts[parts.length - 1]] = value;
      broadcastChange(newData);
      return newData;
    });
  };

  // Manual save to MongoDB
  const handleSave = async () => {
    setIsSaving(true);
    setErrors({});

    // Cancel any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    try {
      const response = await fetch(`/api/hiring-forms/${initialForm.formId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setToast({ message: data.error || 'Failed to save', type: 'error' });
        return;
      }

      setStatus(data.data.status);
      setLastSaved(new Date());
      setToast({ message: 'Draft saved', type: 'success' });
    } catch (error) {
      console.error('Save error:', error);
      setToast({ message: 'Failed to save form', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  // Sync to Loxo
  const handleSyncToLoxo = async () => {
    setIsSyncing(true);
    setErrors({});

    try {
      // First save
      await fetch(`/api/hiring-forms/${initialForm.formId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData }),
      });

      // Then sync to Loxo
      const response = await fetch(`/api/hiring-forms/${initialForm.formId}/sync`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((detail: { field: string; message: string }) => {
            fieldErrors[detail.field] = detail.message;
          });
          setErrors(fieldErrors);
          setToast({ message: 'Please fix the validation errors', type: 'error' });
        } else {
          setToast({ message: data.error || 'Sync failed', type: 'error' });
        }
        return;
      }

      setStatus('submitted');
      setLoxoJobId(data.data.jobId);
      setLastSaved(new Date());

      const actionText = data.data.action === 'created' ? 'Created' : 'Updated';
      setToast({ 
        message: `${actionText} in Loxo! Job ID: ${data.data.jobId}`, 
        type: 'success' 
      });
    } catch (error) {
      console.error('Sync error:', error);
      setToast({ message: 'Failed to sync to Loxo', type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  const isSyncedToLoxo = !!loxoJobId;

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 5) return 'Saved just now';
    if (diff < 60) return `Saved ${diff}s ago`;
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved at ${lastSaved.toLocaleTimeString()}`;
  };

  // Section navigation - no emojis, clean labels
  const sections = [
    { id: 'client', label: '1. Client Info' },
    { id: 'background', label: '2. Background' },
    { id: 'skills', label: '3. Skills' },
    { id: 'sourcing', label: '4. Sourcing' },
    { id: 'compensation', label: '5. Compensation' },
    { id: 'recruiting', label: '6. Recruiting' },
    { id: 'timeline', label: '7. Timeline' },
    { id: 'working', label: '8. Working Together' },
    { id: 'next', label: '9. Next Steps' },
    { id: 'completion', label: '10. Completion' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fa' }}>
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Sidebar Navigation */}
        <nav style={{ 
          width: '220px', 
          padding: '20px 12px', 
          position: 'sticky', 
          top: 0, 
          height: '100vh',
          overflowY: 'auto',
          background: '#fff',
          borderRight: '1px solid #e5e7eb'
        }}>
          {/* Title in sidebar */}
          <div style={{ padding: '8px 12px 16px', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
            <h1 style={{ 
              fontSize: '1rem', 
              fontWeight: 600, 
              margin: 0,
              color: '#111827'
            }}>
              Hiring Intake
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>
              {formData.clientCompany?.name || 'New Client'}
            </p>
            {/* Connection status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isConnected ? '#22c55e' : '#ef4444',
              }} />
              <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                {isConnected ? 'Live sync enabled' : 'Offline'}
              </span>
            </div>
            {/* Collaborators */}
            {collaborators.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <CollaboratorPresence collaborators={collaborators} />
              </div>
            )}
          </div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '8px 12px', marginBottom: '4px' }}>
            Sections
          </div>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                display: 'block',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '2px',
                border: 'none',
                borderRadius: '6px',
                background: activeSection === section.id ? '#7c3aed' : 'transparent',
                color: activeSection === section.id ? '#ffffff' : '#374151',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: activeSection === section.id ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (activeSection !== section.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {/* Main Form Content */}
        <main style={{ flex: 1, padding: '24px 32px 80px', background: '#f8f9fa' }}>
          
          {/* SECTION 1: Client/Company Information */}
          <section id="section-client" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Client/Company Information
            </h2>
            
            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Client Company *"
                value={formData.clientCompany.name}
                onChange={(e) => updateNestedField('clientCompany.name', e.target.value)}
                placeholder="Stone, Glass & Connolly, LLP"
                error={errors['clientCompany.name']}
              />
              <Input
                label="Meeting Date *"
                type="date"
                value={formData.meetingDate}
                onChange={(e) => updateField('meetingDate', e.target.value)}
                error={errors.meetingDate}
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Client Contact"
                value={formData.clientCompany.contactName}
                onChange={(e) => updateNestedField('clientCompany.contactName', e.target.value)}
                placeholder="Marko/Andrew HAS 4 Daughters!"
              />
              <Input
                label="Fee Structure"
                value={formData.clientCompany.feeStructure.rawString}
                onChange={(e) => updateNestedField('clientCompany.feeStructure.rawString', e.target.value)}
                placeholder="20/22.5/25 Hire/45/90/135 $3500/$5500"
              />
            </div>

            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '24px', marginBottom: '12px', color: '#4b5563' }}>Address</h3>
            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Street Address"
                value={formData.clientCompany.address.street || ''}
                onChange={(e) => updateNestedField('clientCompany.address.street', e.target.value)}
                placeholder="18001 Old Cutler Road – Suite 457"
              />
              <Input
                label="City"
                value={formData.clientCompany.address.city || ''}
                onChange={(e) => updateNestedField('clientCompany.address.city', e.target.value)}
                placeholder="Palmetto Bay"
              />
            </div>
            <div className="form-grid form-grid-3">
              <Input
                label="State"
                value={formData.clientCompany.address.state || ''}
                onChange={(e) => updateNestedField('clientCompany.address.state', e.target.value)}
                placeholder="FL"
              />
              <Input
                label="Zip"
                value={formData.clientCompany.address.zip || ''}
                onChange={(e) => updateNestedField('clientCompany.address.zip', e.target.value)}
                placeholder="33157"
              />
              <Input
                label="Country"
                value={formData.clientCompany.address.country || ''}
                onChange={(e) => updateNestedField('clientCompany.address.country', e.target.value)}
                placeholder="USA"
              />
            </div>
          </section>

          {/* SECTION 2: Background */}
          <section id="section-background" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Background
            </h2>
            
            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Job Title *"
                value={formData.jobTitle}
                onChange={(e) => updateField('jobTitle', e.target.value)}
                placeholder="Premises Liability Attorney 3+ Years"
                error={errors.jobTitle}
              />
              <Input
                label="Target Start Date"
                value={formData.targetStartDate || ''}
                onChange={(e) => updateField('targetStartDate', e.target.value)}
                placeholder="ASAP"
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Level (Entry, Senior, Etc.)"
                value={formData.experienceLevel || ''}
                onChange={(e) => updateField('experienceLevel', e.target.value)}
                placeholder="3 yr. To 20 yrs experience"
              />
              <Input
                label="Direct Manager"
                value={formData.directManager || ''}
                onChange={(e) => updateField('directManager', e.target.value)}
                placeholder="Reports to Andrew"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TextArea
                label="Work Arrangement Details"
                value={formData.workArrangementDetails || ''}
                onChange={(e) => updateField('workArrangementDetails', e.target.value)}
                placeholder="Hybrid- 3 days in ofc for Assoc. Remote for a senior Atty."
                rows={2}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TextArea
                label="Reason for Hire (Filling A Gap, New Role Needs)"
                value={formData.reasonForHire || ''}
                onChange={(e) => updateField('reasonForHire', e.target.value)}
                placeholder="8,000 files in the queue needs passionate litigators to handle the caseload"
                rows={2}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TextArea
                label="What does Success Look Like?"
                value={formData.successCriteria || ''}
                onChange={(e) => updateField('successCriteria', e.target.value)}
                placeholder="It is clear to Mr. Stone early on who will work out who will not..."
                rows={3}
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Department"
                value={formData.department || ''}
                onChange={(e) => updateField('department', e.target.value)}
                placeholder="10 employees, 2 attorneys, 4 paralegals"
              />
              <Input
                label="Industry Experience Necessary?"
                value={formData.industryExperience || ''}
                onChange={(e) => updateField('industryExperience', e.target.value)}
                placeholder="Legal / Insurance Defense"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TextArea
                label="Job Overview"
                value={formData.jobOverview || ''}
                onChange={(e) => updateField('jobOverview', e.target.value)}
                placeholder="5+ years of experience in litigation (practice is premise liability, insurance defense) Required NO BILLABLE hours but expected that they will do the hours. $200/hour..."
                rows={4}
              />
            </div>

            <div>
              <TextArea
                label="Core Responsibilities/Competency"
                value={formData.coreResponsibilities || ''}
                onChange={(e) => updateField('coreResponsibilities', e.target.value)}
                placeholder="Writes very well, will provide a perfect summary judgment he doesn't need to review, will analyze cases..."
                rows={4}
              />
            </div>
          </section>

          {/* SECTION 3: Skills & Requirements */}
          <section id="section-skills" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Skills & Requirements
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <TagInput
                label="Required Skills"
                value={formData.requiredSkills || []}
                onChange={(tags) => updateField('requiredSkills', tags)}
                placeholder="Type a skill and press Enter (e.g., Passion for litigating)"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TagInput
                label="Nice-To-Have Skills"
                value={formData.niceToHaveSkills || []}
                onChange={(tags) => updateField('niceToHaveSkills', tags)}
                placeholder="Type a skill and press Enter..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TextArea
                label="Sample Career Trajectory"
                value={formData.sampleCareerTrajectory || ''}
                onChange={(e) => updateField('sampleCareerTrajectory', e.target.value)}
                placeholder="2-5 years with another insurance defense firm who is burned out by the numbers game and wants to get more involved in their cases..."
                rows={4}
              />
            </div>

            <div className="form-grid form-grid-2">
              <TextArea
                label="Without having this position filled, what is the result of having it open/(not filled):"
                value={formData.impactIfNotFilled || ''}
                onChange={(e) => updateField('impactIfNotFilled', e.target.value)}
                placeholder="Business impact of vacancy..."
                rows={3}
              />
              <TextArea
                label="What is the result of having the position filled?"
                value={formData.impactIfFilled || ''}
                onChange={(e) => updateField('impactIfFilled', e.target.value)}
                placeholder="Business benefit of hire..."
                rows={3}
              />
            </div>
          </section>

          {/* SECTION 4: Sourcing Criteria */}
          <section id="section-sourcing" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Company Overview / Sourcing Criteria
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <TagInput
                label="Target Companies"
                value={formData.targetCompanies || []}
                onChange={(tags) => updateField('targetCompanies', tags)}
                placeholder="Luks, Cole Scott, Quintairos, Boyd..."
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <TextArea
                label="Employees"
                value={formData.sourcingCriteria?.employees || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.employees', e.target.value)}
                placeholder="10 employees Candidate will be reporting and paid by STONE PA. Andrew + 2 attorneys"
                rows={2}
              />
              <TextArea
                label="Competitors"
                value={formData.sourcingCriteria?.competitors || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.competitors', e.target.value)}
                placeholder="Competitor companies..."
                rows={2}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <TextArea
                label="Personality traits necessary to be effective with the team (Emotional Quotient/Core Values)"
                value={formData.sourcingCriteria?.personalityTraits || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.personalityTraits', e.target.value)}
                placeholder="Coachable, dependable, takes pride in the QUALITY of their work..."
                rows={3}
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Do not touch"
                value={formData.sourcingCriteria?.doNotTouch || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.doNotTouch', e.target.value)}
                placeholder="None"
              />
              <Input
                label="DISC/IP desired profile (if applicable)"
                value={formData.sourcingCriteria?.discProfile || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.discProfile', e.target.value)}
                placeholder="DISC profile..."
              />
            </div>

            <div className="form-grid form-grid-2">
              <Input
                label="Any internal candidates to consider?"
                value={formData.sourcingCriteria?.internalCandidates || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.internalCandidates', e.target.value)}
                placeholder="Internal candidates..."
              />
              <Input
                label="Notes"
                value={formData.sourcingCriteria?.notes || ''}
                onChange={(e) => updateNestedField('sourcingCriteria.notes', e.target.value)}
                placeholder="Additional sourcing notes..."
              />
            </div>
          </section>

          {/* SECTION 5: Compensation */}
          <section id="section-compensation" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Compensation
            </h2>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Range"
                value={formData.compensation?.salaryRange || ''}
                onChange={(e) => updateNestedField('compensation.salaryRange', e.target.value)}
                placeholder="$100K to $200K"
              />
              <TextArea
                label="Bonus"
                value={formData.compensation?.bonus || ''}
                onChange={(e) => updateNestedField('compensation.bonus', e.target.value)}
                placeholder="$401k 3%, profit sharing share 3%. 100% paid health after a year. 100% covered health insurance"
                rows={2}
              />
            </div>

            <TextArea
              label="Compensation Notes"
              value={formData.compensation?.notes || ''}
              onChange={(e) => updateNestedField('compensation.notes', e.target.value)}
              placeholder="Additional compensation details..."
              rows={2}
            />
          </section>

          {/* SECTION 6: Recruiting/Interview Process */}
          <section id="section-recruiting" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Recruiting / Interview Process
            </h2>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <TextArea
                label="Are there other Search Firms working on this assignment?"
                value={formData.recruitingProcess?.otherSearchFirms || ''}
                onChange={(e) => updateNestedField('recruitingProcess.otherSearchFirms', e.target.value)}
                placeholder="Yes/No and details..."
                rows={2}
              />
              <TextArea
                label="Must-have Client interviewers"
                value={formData.recruitingProcess?.mustHaveInterviewers || ''}
                onChange={(e) => updateNestedField('recruitingProcess.mustHaveInterviewers', e.target.value)}
                placeholder="Required interviewers..."
                rows={2}
              />
            </div>

            <TextArea
              label="Notes"
              value={formData.recruitingProcess?.notes || ''}
              onChange={(e) => updateNestedField('recruitingProcess.notes', e.target.value)}
              placeholder="Interview process notes..."
              rows={2}
            />
          </section>

          {/* SECTION 7: Timeline */}
          <section id="section-timeline" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Timeline
            </h2>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <TextArea
                label="Key Milestones and Timing"
                value={formData.timeline?.keyMilestones || ''}
                onChange={(e) => updateNestedField('timeline.keyMilestones', e.target.value)}
                placeholder="Milestone details..."
                rows={2}
              />
              <TextArea
                label="Candidate Satisfaction Survey Required"
                value={formData.timeline?.candidateSatisfactionSurvey || ''}
                onChange={(e) => updateNestedField('timeline.candidateSatisfactionSurvey', e.target.value)}
                placeholder="Survey requirements..."
                rows={2}
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Cadence of Check-Ins"
                value={formData.timeline?.cadenceOfCheckIns || ''}
                onChange={(e) => updateNestedField('timeline.cadenceOfCheckIns', e.target.value)}
                placeholder="Weekly, Bi-weekly..."
              />
              <Input
                label="Target NPS (Net Promoter Scores, If Applicable)"
                value={formData.timeline?.targetNPS || ''}
                onChange={(e) => updateNestedField('timeline.targetNPS', e.target.value)}
                placeholder="Target score..."
              />
            </div>

            <TextArea
              label="Notes"
              value={formData.timeline?.notes || ''}
              onChange={(e) => updateNestedField('timeline.notes', e.target.value)}
              placeholder="Timeline notes..."
              rows={2}
            />
          </section>

          {/* SECTION 8: Working Together */}
          <section id="section-working" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Working Together
            </h2>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Level of priority (1-5)"
                type="number"
                min={1}
                max={5}
                value={formData.workingTogether?.levelOfPriority?.toString() || ''}
                onChange={(e) => updateNestedField('workingTogether.levelOfPriority', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="5"
              />
              <Input
                label="Expected turnaround response time"
                value={formData.workingTogether?.expectedTurnaroundTime || ''}
                onChange={(e) => updateNestedField('workingTogether.expectedTurnaroundTime', e.target.value)}
                placeholder="2 day max."
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <TextArea
                label="Feedback expectations (quality and timeline)"
                value={formData.workingTogether?.feedbackExpectations || ''}
                onChange={(e) => updateNestedField('workingTogether.feedbackExpectations', e.target.value)}
                placeholder="Feedback details..."
                rows={2}
              />
              <TextArea
                label="Percentage of time Client is willing to spend to help fill this role"
                value={formData.workingTogether?.clientTimePercentage || ''}
                onChange={(e) => updateNestedField('workingTogether.clientTimePercentage', e.target.value)}
                placeholder="Time commitment..."
                rows={2}
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <TextArea
                label="Preferred method of delivering status updates"
                value={formData.workingTogether?.preferredStatusMethod || ''}
                onChange={(e) => updateNestedField('workingTogether.preferredStatusMethod', e.target.value)}
                placeholder="meetings, emails, phone calls, texts, etc."
                rows={2}
              />
              <TextArea
                label="WHAT IS THE CLIENT EXPECTATION TO RECEIVE candidates?"
                value={formData.workingTogether?.clientExpectationForCandidates || ''}
                onChange={(e) => updateNestedField('workingTogether.clientExpectationForCandidates', e.target.value)}
                placeholder="Candidate expectations..."
                rows={2}
              />
            </div>

            <TextArea
              label="Notes"
              value={formData.workingTogether?.notes || ''}
              onChange={(e) => updateNestedField('workingTogether.notes', e.target.value)}
              placeholder="Working together notes..."
              rows={2}
            />
          </section>

          {/* SECTION 9: Next Steps */}
          <section id="section-next" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#111827', borderBottom: '2px solid #7c3aed', paddingBottom: '8px', display: 'inline-block' }}>
              Next Steps
            </h2>

            <TextArea
              label="Immediate action items"
              value={formData.immediateActionItems || ''}
              onChange={(e) => updateField('immediateActionItems', e.target.value)}
              placeholder="Action items..."
              rows={4}
            />
          </section>

          {/* SECTION 10: Completion (Internal Use Only) */}
          <section id="section-completion" style={{ background: '#fff', borderRadius: '8px', padding: '28px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', color: '#6b7280', borderBottom: '2px solid #d1d5db', paddingBottom: '8px', display: 'inline-block' }}>
              Completion (Internal Use Only)
            </h2>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <Input
                label="Completion Date"
                type="date"
                value={formData.completion?.completionDate || ''}
                onChange={(e) => updateNestedField('completion.completionDate', e.target.value)}
              />
              <TextArea
                label="What Worked"
                value={formData.completion?.whatWorked || ''}
                onChange={(e) => updateNestedField('completion.whatWorked', e.target.value)}
                placeholder="Success notes..."
                rows={2}
              />
            </div>

            <div className="form-grid form-grid-2" style={{ marginBottom: '20px' }}>
              <TextArea
                label="Lessons Learned"
                value={formData.completion?.lessonsLearned || ''}
                onChange={(e) => updateNestedField('completion.lessonsLearned', e.target.value)}
                placeholder="Learnings..."
                rows={2}
              />
              <TextArea
                label="What Did Not Work"
                value={formData.completion?.whatDidNotWork || ''}
                onChange={(e) => updateNestedField('completion.whatDidNotWork', e.target.value)}
                placeholder="Failure notes..."
                rows={2}
              />
            </div>

            <div className="form-grid form-grid-2">
              <TextArea
                label="Actions for Improvement"
                value={formData.completion?.actionsForImprovement || ''}
                onChange={(e) => updateNestedField('completion.actionsForImprovement', e.target.value)}
                placeholder="Improvement items..."
                rows={2}
              />
              <TextArea
                label="Notes"
                value={formData.completion?.notes || ''}
                onChange={(e) => updateNestedField('completion.notes', e.target.value)}
                placeholder="Completion notes..."
                rows={2}
              />
            </div>
          </section>

          {/* Footer Actions */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '20px 24px',
            background: '#fff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            marginTop: '8px',
            position: 'sticky',
            bottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Button variant="ghost" onClick={() => router.push('/')}>
                Back to Dashboard
              </Button>
              {lastSaved && (
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  {formatLastSaved()}
                </span>
              )}
              {isSyncedToLoxo && (
                <span style={{ 
                  background: '#dcfce7', 
                  color: '#166534', 
                  padding: '4px 10px', 
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}>
                  Synced to Loxo (Job #{loxoJobId})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="secondary" onClick={handleSave} loading={isSaving} disabled={isSaving || isSyncing}>
                Save Draft
              </Button>
              <Button variant="primary" onClick={handleSyncToLoxo} loading={isSyncing} disabled={isSaving || isSyncing}>
                {isSyncedToLoxo ? 'Update in Loxo' : 'Sync to Loxo'}
              </Button>
            </div>
          </div>
        </main>
      </div>

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

