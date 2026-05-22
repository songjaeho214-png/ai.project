import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, count, difficulty } = await request.json();
    if (!text)
      return NextResponse.json(
        { error: '본문 내용을 입력해주세요.' },
        { status: 400 },
      );

    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `너는 학교 시험 문제를 출제하는 베테랑 교사야. 사용자가 제공하는 본문 내용을 바탕으로 실제 시험 문제를 출제해줘.
            [출제 규칙]
            1. 난이도는 '${difficulty}' 수준으로 출제할 것.
            2. 문항 수는 총 ${count}개로 출제할 것.
            3. 모든 문제는 5지선다형 객관식 문제로 만들 것.
            4. 출력은 반드시 아래의 JSON 스키마 형식을 엄격히 지켜서 반환할 것. 다른 텍스트는 절대 포함하지 말 것.
            [JSON 스키마 형식]
            {
              "quizzes": [
                {
                  "id": 1,
                  "question": "문제 내용",
                  "options": ["1번보기", "2번보기", "3번보기", "4번보기", "5번보기"],
                  "answer": "정답 내용 (보기 중 하나와 완벽히 일치해야 함)",
                  "explanation": "해설"
                }
              ]
            }`,
          },
          { role: 'user', content: `[본문 내용]\n${text}` },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      const quizData = JSON.parse(data.choices[0].message.content);
      return NextResponse.json(quizData);
    } else {
      throw new Error('AI 응답 생성 실패');
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '문제 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
