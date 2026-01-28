// AI Client for ControlEvidence AI
// Supports Gemini API (cloud) and Ollama (local)
// Priority: Gemini if API key is set, otherwise Ollama

// =============================================
// Configuration
// =============================================

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_VISION_MODEL = process.env.GEMINI_VISION_MODEL || 'gemini-2.0-flash';

// Ollama Configuration
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL || 'qwen2.5:7b';
const OLLAMA_VISION_MODEL = process.env.OLLAMA_VISION_MODEL || 'llava:7b';

// Determine which provider to use
const USE_GEMINI = !!GEMINI_API_KEY;

// =============================================
// Shared Configuration
// =============================================

// JSON Schema for validation output
const VALIDATION_SCHEMA = {
    type: 'object',
    properties: {
        evidence_type: {
            type: 'string',
            description: 'Type of evidence detected (e.g., "User Access List CSV", "MFA Settings Screenshot")'
        },
        mapped_control: {
            type: 'object',
            properties: {
                framework: { type: 'string', description: 'Framework name (SOC 2, ISO 27001, SOX ITGC, NIST CSF)' },
                control_id: { type: 'string', description: 'Control identifier (e.g., CC6.1, A.9.4)' },
                control_name: { type: 'string', description: 'Short control name' }
            },
            required: ['framework', 'control_id', 'control_name']
        },
        completeness_score: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Completeness score from 0-100'
        },
        extracted_data: {
            type: 'object',
            description: 'Key fields extracted from the evidence'
        },
        issues: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of gaps, risks, or red flags identified'
        },
        score_reasoning: {
            type: 'string',
            description: 'Explanation for the completeness score'
        }
    },
    required: ['evidence_type', 'mapped_control', 'completeness_score', 'extracted_data', 'issues', 'score_reasoning']
};

// System prompt for evidence validation
const SYSTEM_PROMPT = `You are an expert compliance auditor and evidence analyst. Your task is to analyze audit evidence and provide structured assessments.

For each piece of evidence, you must:
1. Identify the type of evidence (User Access List, MFA Settings, Policy Document, System Screenshot, Audit Log, etc.)
2. Map it to the most appropriate compliance control from these frameworks:
   - SOC 2 (Trust Services Criteria: CC1-CC9, PI1, A1, C1, etc.)
   - ISO 27001 (Annex A controls: A.5-A.18)
   - SOX ITGC (Access Controls, Change Management, Computer Operations, Program Development)
   - NIST CSF (Identify, Protect, Detect, Respond, Recover)
3. Score completeness (0-100) based on:
   - Presence of required fields/information
   - Timestamps and date coverage
   - Evidence of proper authorization
   - Audit trail completeness
4. Extract key data fields from the evidence
5. Identify any gaps, risks, or issues

Always respond with valid JSON matching the required schema. Be specific about control mappings and provide actionable issue descriptions.`;

// =============================================
// Gemini API Functions
// =============================================

async function geminiTextValidation(content, fileName = 'evidence') {
    const startTime = Date.now();

    const prompt = `${SYSTEM_PROMPT}

Analyze this audit evidence and provide a structured validation assessment.

File: ${fileName}
Content:
${content}

Respond with a JSON object containing: evidence_type, mapped_control (with framework, control_id, control_name), completeness_score (0-100), extracted_data, issues (array), and score_reasoning.

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 2048,
                        responseMimeType: 'application/json',
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        // Extract text from Gemini response
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            throw new Error('No response text from Gemini');
        }

        // Parse JSON response
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            // Try to extract JSON from response
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Invalid JSON response from Gemini');
            }
        }

        return {
            success: true,
            result: normalizeResult(result),
            model: `gemini:${GEMINI_MODEL}`,
            processingTimeMs: processingTime,
        };
    } catch (error) {
        console.error('Gemini text validation error:', error);
        return {
            success: false,
            error: error.message,
            model: `gemini:${GEMINI_MODEL}`,
            processingTimeMs: Date.now() - startTime,
        };
    }
}

async function geminiImageValidation(base64Image, fileName = 'evidence') {
    const startTime = Date.now();

    const prompt = `${SYSTEM_PROMPT}

Analyze this screenshot/image as audit evidence and provide a structured validation assessment.

File: ${fileName}

Look for:
- UI elements indicating security settings
- User/admin information
- Timestamps and dates
- System configurations
- Access controls or permissions

Respond with a JSON object containing: evidence_type, mapped_control (with framework, control_id, control_name), completeness_score (0-100), extracted_data (key visible data), issues (array), and score_reasoning.

IMPORTANT: Return ONLY valid JSON, no markdown formatting.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_VISION_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            {
                                inline_data: {
                                    mime_type: 'image/png',
                                    data: base64Image
                                }
                            }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 2048,
                        responseMimeType: 'application/json',
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        // Extract text from Gemini response
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            throw new Error('No response text from Gemini');
        }

        // Parse JSON response
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Invalid JSON response from Gemini');
            }
        }

        return {
            success: true,
            result: normalizeResult(result),
            model: `gemini:${GEMINI_VISION_MODEL}`,
            processingTimeMs: processingTime,
        };
    } catch (error) {
        console.error('Gemini image validation error:', error);
        return {
            success: false,
            error: error.message,
            model: `gemini:${GEMINI_VISION_MODEL}`,
            processingTimeMs: Date.now() - startTime,
        };
    }
}

// =============================================
// Ollama API Functions
// =============================================

async function ollamaTextValidation(content, fileName = 'evidence') {
    const startTime = Date.now();

    const prompt = `Analyze this audit evidence and provide a structured validation assessment.

File: ${fileName}
Content:
${content}

Respond with a JSON object containing: evidence_type, mapped_control (with framework, control_id, control_name), completeness_score (0-100), extracted_data, issues (array), and score_reasoning.`;

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_TEXT_MODEL,
                prompt: prompt,
                system: SYSTEM_PROMPT,
                format: 'json',
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 2048,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        let result;
        try {
            result = JSON.parse(data.response);
        } catch (parseError) {
            const jsonMatch = data.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Invalid JSON response from Ollama');
            }
        }

        return {
            success: true,
            result: normalizeResult(result),
            model: `ollama:${OLLAMA_TEXT_MODEL}`,
            processingTimeMs: processingTime,
        };
    } catch (error) {
        console.error('Ollama text validation error:', error);
        return {
            success: false,
            error: error.message,
            model: `ollama:${OLLAMA_TEXT_MODEL}`,
            processingTimeMs: Date.now() - startTime,
        };
    }
}

async function ollamaImageValidation(base64Image, fileName = 'evidence') {
    const startTime = Date.now();

    const prompt = `Analyze this screenshot/image as audit evidence and provide a structured validation assessment.

File: ${fileName}

Look for:
- UI elements indicating security settings
- User/admin information
- Timestamps and dates
- System configurations
- Access controls or permissions

Respond with a JSON object containing: evidence_type, mapped_control (with framework, control_id, control_name), completeness_score (0-100), extracted_data (key visible data), issues (array), and score_reasoning.`;

    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: OLLAMA_VISION_MODEL,
                prompt: prompt,
                system: SYSTEM_PROMPT,
                images: [base64Image],
                format: 'json',
                stream: false,
                options: {
                    temperature: 0.1,
                    num_predict: 2048,
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const processingTime = Date.now() - startTime;

        let result;
        try {
            result = JSON.parse(data.response);
        } catch (parseError) {
            const jsonMatch = data.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Invalid JSON response from Ollama');
            }
        }

        return {
            success: true,
            result: normalizeResult(result),
            model: `ollama:${OLLAMA_VISION_MODEL}`,
            processingTimeMs: processingTime,
        };
    } catch (error) {
        console.error('Ollama image validation error:', error);
        return {
            success: false,
            error: error.message,
            model: `ollama:${OLLAMA_VISION_MODEL}`,
            processingTimeMs: Date.now() - startTime,
        };
    }
}

// =============================================
// Unified API (Auto-selects provider)
// =============================================

export async function generateTextValidation(content, fileName = 'evidence') {
    if (USE_GEMINI) {
        return geminiTextValidation(content, fileName);
    }
    return ollamaTextValidation(content, fileName);
}

export async function generateImageValidation(base64Image, fileName = 'evidence') {
    if (USE_GEMINI) {
        return geminiImageValidation(base64Image, fileName);
    }
    return ollamaImageValidation(base64Image, fileName);
}

// =============================================
// Health Check
// =============================================

export async function checkOllamaHealth() {
    // Check Gemini first if configured
    if (USE_GEMINI) {
        try {
            // Simple test request to verify API key works
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
                { method: 'GET' }
            );

            if (response.ok) {
                const data = await response.json();
                const models = data.models?.map(m => m.name) || [];
                return {
                    provider: 'gemini',
                    available: true,
                    models: [GEMINI_MODEL, GEMINI_VISION_MODEL],
                    hasTextModel: true,
                    hasVisionModel: true,
                };
            } else {
                return {
                    provider: 'gemini',
                    available: false,
                    error: 'Invalid Gemini API key or API error',
                };
            }
        } catch (error) {
            return {
                provider: 'gemini',
                available: false,
                error: error.message,
            };
        }
    }

    // Check Ollama
    try {
        const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
            method: 'GET',
        });

        if (!response.ok) {
            return { provider: 'ollama', available: false, error: 'Ollama API not responding' };
        }

        const data = await response.json();
        const models = data.models?.map(m => m.name) || [];

        return {
            provider: 'ollama',
            available: true,
            models,
            hasTextModel: models.some(m => m.startsWith(OLLAMA_TEXT_MODEL.split(':')[0])),
            hasVisionModel: models.some(m => m.startsWith(OLLAMA_VISION_MODEL.split(':')[0])),
        };
    } catch (error) {
        return { provider: 'ollama', available: false, error: error.message };
    }
}

// =============================================
// Utilities
// =============================================

function normalizeResult(result) {
    return {
        evidence_type: result.evidence_type || 'Unknown Evidence',
        mapped_control: {
            framework: result.mapped_control?.framework || 'Unknown',
            control_id: result.mapped_control?.control_id || 'N/A',
            control_name: result.mapped_control?.control_name || 'Unknown Control',
        },
        completeness_score: Math.min(100, Math.max(0, Number(result.completeness_score) || 0)),
        extracted_data: result.extracted_data || {},
        issues: Array.isArray(result.issues) ? result.issues : [],
        score_reasoning: result.score_reasoning || 'No reasoning provided',
    };
}

export function getActiveProvider() {
    return USE_GEMINI ? 'gemini' : 'ollama';
}

export { VALIDATION_SCHEMA, USE_GEMINI };
