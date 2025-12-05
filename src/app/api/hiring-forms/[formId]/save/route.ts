import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import type { HiringIntakeForm, HiringIntakeFormData } from '@/types';

// POST /api/hiring-forms/[formId]/save - Save hiring form data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const body = await request.json();
    const formData: HiringIntakeFormData = body.data;

    const db = await getDatabase();

    // Get the existing form
    const existingForm = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .findOne({ formId });

    if (!existingForm) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Determine new status
    let newStatus = existingForm.status;
    if (existingForm.status === 'draft') {
      newStatus = 'in_progress';
    }

    // Update the form
    const result = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .updateOne(
        { formId },
        {
          $set: {
            data: formData,
            status: newStatus,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Fetch and return updated form
    const updatedForm = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .findOne({ formId });

    return NextResponse.json({ success: true, data: updatedForm });
  } catch (error) {
    console.error('Error saving hiring form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save form' },
      { status: 500 }
    );
  }
}

