import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import type { PoemAnalyzeRequest, ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(url, key);
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  return new OpenAI({ apiKey });
}

// Validation constants
const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 50000;
const TIMEOUT_MS = 30000;

interface ScoreResult {
  originality: number;
  quality: number;
  expression: number;
  feedback: string[];
  processingTime: number;
}

async function analyzeWithOpenAI(text: string): Promise<ScoreResult> {
  const openai = getOpenAIClient();
  const systemPrompt = `You are an expert literary AI that scores creative works on three dimensions:

1. ORIGINALITY (0-100): How unique and original is the voice, ideas, and expression? Detect plagiarism patterns.
2. QUALITY (0-100): Grammar, structure, clarity, professionalism, and technical competence.
3. EXPRESSION (0-100): Emotional resonance, creativity, storytelling impact, and stylistic effectiveness.

Respond in valid JSON format only:
{
  "originality": <0-100>,
  "quality": <0-100>,
  "expression": <0-100>,
  "feedback": ["<insight 1>", "<insight 2>", "<insight 3>", "<insight 4>"]
}`;

  const userPrompt = `Analyze this creative work and provide scores:\n\n${text}`;

  const startTime = Date.now();

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const processingTime = Date.now() - startTime;

  if (!completion.choices[0].message.content) {
    throw new Error('No response from OpenAI');
  }

  let result: ScoreResult;
  try {
    // Extract JSON from response
    const content = completion.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON in response');
    }
    result = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('JSON parse error:', e);
    throw new Error('Failed to parse OpenAI response');
  }

  // Validate scores
  if (
    typeof result.originality !== 'number' ||
    typeof result.quality !== 'number' ||
    typeof result.expression !== 'number'
  ) {
    throw new Error('Invalid score format from OpenAI');
  }

  // Clamp scores to 0-100
  result.originality = Math.max(0, Math.min(100, Math.round(result.originality)));
  result.quality = Math.max(0, Math.min(100, Math.round(result.quality)));
  result.expression = Math.max(0, Math.min(100, Math.round(result.expression)));

  // Ensure feedback is array
  if (!Array.isArray(result.feedback)) {
    result.feedback = ['Analysis complete'];
  }

  return {
    ...result,
    processingTime,
  };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    // Get authenticated user via Bearer token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: PoemAnalyzeRequest = await request.json();
    const { text, language = 'en' } = body;

    // Validate input
    if (!text) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Text is required', code: 'MISSING_TEXT' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    const wordCount = trimmedText.split(/\s+/).length;

    if (wordCount < 10) {
      return NextResponse.json<ApiErrorResponse>(
        { success: false, error: 'Text must contain at least 10 words', code: 'TEXT_TOO_SHORT' },
        { status: 400 }
      );
    }

    if (trimmedText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: `Text must not exceed ${MAX_TEXT_LENGTH} characters`,
          code: 'TEXT_TOO_LONG',
        },
        { status: 400 }
      );
    }

    // Call OpenAI API
    let analysisResult: ScoreResult;
    try {
      analysisResult = await analyzeWithOpenAI(trimmedText);
    } catch (aiError) {
      console.error('OpenAI analysis error:', aiError);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: 'Failed to analyze text',
          code: 'ANALYSIS_ERROR',
          details: {
            message: aiError instanceof Error ? aiError.message : 'Unknown error',
          },
        },
        { status: 500 }
      );
    }

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      analysisResult.originality * 0.4 + analysisResult.quality * 0.35 + analysisResult.expression * 0.25
    );

    // Store analysis in database
    const { data: analysis, error: dbError } = await supabase
      .from('analyses')
      .insert([
        {
          user_id: user.id,
          text_content: trimmedText,
          text_length: trimmedText.length,
          originality_score: analysisResult.originality,
          quality_score: analysisResult.quality,
          expression_score: analysisResult.expression,
          overall_score: overallScore,
          feedback: analysisResult.feedback || [],
          language_code: language,
          processing_time_ms: analysisResult.processingTime || 0,
          model_version: 'gpt-4o-mini-v1',
          sentiment: 'neutral', // TODO: Add sentiment analysis
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insertion error:', dbError);
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: 'Failed to save analysis',
          code: 'DB_ERROR',
        },
        { status: 500 }
      );
    }

    // Log audit event
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase.from('audit_logs').insert([
      {
        user_id: user.id,
        action: 'analysis_created',
        entity_type: 'analysis',
        entity_id: analysis.id,
        details: {
          overall_score: overallScore,
          word_count: wordCount,
        },
        ip_address: clientIP,
        user_agent: userAgent,
      },
    ]);

    return NextResponse.json<ApiSuccessResponse>(
      {
        success: true,
        data: {
          analysis: {
            id: analysis.id,
            user_id: analysis.user_id,
            text_content: analysis.text_content,
            text_length: analysis.text_length,
            originality_score: analysis.originality_score,
            quality_score: analysis.quality_score,
            expression_score: analysis.expression_score,
            overall_score: analysis.overall_score,
            feedback: analysis.feedback,
            model_version: analysis.model_version,
            processing_time_ms: analysis.processing_time_ms,
            created_at: analysis.created_at,
            is_published: analysis.is_published,
          },
        },
        message: 'Analysis completed successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: 'An unexpected error occurred',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}
