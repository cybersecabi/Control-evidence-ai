import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// GET /api/evidence/[id] - Get single evidence item with results
export async function GET(request, { params }) {
    try {
        const supabase = createServerClient();
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Evidence ID required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('evidence_items')
            .select(`
        *,
        ai_validation_results!ai_validation_results_evidence_item_id_fkey (
          id,
          result_json,
          model_used,
          processing_time_ms,
          created_at
        )
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json(
                    { error: 'Evidence item not found' },
                    { status: 404 }
                );
            }
            console.error('Error fetching evidence:', error);
            return NextResponse.json(
                { error: 'Failed to fetch evidence item' },
                { status: 500 }
            );
        }

        // Get signed URL for file download
        const { data: signedUrl } = await supabase.storage
            .from('evidence')
            .createSignedUrl(data.file_path, 3600); // 1 hour expiry

        return NextResponse.json({
            success: true,
            data: {
                ...data,
                file_url: signedUrl?.signedUrl || null,
            },
        });
    } catch (error) {
        console.error('Evidence fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/evidence/[id] - Delete evidence item
export async function DELETE(request, { params }) {
    try {
        const supabase = createServerClient();
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Evidence ID required' },
                { status: 400 }
            );
        }

        // First get the file path
        const { data: evidence, error: fetchError } = await supabase
            .from('evidence_items')
            .select('file_path')
            .eq('id', id)
            .single();

        if (fetchError) {
            return NextResponse.json(
                { error: 'Evidence item not found' },
                { status: 404 }
            );
        }

        // Delete from storage
        if (evidence.file_path) {
            await supabase.storage.from('evidence').remove([evidence.file_path]);
        }

        // Delete from database (cascades to validation results)
        const { error: deleteError } = await supabase
            .from('evidence_items')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Delete error:', deleteError);
            return NextResponse.json(
                { error: 'Failed to delete evidence item' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Evidence item deleted',
        });
    } catch (error) {
        console.error('Evidence delete error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
