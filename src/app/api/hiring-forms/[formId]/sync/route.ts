import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { syncHiringIntakeToLoxo } from '@/lib/loxo/client';
import type { HiringIntakeForm } from '@/types';

// POST /api/hiring-forms/[formId]/sync - Sync hiring form to LOXO
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  try {
    const { formId } = await params;
    const db = await getDatabase();

    // Get the form
    const form = await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .findOne({ formId });

    if (!form) {
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      );
    }

    // Validate required fields
    const validationErrors: { field: string; message: string }[] = [];
    
    if (!form.data.jobTitle) {
      validationErrors.push({ field: 'jobTitle', message: 'Job title is required' });
    }
    
    if (!form.data.clientCompany.name) {
      validationErrors.push({ field: 'clientCompany.name', message: 'Client company name is required' });
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
          details: validationErrors 
        },
        { status: 400 }
      );
    }

    // Sync to LOXO
    const result = await syncHiringIntakeToLoxo(
      form.data,
      form.loxoJobId,
      form.loxoCompanyId
    );

    // Update form with LOXO IDs
    await db
      .collection<HiringIntakeForm>('hiringIntakeForms')
      .updateOne(
        { formId },
        {
          $set: {
            status: 'submitted',
            loxoJobId: result.jobId,
            loxoCompanyId: result.companyId,
            submittedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

    return NextResponse.json({
      success: true,
      data: {
        action: result.action,
        jobId: result.jobId,
        companyId: result.companyId,
      },
    });
  } catch (error) {
    console.error('Error syncing hiring form to LOXO:', error);
    const message = error instanceof Error ? error.message : 'Failed to sync to LOXO';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

