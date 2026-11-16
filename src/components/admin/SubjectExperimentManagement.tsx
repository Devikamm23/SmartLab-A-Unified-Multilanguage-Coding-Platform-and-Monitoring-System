import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Experiment, Subject, SupportedLanguage } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Code2,
  FileCode2,
  CheckCircle2,
} from 'lucide-react';

export const SubjectExperimentManagement: React.FC = () => {
  const { subjects, experiments, addSubject, addExperiment } = useApp();

  const [activeTab, setActiveTab] = useState<'subjects' | 'experiments'>('experiments');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Subject Modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');
  const [subSem, setSubSem] = useState(5);
  const [subLang, setSubLang] = useState<SupportedLanguage>('python');

  // Add Experiment Modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expSubId, setExpSubId] = useState(subjects[0]?.id || 'sub-cs504');
  const [expNumber, setExpNumber] = useState(1);
  const [expDesc, setExpDesc] = useState('');
  const [expStmt, setExpStmt] = useState('');
  const [expLang, setExpLang] = useState<SupportedLanguage>('python');
  const [expInput, setExpInput] = useState('');
  const [expOutput, setExpOutput] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    addSubject({
      code: subCode.toUpperCase(),
      name: subName,
      semesterNumber: subSem,
      primaryLanguage: subLang,
    });
    setShowSubjectModal(false);
    setSubCode('');
    setSubName('');
  };

  const handleAddExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetSub = subjects.find((s) => s.id === expSubId);

    addExperiment({
      subjectId: expSubId,
      subjectCode: targetSub?.code || 'CS504',
      experimentNumber: expNumber,
      title: expTitle,
      description: expDesc,
      problemStatement: expStmt,
      inputFormat: 'Read standard input lines',
      outputFormat: 'Print computed results to stdout',
      constraints: ['1 <= N <= 10^5'],
      programmingLanguage: expLang,
      maxMarks: 50,
      testCases: [
        { id: `tc-${Date.now()}`, input: expInput, expectedOutput: expOutput, isHidden: false },
      ],
      starterCode: `# Starter code for ${expTitle}\n`,
    });
    setShowExpModal(false);
    setExpTitle('');
  };

  const filteredExperiments = experiments.filter((e) =>
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.subjectCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Curriculum Subjects & Experiments</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain official syllabus laboratory subjects and curriculum experiments in C, Python, and Java
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold transition-colors flex items-center gap-1 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>

          <button
            onClick={() => setShowExpModal(true)}
            className="py-1.5 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experiment</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-1 w-fit">
        <button
          onClick={() => setActiveTab('experiments')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
            activeTab === 'experiments' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Curriculum Experiments ({experiments.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
            activeTab === 'subjects' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Laboratory Subjects ({subjects.length})
        </button>
      </div>

      {/* Experiments View */}
      {activeTab === 'experiments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExperiments.map((exp) => (
            <div
              key={exp.id}
              className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-3 shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold text-sky-400">
                    {exp.subjectCode} · Experiment #{exp.experimentNumber}
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-tight">{exp.title}</h3>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {exp.programmingLanguage}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2">{exp.description}</p>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>{exp.testCases.length} Test Cases</span>
                <span className="text-emerald-400 font-bold">Max Marks: {exp.maxMarks}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects View */}
      {activeTab === 'subjects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-base font-bold text-white font-mono">{sub.code}</span>
                  <h3 className="text-xs font-semibold text-slate-200">{sub.name}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-300">
                  Semester {sub.semesterNumber}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Language: <strong className="uppercase text-slate-200">{sub.primaryLanguage}</strong></span>
                <span>Credits: {sub.credits}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e1738] border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add Laboratory Course</h3>
            <form onSubmit={handleAddSubject} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={subCode}
                  onChange={(e) => setSubCode(e.target.value)}
                  placeholder="CS505"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Subject Title</label>
                <input
                  type="text"
                  required
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="e.g. Database Systems Laboratory"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Semester</label>
                  <select
                    value={subSem}
                    onChange={(e) => setSubSem(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Primary Runtime</label>
                  <select
                    value={subLang}
                    onChange={(e) => setSubLang(e.target.value as SupportedLanguage)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-sky-500 uppercase"
                  >
                    <option value="c">C</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Experiment Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e1738] border border-slate-700 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add Curriculum Experiment</h3>
            <form onSubmit={handleAddExperiment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Experiment Title</label>
                <input
                  type="text"
                  required
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  placeholder="e.g. Graph Breadth First Search"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Subject</label>
                  <select
                    value={expSubId}
                    onChange={(e) => setExpSubId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Language</label>
                  <select
                    value={expLang}
                    onChange={(e) => setExpLang(e.target.value as SupportedLanguage)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-emerald-500 uppercase"
                  >
                    <option value="c">C</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Short Description</label>
                <textarea
                  rows={2}
                  required
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1 font-mono">Sample STDIN</label>
                  <input
                    type="text"
                    required
                    value={expInput}
                    onChange={(e) => setExpInput(e.target.value)}
                    placeholder="4\n1 2 3 4"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-300 block mb-1 font-mono">Sample STDOUT</label>
                  <input
                    type="text"
                    required
                    value={expOutput}
                    onChange={(e) => setExpOutput(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
