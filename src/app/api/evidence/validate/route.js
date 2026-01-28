import { createServerClient } from '@/lib/supabase';
import { generateTextValidation, generateImageValidation } from '@/lib/ollama';
import { NextResponse } from 'next/server';

// POST /api/evidence/validate - Trigger AI validation
export async function POST(request) {
    try {
        const supabase = createServerClient();
        const body = await request.json();
        const { evidence_item_id } = body;

        if (!evidence_item_id) {
            return NextResponse.json(
                { error: 'evidence_item_id is required' },
                { status: 400 }
            );
        }

        // Fetch the evidence item
        const { data: evidence, error: fetchError } = await supabase
            .from('evidence_items')
            .select('*')
            .eq('id', evidence_item_id)
            .single();

        if (fetchError || !evidence) {
            return NextResponse.json(
                { error: 'Evidence item not found' },
                { status: 404 }
            );
        }

        // Update status to validating
        await supabase
            .from('evidence_items')
            .update({ status: 'validating' })
            .eq('id', evidence_item_id);

        // Download the file from storage
        const { data: fileData, error: downloadError } = await supabase.storage
            .from('evidence')
            .download(evidence.file_path);

        if (downloadError) {
            await supabase
                .from('evidence_items')
                .update({ status: 'failed' })
                .eq('id', evidence_item_id);

            return NextResponse.json(
                { error: 'Failed to download file', details: downloadError.message },
                { status: 500 }
            );
        }

        let validationResult;

        // Route to appropriate model based on file type
        if (evidence.file_type.startsWith('image/')) {
            // Image evidence → LLaVA
            const arrayBuffer = await fileData.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            validationResult = await generateImageValidation(base64, evidence.file_name);
        } else {
            // Text-based evidence → Qwen 2.5
            const textContent = await fileData.text();
            validationResult = await generateTextValidation(textContent, evidence.file_name);
        }

        if (!validationResult.success) {
            await supabase
                .from('evidence_items')
                .update({ status: 'failed' })
                .eq('id', evidence_item_id);

            return NextResponse.json(
                { error: 'AI validation failed', details: validationResult.error },
                { status: 500 }
            );
        }

        // Save validation result
        const { data: savedResult, error: saveError } = await supabase
            .from('ai_validation_results')
            .insert({
                evidence_item_id,
                result_json: validationResult.result,
                model_used: validationResult.model,
                processing_time_ms: validationResult.processingTimeMs,
            })
            .select()
            .single();

        if (saveError) {
            console.error('Error saving validation result:', saveError);
            await supabase
                .from('evidence_items')
                .update({ status: 'failed' })
                .eq('id', evidence_item_id);

            return NextResponse.json(
                { error: 'Failed to save validation result' },
                { status: 500 }
            );
        }

        // Update evidence item with detected type and status
        await supabase
            .from('evidence_items')
            .update({
                status: 'validated',
                detected_evidence_type: validationResult.result.evidence_type,
            })
            .eq('id', evidence_item_id);

        return NextResponse.json({
            success: true,
            data: {
                validation_id: savedResult.id,
                result: validationResult.result,
                model: validationResult.model,
                processing_time_ms: validationResult.processingTimeMs,
            },
            message: 'Validation completed successfully',
        });
    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
