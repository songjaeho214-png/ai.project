'use client';

import { useState } from 'react';

interface Quiz {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function Home() {
  const [text, setText] = useState('');
  const [count, setCount] = useState(3);
  const [difficulty, setDifficulty] = useState('중');
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAnswers, setShowAnswers] = useState<{ [key: number]: boolean }>(
    {},
  );

  const handleGenerate = async () => {
    setLoading(true);
    setQuizzes([]);
    setShowAnswers({});

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, count, difficulty }),
      });

      const data = await res.json();
      if (data.quizzes && data.quizzes.length > 0) {
        setQuizzes(data.quizzes);
        setIsModalOpen(true);
      } else {
        alert('문제를 생성하지 못했습니다. 다시 시도해주세요.');
      }
    } catch (err) {
      console.error(err);
      alert('오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswer = (id: number) => {
    setShowAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 md:px-20 print:bg-white print:py-0 print:px-0 text-black">
      <div className="max-w-4xl mx-auto print:hidden">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-2">
          📝 AI 출제 위원
        </h1>
        <p className="text-center text-gray-600 mb-8">
          내용을 입력하면 별도의 시험지 창에 문제를 출제해 드립니다.
        </p>

        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <textarea
            className="w-full h-60 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-black"
            placeholder="여기에 시험 문제를 출제할 본문 내용을 붙여넣으세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">
                문항 수:
                <select
                  className="ml-2 p-2 border border-gray-300 rounded text-black"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                >
                  <option value={3}>3문항</option>
                  <option value={5}>5문항</option>
                  <option value={10}>10문항</option>
                </select>
              </label>
              <label className="text-sm font-medium text-gray-700">
                난이도:
                <select
                  className="ml-2 p-2 border border-gray-300 rounded text-black"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="하">하 (기본 개념)</option>
                  <option value="중">중 (응용)</option>
                  <option value="상">상 (심화 고난도)</option>
                </select>
              </label>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !text}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'AI가 문제를 출제하는 중...' : '🚀 시험 문제 생성하기'}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto print:static print:bg-transparent print:p-0">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
            <div className="sticky top-0 bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center print:hidden">
              <h2 className="text-lg font-bold text-gray-800">
                ✨ AI 출제 완료
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                >
                  🖨️ 시험지 인쇄 / PDF 저장
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-md hover:bg-gray-600"
                >
                  닫기
                </button>
              </div>
            </div>
            <div className="p-10 bg-white min-h-[50vh]">
              <div className="border-4 border-double border-gray-800 p-6 mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-widest mb-2">
                  정 기 고 사
                </h1>
                <p className="text-sm text-gray-600">
                  과목: AI 생성 문제 | 난이도: ({difficulty})
                </p>
              </div>
              <div className="space-y-10">
                {quizzes.map((quiz, idx) => (
                  <div key={quiz.id}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {idx + 1}. {quiz.question}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4 mb-4">
                      {quiz.options.map((option, oIdx) => (
                        <div
                          key={oIdx}
                          className="text-gray-800 text-sm flex items-start"
                        >
                          <span className="font-bold mr-2 text-blue-600">
                            {['①', '②', '③', '④', '⑤'][oIdx]}
                          </span>{' '}
                          {option}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 print:hidden">
                      <button
                        onClick={() => toggleAnswer(quiz.id)}
                        className="text-xs font-semibold text-blue-500 hover:underline"
                      >
                        {showAnswers[quiz.id]
                          ? '정답 및 해설 숨기기 ▲'
                          : '정답 및 해설 보기 ▼'}
                      </button>
                      {showAnswers[quiz.id] && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg text-sm border border-blue-100">
                          <p className="text-blue-900 font-bold mb-1">
                            🎯 정답: {quiz.answer}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-semibold">💡 해설:</span>{' '}
                            {quiz.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
