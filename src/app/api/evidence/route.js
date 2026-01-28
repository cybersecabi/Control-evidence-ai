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

// GET /api/evidence - List evidence items for current user
export async function GET(request) {
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
            .eq('uploaded_by', user.id)
            .order('uploaded_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

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

// POST /api/evidence - Upload new evidence for current user
export async function POST(request) {
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

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Generate unique file path scoped to user
        const timestamp = Date.now();
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user.id}/${timestamp}_${safeFileName}`;

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

        // Create evidence item record with user ID
        const { data: evidenceItem, error: dbError } = await supabase
            .from('evidence_items')
            .insert({
                file_path: filePath,
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: user.id,
                status: 'pending',
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database insert error:', dbError);
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
