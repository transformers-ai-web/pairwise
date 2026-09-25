import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const category = typeof payload?.category === 'string' ? payload.category.trim() : '';
    const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
    const pair = Number(payload?.pair);

    if (!category || !message || !Number.isInteger(pair) || pair < 1) {
      return NextResponse.json({ error: 'Feedback requires a category, message, and pair number.' }, { status: 400 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.FEEDBACK_TO_EMAIL;
    const from = process.env.FEEDBACK_FROM_EMAIL;
    if (!apiKey || !to || !from) {
      return NextResponse.json({ error: 'Feedback email is not configured on the server.' }, { status: 503 });
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Pairwise] ${category} - pair ${pair}`,
        text: `Pairwise feedback\nType: ${category}\nPractice pair: ${pair}\n\n${message}`,
      }),
    });

    if (!emailResponse.ok) {
      return NextResponse.json({ error: 'Feedback could not be sent. Please try again.' }, { status: 502 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Feedback email failed', error);
    return NextResponse.json({ error: 'Feedback could not be sent. Please try again.' }, { status: 500 });
  }
}
