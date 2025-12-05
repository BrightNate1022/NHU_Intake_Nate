import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import type { HiringIntakeForm } from '@/types';

// GET /api/hiring-forms/[formId] - Get a specific hiring form
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const db = await getDatabase();

    const form = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .findOne({ formId });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: form });
  } catch (error) {
    console.error('Error fetching hiring form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch form' },
      { status: 500 }
    );
  }
}

// DELETE /api/hiring-forms/[formId] - Delete a hiring form
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const db = await getDatabase();

    const result = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .deleteOne({ formId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting hiring form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete form' },
      { status: 500 }
    );
  }
}

