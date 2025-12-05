'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { FormData, Collaborator, ServerToClientEvents, ClientToServerEvents } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface UseSocketOptions {
  formId: string;
  onFieldUpdate?: (field: keyof FormData, value: unknown, userId: string) => void;
  onFormData?: (data: FormData) => void;
}

export function useSocket({ formId, onFieldUpdate, onFormData }: UseSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [lockedFields, setLockedFields] = useState<Map<string, string>>(new Map());
  const [mySocketId, setMySocketId] = useState<string | undefined>(undefined);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  
  // Store callbacks in refs to avoid re-creating the socket on callback changes
  const onFieldUpdateRef = useRef(onFieldUpdate);
  const onFormDataRef = useRef(onFormData);
  
  // Update refs when callbacks change
  useEffect(() => {
    onFieldUpdateRef.current = onFieldUpdate;
  }, [onFieldUpdate]);
  
  useEffect(() => {
    onFormDataRef.current = onFormData;
  }, [onFormData]);

  useEffect(() => {
    console.log('Connecting to socket server:', SOCKET_URL);
    
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    }) as Socket<ServerToClientEvents, ClientToServerEvents>;

    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      setMySocketId(newSocket.id);
      newSocket.emit('join-form', { formId });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('collaborators', (collabs) => {
      setCollaborators(collabs);
    });

    newSocket.on('user-joined', ({ userId, color }) => {
      setCollaborators(prev => [...prev, { 
        odId: userId, 
        joinedAt: new Date(), 
        lastActiveAt: new Date(),
        color 
      }]);
    });

    newSocket.on('user-left', ({ userId }) => {
      setCollaborators(prev => prev.filter(c => c.odId !== userId));
    });

    newSocket.on('field-updated', ({ field, value, userId }) => {
      console.log('Received field update from server:', field, value);
      onFieldUpdateRef.current?.(field, value, userId);
    });

    newSocket.on('form-data', (data) => {
      console.log('Received form data from server');
      onFormDataRef.current?.(data);
    });

    newSocket.on('field-locked', ({ field, userId }) => {
      setLockedFields(prev => new Map(prev).set(field, userId));
    });

    newSocket.on('field-unlocked', ({ field }) => {
      setLockedFields(prev => {
        const next = new Map(prev);
        next.delete(field);
        return next;
      });
    });

    return () => {
      console.log('Cleaning up socket');
      newSocket.emit('leave-form', { formId });
      newSocket.disconnect();
    };
  }, [formId]); // Only depend on formId

  const updateField = useCallback((field: keyof FormData, value: unknown) => {
    console.log('updateField called:', field, value, 'socket connected:', socketRef.current?.connected);
    if (socketRef.current?.connected) {
      socketRef.current.emit('field-update', { formId, field, value });
    } else {
      console.warn('Socket not connected, cannot send field update');
    }
  }, [formId]);

  const lockField = useCallback((field: keyof FormData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('field-lock', { formId, field });
    }
  }, [formId]);

  const unlockField = useCallback((field: keyof FormData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('field-unlock', { formId, field });
    }
  }, [formId]);

  const isFieldLockedByOther = useCallback((field: keyof FormData) => {
    const locker = lockedFields.get(field);
    return locker && locker !== mySocketId;
  }, [lockedFields, mySocketId]);

  return {
    isConnected,
    collaborators,
    lockedFields,
    updateField,
    lockField,
    unlockField,
    isFieldLockedByOther,
    mySocketId,
  };
}
