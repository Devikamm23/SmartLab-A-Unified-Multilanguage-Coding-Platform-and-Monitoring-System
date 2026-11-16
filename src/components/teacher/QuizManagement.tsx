import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName, Quiz, QuizQuestion } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  Trash2,
  Eye,
  Lock,
  PlayCircle,
  FileEdit,
  Award,
  X,
} from 'lucide-react';

export const QuizManagement: React.FC = () => {
  const { quizzes, quizAttempts, subjects, createQuiz, toggleQuizStatus } = useApp();

  const [filterSemester, setFilterSemester] = useState<number | 'all'>('all');
  const [filterBatch, setFilterBatch] = useState<string>('all');
  const [selectedQuizForResults, setSelectedQuizForResults] = useState<Quiz | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create Quiz Form State
  const [title, setTitle] = useState('');
  const [semesterNumber, setSemesterNumber] = useState<number>(5);
  const [batch, setBatch] = useState<BatchName | 'All Batches'>('Batch A');
  const [subjectId, setSubjectId] = useState<string>(subjects[0]?.id || 'sub-is504');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [publishImmediately, setPublishImmediately] = useState<boolean>(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: `q-${Date.now()}`,
      questionText: '',
      codeSnippet: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      marks: 5,
      explanation: '',
    },
  ]);

  const filteredQuizzes = quizzes.filter((q) => {
    const semOk = filterSemester === 'all' || q.semesterNumber === filterSemester;
    const batchOk = filterBatch === 'all' || q.batch === filterBatch;
    return semOk && batchOk;
  });

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}-${prev.length + 1}`,
        questionText: '',
        codeSnippet: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 5,
        explanation: '',
      },
    ]);
  };

  const handleRemoveQuestion = (qId: string) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const handleQuestionChange = (qId: string, field: keyof QuizQuestion, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (qId: string, optIdx: number, val: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const nextOpts = [...q.options];
        nextOpts[optIdx] = val;
        return { ...q, options: nextOpts };
      })
    );
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    const validQuestions = questions.filter(
      (q) => q.questionText.trim().length > 0 && q.options.every((o) => o.trim().length > 0)
    );
    if (!title.trim() || validQuestions.length === 0) return;

    const chosenSubj =
      subjects.find((s) => s.id === subjectId) ||
      subjects.find((s) => s.semesterNumber === semesterNumber) ||
      subjects[0];

    const totalMarks = validQuestions.reduce((acc, q) => acc + (q.marks || 5), 0);

    createQuiz({
      title: title.trim(),
      subjectCode: chosenSubj?.code || `IS${semesterNumber}04`,
      subjectName: chosenSubj?.name || 'Information Science Laboratory',
      semesterNumber,
      batch,
      durationMinutes,
      totalMarks,
      status: publishImmediately ? 'active' : 'draft',
      questions: validQuestions.map((q) => ({
        ...q,
        codeSnippet: q.codeSnippet?.trim() ? q.codeSnippet : undefined,
        explanation: q.explanation?.trim() ? q.explanation : undefined,
      })),
    });

    setTitle('');
    setQuestions([
      {
        id: `q-${Date.now()}`,
        questionText: '',
        codeSnippet: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 5,
        explanation: '',
      },
    ]);
    setIsCreateOpen(false);
  };

  const activeResultsAttempts = selectedQuizForResults
    ? quizAttempts.filter((a) => a.quizId === selectedQuizForResults.id)
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-400" />
            <span>Quiz & Viva Assessment Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {COLLEGE_CONFIG.name} · Create batch-wise programming quizzes (Semesters 1–8) and evaluate student scores
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Semester & Batch Filter Bar */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">Semester:</span>
          <div className="flex flex-wrap rounded-lg bg-slate-900 border border-slate-800 p-1 gap-0.5">
            <button
              onClick={() => setFilterSemester('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                filterSemester === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setFilterSemester(sem)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  filterSemester === sem
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Batch:</span>
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-semibold focus:outline-hidden focus:border-indigo-500"
          >
            <option value="all">All Filters</option>
            <option value="All Batches">All Batches</option>
            <option value="Batch A">Batch A</option>
            <option value="Batch B">Batch B</option>
            <option value="Batch C">Batch C</option>
          </select>
        </div>
      </div>

      {/* Quiz Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full bg-[#0e1738] border border-slate-800 rounded-xl p-10 text-center text-xs text-slate-400">
            No quizzes match the selected Semester / Batch filter. Click &ldquo;Create New Quiz&rdquo; to publish one.
          </div>
        ) : (
          filteredQuizzes.map((quiz) => {
            const attempts = quizAttempts.filter((a) => a.quizId === quiz.id);
            const avgScore =
              attempts.length > 0
                ? Math.round(
                    attempts.reduce((sum, a) => sum + (a.score / a.totalMarks) * 100, 0) /
                      attempts.length
                  )
                : 0;

            return (
              <div
                key={quiz.id}
                className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4 shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30 text-[11px] font-mono font-bold">
                      Sem {quiz.semesterNumber} · {quiz.batch}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold uppercase ${
                        quiz.status === 'active'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                          : quiz.status === 'closed'
                          ? 'bg-slate-800 text-slate-400 border-slate-700'
                          : 'bg-amber-950 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {quiz.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-mono text-indigo-300 block">{quiz.subjectCode}</span>
                    <h3 className="text-sm font-bold text-white leading-snug mt-0.5">{quiz.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{quiz.subjectName}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-center font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Questions</span>
                      <span className="text-xs font-bold text-white">{quiz.questions.length}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Duration</span>
                      <span className="text-xs font-bold text-sky-400">{quiz.durationMinutes}m</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Marks</span>
                      <span className="text-xs font-bold text-emerald-400">{quiz.totalMarks}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      {attempts.length} Attempt{attempts.length === 1 ? '' : 's'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      Avg: {attempts.length > 0 ? `${avgScore}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedQuizForResults(quiz)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>View Attempts ({attempts.length})</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {quiz.status !== 'active' && (
                      <button
                        onClick={() => toggleQuizStatus(quiz.id, 'active')}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </button>
                    )}
                    {quiz.status === 'active' && (
                      <button
                        onClick={() => toggleQuizStatus(quiz.id, 'closed')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-semibold flex items-center gap-1"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Close</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quiz Attempts Modal */}
      {selectedQuizForResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-[#0e1738] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-[#090f22] border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">{selectedQuizForResults.title}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Semester {selectedQuizForResults.semesterNumber} · {selectedQuizForResults.batch} · Total Marks: {selectedQuizForResults.totalMarks}
                </p>
              </div>
              <button
                onClick={() => setSelectedQuizForResults(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              {activeResultsAttempts.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No student has submitted this quiz yet.
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-900 border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400">
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">USN</th>
                      <th className="py-2.5 px-3">Batch</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                      <th className="py-2.5 px-3 text-right">Time Taken</th>
                      <th className="py-2.5 px-3 text-right">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-[11px]">
                    {activeResultsAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-sans font-semibold text-white">{att.studentName}</td>
                        <td className="py-2.5 px-3 text-sky-400 font-bold">{att.usn}</td>
                        <td className="py-2.5 px-3 text-slate-300">{att.batch}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {att.score} / {att.totalMarks}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-300">{att.timeTakenMinutes} min</td>
                        <td className="py-2.5 px-3 text-right text-slate-400">
                          {new Date(att.submittedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Quiz Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-3xl bg-[#0e1738] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#090f22] border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-indigo-400" />
                <span>Create Batch-Wise Programming Quiz</span>
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="p-6 space-y-5 overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-300 block mb-1">Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lab Viva Quiz 2: Recursion & Backtracking"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Semester</label>
                  <select
                    value={semesterNumber}
                    onChange={(e) => setSemesterNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Target Batch</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value as BatchName | 'All Batches')}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="All Batches">All Batches (A, B & C)</option>
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                    <option value="Batch C">Batch C</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} — {sub.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={90}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(5, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                    Questions ({questions.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-2.5 py-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, qIdx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-indigo-400">
                        Question {qIdx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <label className="text-[11px] text-slate-400">Marks:</label>
                        <input
                          type="number"
                          min={1}
                          max={25}
                          value={q.marks}
                          onChange={(e) => handleQuestionChange(q.id, 'marks', Math.max(1, Number(e.target.value)))}
                          className="w-14 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-slate-200 text-xs text-center"
                        />
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                            title="Remove question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="text"
                      required
                      value={q.questionText}
                      onChange={(e) => handleQuestionChange(q.id, 'questionText', e.target.value)}
                      placeholder="Enter question statement..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-hidden focus:border-indigo-500"
                    />

                    <textarea
                      rows={2}
                      value={q.codeSnippet || ''}
                      onChange={(e) => handleQuestionChange(q.id, 'codeSnippet', e.target.value)}
                      placeholder="Optional code snippet (leave blank if none)..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-sky-300 font-mono text-[11px] focus:outline-hidden focus:border-indigo-500"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctOptionIndex === oIdx}
                            onChange={() => handleQuestionChange(q.id, 'correctOptionIndex', oIdx)}
                            className="accent-emerald-500"
                            title="Mark as correct option"
                          />
                          <input
                            type="text"
                            required
                            value={opt}
                            onChange={(e) => handleOptionChange(q.id, oIdx, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-indigo-500"
                          />
                        </div>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) => handleQuestionChange(q.id, 'explanation', e.target.value)}
                      placeholder="Optional answer explanation shown after submission..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-[11px]"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-bold text-slate-200 block">Publish Quiz Immediately</span>
                  <span className="text-[11px] text-slate-400">
                    Students in Semester {semesterNumber} ({batch}) will receive a notification and can attempt immediately.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={publishImmediately}
                  onChange={(e) => setPublishImmediately(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{publishImmediately ? 'Publish Quiz' : 'Save as Draft'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
