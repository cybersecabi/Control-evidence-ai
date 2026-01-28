import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/evidence - List all evidence items
export async function GET(request) {
    try {
        const supabase = createServerClient();
        const { searchParams } = new URL(request.url);

        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('evidence_items')
            .select(`
        *,
        ai_validation_results!ai_validation_results_evidence_item_id_fkey (
          id,
          result_json,
          model_used,
          created_at
        )
      `)
            .order('uploaded_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching evidence:', error);
            return NextResponse.json(
                { error: 'Failed to fetch evidence items' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
            count: data?.length || 0,
            offset,
            limit,
        });
    } catch (error) {
        console.error('Evidence list error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/evidence - Upload new evidence
export async function POST(request) {
    try {
        const supabase = createServerClient();
        const formData = await request.formData();

        const file = formData.get('file');
        const uploadedBy = formData.get('uploaded_by') || 'anonymous';

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate unique file path
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `uploads/${timestamp}_${safeFileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('evidence')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file', details: uploadError.message },
                { status: 500 }
            );
        }

        // Create evidence item record
        const { data: evidenceItem, error: dbError } = await supabase
            .from('evidence_items')
            .insert({
                file_path: filePath,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: uploadedBy,
                status: 'pending',
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database insert error:', dbError);
            // Try to clean up uploaded file
            await supabase.storage.from('evidence').remove([filePath]);
            return NextResponse.json(
                { error: 'Failed to create evidence record', details: dbError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data: evidenceItem,
            message: 'Evidence uploaded successfully',
        });
    } catch (error) {
        console.error('Evidence upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
