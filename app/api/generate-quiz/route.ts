import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, count, difficulty } = await request.json();
    if (!text) {
      return NextResponse.json(
        { error: '본문 내용을 입력해주세요.' },
        { status: 400 },
      );
    }

    // 구글 제미나이 API 키 가져오기 (.env.local에 저장한 값)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다.' },
        { status: 500 },
      );
    }

    // Google Gemini 1.5 Flash 모델 주소 (속도 엄청 빠르고 완전 무료 범위 넉넉함)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `너는 학교 시험 문제를 출제하는 베테랑 교사야. 사용자가 제공하는 본문 내용을 바탕으로 실제 시험 문제를 출제해줘.
    [출제 규칙]
    1. 난이도는 '${difficulty}' 수준으로 출제할 것.
    2. 문항 수는 총 ${count}개로 출제할 것.
    3. 모든 문제는 5지선다형 객관식 문제로 만들 것.
    4. 수학/과학 수식이 필요한 경우, 반드시 LaTeX 문법을 사용하여 '$수식$' 형식으로 감싸서 작성해줘. (예: $f(x) = x^3 - 3x$, $\\int_0^1 x dx$)
    5. 출력은 반드시 아래의 JSON 스키마 형식을 엄격히 지켜서 반환할 것. 마크다운 기호(\`\`\`json 등)나 다른 텍스트는 절대 포함하지 말고 순수 JSON 문자열만 반환해줘.

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
    }`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemInstruction}\n\n[본문 내용]\n${text}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json', // JSON 형태로만 뱉도록 구글에 강제 고정
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const jsonText = data.candidates[0].content.parts[0].text;
      const quizData = JSON.parse(jsonText);
      return NextResponse.json(quizData);
    } else {
      throw new Error('Gemini AI 응답 생성 실패');
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: '문제 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
