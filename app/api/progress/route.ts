import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { genAiPairs, allGenAiAtomicTopics } from '@/lib/genai';
import { normalizeProgress } from '@/lib/progress';
import { loadUserProgress, saveUserProgress } from '@/lib/progress-db';

export const runtime = 'nodejs';

function validModule(value: string | null): value is 'interview' | 'genai' {
  return value === 'interview' || value === 'genai';
}

function normalizeModuleProgress(module: 'interview' | 'genai', value: unknown) {
  if (!value || typeof value !== 'object') return null;
  const data = value as { solved?: unknown; completed?: unknown; pair?: unknown };

  if (module === 'interview') {
    if (!Array.isArray(data.solved) || !data.solved.every(id => typeof id === 'string') || !Number.isInteger(data.pair)) return null;
    return normalizeProgress(data);
  }

  if (!Array.isArray(data.completed) || !data.completed.every(id => typeof id === 'string') || !Number.isInteger(data.pair)) return null;
  const pair = Number(data.pair);
  if (pair < 0 || pair >= genAiPairs.length) return null;
  const completed = [...new Set(data.completed.filter(id => allGenAiAtomicTopics.some(topic => topic.id === id)))];
  return { completed, pair };
}

async function authenticatedUser() {
  const session = await auth();
  return session?.user?.id ?? null;
}

function logProgressDatabaseError(operation: string, error: unknown) {
  if (error instanceof Error) {
    const databaseError = error as Error & { code?: string };
    console.error(`Progress database ${operation} failed`, {
      code: databaseError.code,
      message: databaseError.message,
    });
    return;
  }
  console.error(`Progress database ${operation} failed with an unknown error`);
}

function progressDatabaseErrorResponse(error: unknown) {
  logProgressDatabaseError('request', error);
  if (process.env.NODE_ENV === 'development' && error instanceof Error) {
    const databaseError = error as Error & { code?: string };
    const detail = [databaseError.code, databaseError.message].filter(Boolean).join(': ');
    return NextResponse.json({ error: `Progress database is unavailable (${detail}).` }, { status: 503 });
  }
  return NextResponse.json({ error: 'Progress database is unavailable.' }, { status: 503 });
}

export async function GET(request: Request) {
  const userId = await authenticatedUser();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  const module = new URL(request.url).searchParams.get('module');
  if (!validModule(module)) return NextResponse.json({ error: 'Unknown progress module.' }, { status: 400 });

  try {
    const progress = await loadUserProgress(userId, module);
    if (process.env.NODE_ENV === 'development') {
      console.info('[progress] loaded', { userId, module, found: progress !== null });
    }
    return NextResponse.json({ progress });
  } catch (error) {
    return progressDatabaseErrorResponse(error);
  }
}

export async function PUT(request: Request) {
  const userId = await authenticatedUser();
  if (!userId) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });

  try {
    const payload = await request.json();
    const module = payload?.module;
    if (!validModule(module)) return NextResponse.json({ error: 'Unknown progress module.' }, { status: 400 });

    const progress = normalizeModuleProgress(module, payload?.progress);
    if (!progress) return NextResponse.json({ error: 'Invalid progress payload.' }, { status: 400 });

    await saveUserProgress(userId, module, progress);
    return NextResponse.json({ success: true });
  } catch (error) {
    return progressDatabaseErrorResponse(error);
  }
}
