import { NextResponse } from 'next/server';
import { feedbackStore } from '@/lib/feedback-db';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const category = typeof payload?.category === 'string' ? payload.category.trim() : '';
    const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
    const pair = Number(payload?.pair);

    if (!category || !message || !Number.isFinite(pair)) {
      return NextResponse.json({ error: 'Feedback requires a category, message, and pair number.' }, { status: 400 });
    }

    const saved = await feedbackStore.insert({ category, message, pair: Math.max(0, pair) });
    return NextResponse.json({ success: true, feedback: saved }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save feedback.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
