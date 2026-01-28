import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper to get authenticated user from cookies
async function getAuthenticatedUser() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                get(name) {
                    return cookieStore.get(name)?.value;
                },
                set() { },
                remove() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// GET /api/evidence/[id] - Get single evidence item with results
export async function GET(request, { params }) {
    try {
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                    set() { },
                    remove() { },
                },
            }
        );

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
            .eq('uploaded_by', user.id)
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
            .createSignedUrl(data.file_path, 3600);

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
        const user = await getAuthenticatedUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                    set() { },
                    remove() { },
                },
            }
        );

        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Evidence ID required' },
                { status: 400 }
            );
        }

        // First get the file path - only if owned by user
        const { data: evidence, error: fetchError } = await supabase
            .from('evidence_items')
            .select('file_path')
            .eq('id', id)
            .eq('uploaded_by', user.id)
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

        // Delete from database
        const { error: deleteError } = await supabase
            .from('evidence_items')
            .delete()
            .eq('id', id)
            .eq('uploaded_by', user.id);

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
