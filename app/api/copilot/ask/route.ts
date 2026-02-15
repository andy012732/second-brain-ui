import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // 模擬回應
      return NextResponse.json({ 
        answer: "🤖 Copilot 尚未設定 OpenAI API Key。\n\n請在 Vercel 環境變數中設定 `OPENAI_API_KEY` 即可啟用真實 AI 對話功能！\n\n不過我現在可以告訴你，你剛剛問的是：" + question 
      });
    }

    // 真實呼叫 (如果有 Key)
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: "system", content: "You are a helpful assistant for a personal knowledge base. Answer based on the provided note content." },
                { role: "user", content: `Context:\n${context}\n\nQuestion: ${question}` }
            ]
        })
    });

    const data = await res.json();
    return NextResponse.json({ answer: data.choices[0].message.content });

  } catch (error) {
    return NextResponse.json({ error: 'AI failed' }, { status: 500 });
  }
}
