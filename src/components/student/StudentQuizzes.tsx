import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Quiz, QuizAttempt } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Award,
  Play,
  ArrowRight,
  BookOpen,
  AlertCircle,
} from 'lucide-react';

export const StudentQuizzes: React.FC = () => {
  const { currentUser, quizzes, quizAttempts, submitQuizAttempt } = useApp();

  const studentSemester = currentUser?.semester || currentUser?.currentSemester || 5;
  const studentBatch = currentUser?.batch || 'Batch A';

  const eligibleQuizzes = quizzes.filter(
    (q) =>
      q.semesterNumber === studentSemester &&
      (q.batch === 'All Batches' || q.batch === studentBatch) &&
      q.status !== 'draft'
  );

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [recentAttempt, setRecentAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    if (!activeQuiz) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeQuiz]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setAnswers({});
    setSecondsLeft(quiz.durationMinutes * 60);
    setRecentAttempt(null);
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const totalSeconds = activeQuiz.durationMinutes * 60;
    const elapsedMinutes = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    const attempt = submitQuizAttempt(activeQuiz.id, answers, elapsedMinutes);
    setRecentAttempt(attempt);
    setActiveQuiz(null);
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const rem = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  // Interactive Quiz Taking View
  if (activeQuiz) {
    const answeredCount = Object.keys(answers).length;
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-2 z-10 shadow-xl">
          <div>
            <span className="text-[11px] font-mono text-blue-700 block">
              {activeQuiz.subjectCode} · Semester {activeQuiz.semesterNumber} ({activeQuiz.batch})
            </span>
            <h2 className="text-base font-bold text-slate-900">{activeQuiz.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 font-mono text-xs text-blue-700">
              {answeredCount}/{activeQuiz.questions.length} Answered
            </div>
            <div
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 tabular-nums ${
                secondsLeft < 60
                  ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(secondsLeft)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {activeQuiz.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-blue-100 rounded-xl p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-900">
                  <span className="text-blue-600 font-mono mr-2">Q{idx + 1}.</span>
                  {q.questionText}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50/60 text-emerald-600 border border-blue-100 shrink-0">
                  {q.marks} Marks
                </span>
              </div>

              {q.codeSnippet && (
                <pre className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs font-mono text-blue-700 overflow-x-auto">
                  {q.codeSnippet}
                </pre>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {q.options.map((opt, optIdx) => {
                  const isSelected = answers[q.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                      className={`p-3 rounded-lg border text-left text-xs transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-semibold'
                          : 'bg-[#f4f8ff] border-blue-100 text-slate-700 hover:border-blue-200'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold border shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'bg-blue-50/60 border-blue-200 text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setActiveQuiz(null)}
            className="px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-semibold"
          >
            Exit Without Submitting
          </button>
          <button
            type="button"
            onClick={handleSubmitQuiz}
            className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Quiz Answers</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600" />
            <span>Laboratory Quizzes & Viva Assessments</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {COLLEGE_CONFIG.name} · Showing quizzes assigned to Semester {studentSemester} · {studentBatch}
          </p>
        </div>
      </div>

      {/* Instant Graded Feedback Banner */}
      {recentAttempt && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Quiz Submitted & Auto-Graded!</h3>
              <p className="text-xs text-emerald-700 mt-0.5">
                You scored <span className="font-bold">{recentAttempt.score} / {recentAttempt.totalMarks}</span> in {recentAttempt.timeTakenMinutes} minute(s).
              </p>
            </div>
          </div>
          <button
            onClick={() => setRecentAttempt(null)}
            className="text-xs text-slate-700 hover:text-slate-900 underline self-start sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Available Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {eligibleQuizzes.length === 0 ? (
          <div className="col-span-full bg-white border border-blue-100 rounded-xl p-10 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-600">
              No quizzes are currently published for Semester {studentSemester} ({studentBatch}).
            </p>
          </div>
        ) : (
          eligibleQuizzes.map((quiz) => {
            const myAttempt = quizAttempts.find(
              (a) => a.quizId === quiz.id && a.studentId === currentUser?.id
            );

            return (
              <div
                key={quiz.id}
                className="bg-white border border-blue-100 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-mono font-bold">
                      {quiz.subjectCode} · {quiz.batch}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${
                        myAttempt
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : quiz.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-blue-100 text-slate-600 border-blue-200'
                      }`}
                    >
                      {myAttempt ? 'Completed' : quiz.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{quiz.title}</h3>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-blue-600" />
                      <span>{quiz.subjectName}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Questions</span>
                      <span className="text-xs font-bold text-slate-900">{quiz.questions.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Duration</span>
                      <span className="text-xs font-bold text-blue-600">{quiz.durationMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Max Marks</span>
                      <span className="text-xs font-bold text-emerald-600">{quiz.totalMarks}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-blue-100 flex items-center justify-between">
                  {myAttempt ? (
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-600">
                        Score: {myAttempt.score} / {myAttempt.totalMarks}
                      </span>
                      <span className="text-[11px] text-slate-600 font-mono">
                        {myAttempt.timeTakenMinutes} min taken
                      </span>
                    </div>
                  ) : quiz.status === 'active' ? (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Quiz</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono">Quiz Closed by Faculty</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
