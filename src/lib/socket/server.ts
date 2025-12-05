import { Server as SocketIOServer, Socket } from 'socket.io';
import { getDatabase } from '@/lib/db/mongodb';
import type { HiringIntakeForm } from '@/types';

// Store room state
interface RoomState {
  lockedFields: Map<string, string>; // field -> socketId
  collaborators: Map<string, { joinedAt: Date; color: string; name?: string }>;
}

const rooms = new Map<string, RoomState>();

// Generate a random color for collaborators
function generateColor(): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getOrCreateRoom(formId: string): RoomState {
  if (!rooms.has(formId)) {
    rooms.set(formId, {
      lockedFields: new Map(),
      collaborators: new Map(),
    });
  }
  return rooms.get(formId)!;
}

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // Join a hiring intake form room
    socket.on('join-hiring-form', async ({ formId, user }) => {
      socket.join(formId);
      
      const room = getOrCreateRoom(formId);
      const color = user?.color || generateColor();
      room.collaborators.set(socket.id, { 
        joinedAt: new Date(), 
        color,
        name: user?.name 
      });

      console.log(`User ${user?.name || socket.id} joined form ${formId}`);

      // Notify others
      socket.to(formId).emit('user-joined', { 
        odId: socket.id, 
        color, 
        name: user?.name 
      });

      // Send current collaborators to everyone
      const collaborators = Array.from(room.collaborators.entries()).map(([odId, data]) => ({
        odId,
        joinedAt: data.joinedAt,
        lastActiveAt: new Date(),
        color: data.color,
        name: data.name,
      }));
      io.to(formId).emit('collaborators-update', collaborators);

      // Fetch and send current form data to the new user
      try {
        const db = await getDatabase();
        const form = await db.collection<HiringIntakeForm>('hiringIntakeForms').findOne({ formId });
        if (form) {
          socket.emit('form-data', form.data);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    });

    // Handle full form data updates (for real-time sync)
    socket.on('form-change', async ({ formId, formData, user }) => {
      console.log(`Form change from ${user} in ${formId}`);
      
      // Broadcast to others in the room
      socket.to(formId).emit('form-update', { formData, user });

      // Save to database
      try {
        const db = await getDatabase();
        await db.collection<HiringIntakeForm>('hiringIntakeForms').updateOne(
          { formId },
          { 
            $set: { 
              data: formData,
              updatedAt: new Date(),
              status: 'in_progress',
            } 
          }
        );
      } catch (error) {
        console.error('Error saving form update:', error);
      }
    });

    // Handle individual field updates
    socket.on('field-update', async ({ formId, field, value, user }) => {
      console.log(`Field update: formId=${formId}, field=${field}`);
      
      // Broadcast to others in the room
      socket.to(formId).emit('field-updated', { field, value, user });

      // Save to database
      try {
        const db = await getDatabase();
        await db.collection<HiringIntakeForm>('hiringIntakeForms').updateOne(
          { formId },
          { 
            $set: { 
              [`data.${field}`]: value,
              updatedAt: new Date(),
              status: 'in_progress',
            } 
          }
        );
      } catch (error) {
        console.error('Error saving field update:', error);
      }
    });

    socket.on('leave-hiring-form', ({ formId }) => {
      handleLeaveForm(socket, io, formId);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up all rooms the socket was in
      for (const [formId, room] of rooms.entries()) {
        if (room.collaborators.has(socket.id)) {
          handleLeaveForm(socket, io, formId);
        }
      }
    });
  });
}

function handleLeaveForm(socket: Socket, io: SocketIOServer, formId: string) {
  socket.leave(formId);
  
  const room = rooms.get(formId);
  if (room) {
    const userData = room.collaborators.get(socket.id);
    room.collaborators.delete(socket.id);
    
    // Release any locked fields
    for (const [field, socketId] of room.lockedFields.entries()) {
      if (socketId === socket.id) {
        room.lockedFields.delete(field);
        io.to(formId).emit('field-unlocked', { field });
      }
    }
    
    socket.to(formId).emit('user-left', { odId: socket.id, name: userData?.name });
    
    // Update collaborators list
    const collaborators = Array.from(room.collaborators.entries()).map(([odId, data]) => ({
      odId,
      joinedAt: data.joinedAt,
      lastActiveAt: new Date(),
      color: data.color,
      name: data.name,
    }));
    io.to(formId).emit('collaborators-update', collaborators);
  }
}

