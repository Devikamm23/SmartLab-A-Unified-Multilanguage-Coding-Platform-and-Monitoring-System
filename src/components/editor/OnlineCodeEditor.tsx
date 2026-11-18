import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useApp } from '../../context/AppContext';
import { SupportedLanguage, TestCaseResult } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../data/mockData';
import { executeCode, runAllTestCases } from '../../services/judge0Service';
import {
  Play,
  Send,
  RotateCcw,
  Trash2,
  Clock,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ShieldAlert,
  Lock,
  ArrowLeft,
  Terminal,
  Sliders,
  X,
} from 'lucide-react';

interface OnlineCodeEditorProps {
  onOpenJudge0Modal: () => void;
}

export const OnlineCodeEditor: React.FC<OnlineCodeEditorProps> = ({ onOpenJudge0Modal }) => {
  const {
    currentUser,
    labSessions,
    experiments,
    studentLabSessions,
    activeLabSessionId,
    setActiveLabSessionId,
    setActiveNavTab,
    trackEditorInteraction,
    recordCodeRun,
    recordClipboardAttempt,
    updateActiveCode,
    submitLabProgram,
    studentLabTimerSeconds,
    handlePasteEvent,
    canStudentExecute,
    setStudentCompiling,
    activeBatchSession,
  } = useApp();

  // Find active session
  const currentLabSession =
    labSessions.find((ls) => ls.id === activeLabSessionId) || labSessions[0];
  const currentExperiment = experiments.find(
    (e) => e.id === currentLabSession?.experimentId
  );
  const currentStudentSession = studentLabSessions.find(
    (s) => s.studentId === currentUser?.id && s.labSessionId === currentLabSession?.id
  );

  const executionGate = canStudentExecute(currentUser, currentLabSession?.id);

  const editorRef = useRef<any>(null);

  // Student Warning Notification Modal (Academic Integrity Alert)
  const [studentWarningModal, setStudentWarningModal] = useState<{
    isOpen: boolean;
    assignmentName: string;
    linesPasted: number;
    charsPasted: number;
    timestamp: string;
    riskLevel: string;
    similarityScore: number;
  } | null>(null);

  // Problem Question Modal (replaces LeetCode split-pane sidebar)
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

  // Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    currentLabSession?.programmingLanguage || 'python'
  );
  const [code, setCode] = useState<string>(
    currentStudentSession?.currentCode ||
      currentExperiment?.starterCode ||
      SUPPORTED_LANGUAGES[selectedLanguage].defaultBoilerplate
  );

  // Right Terminal Panel states
  const [stdin, setStdin] = useState<string>('');
  const [stdout, setStdout] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');
  const [compileOutput, setCompileOutput] = useState<string>('');
  const [executionEngineNotice, setExecutionEngineNotice] = useState<string>('');

  // Status & Metrics
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionStatus, setExecutionStatus] = useState<string>('Ready');
  const [executionTime, setExecutionTime] = useState<string | null>(null);
  const [memoryUsage, setMemoryUsage] = useState<number | null>(null);
  const [clipboardAlertMsg, setClipboardAlertMsg] = useState<string | null>(null);

  // Right Terminal Tab: 'terminal' | 'testcases'
  const [activeTerminalTab, setActiveTerminalTab] = useState<'terminal' | 'testcases'>('terminal');

  // Submit test cases results
  const [submissionResults, setSubmissionResults] = useState<TestCaseResult[] | null>(null);

  // Copy-paste restriction policy check
  const isCopyPasteRestricted = currentLabSession?.isCopyPasteRestricted ?? true;

  // Sync starter code or saved code when lab session or language changes
  useEffect(() => {
    if (currentLabSession) {
      setSelectedLanguage(currentLabSession.programmingLanguage);
    }
  }, [currentLabSession?.id]);

  useEffect(() => {
    if (currentStudentSession?.currentCode) {
      setCode(currentStudentSession.currentCode);
    } else if (currentExperiment?.starterCode) {
      setCode(currentExperiment.starterCode);
    } else {
      setCode(SUPPORTED_LANGUAGES[selectedLanguage].defaultBoilerplate);
    }

    if (currentExperiment?.testCases?.[0]) {
      setStdin(currentExperiment.testCases[0].input);
    }
  }, [currentExperiment?.id, selectedLanguage]);

  // Handle Code changes with active tracking
  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    updateActiveCode(newCode);
  };

  // Monaco editor mount handler with onDidPaste & onKeyDown listeners
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    editor.onKeyDown(() => {
      trackEditorInteraction(true);
    });

    editor.onDidPaste((e: any) => {
      const model = editor.getModel();
      if (model && e.range) {
        const pastedContent = model.getValueInRange(e.range);
        const lines = pastedContent.split('\n').length;
        const chars = pastedContent.length;

        const comp = handlePasteEvent(pastedContent, lines, chars);
        if (comp && comp.isSuspicious) {
          setStudentWarningModal({
            isOpen: true,
            assignmentName: currentLabSession?.experimentName || 'Laboratory Assignment',
            linesPasted: lines,
            charsPasted: chars,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            riskLevel: comp.riskLevel,
            similarityScore: comp.similarityScore,
          });
        }
      }
    });
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isCopyPasteRestricted && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'x')) {
      e.preventDefault();
      e.stopPropagation();

      const action = e.key === 'c' ? 'copy' : 'cut';
      recordClipboardAttempt(action);

      setClipboardAlertMsg(
        `Academic Security Notice: Clipboard ${action.toUpperCase()} is restricted in this laboratory session.`
      );
      setTimeout(() => setClipboardAlertMsg(null), 3500);
    }
  };

  // Simulate paste demonstration
  const triggerTestBulkPaste = () => {
    const testSnippet = `import java.util.concurrent.Semaphore;

class SharedResource {
    static int count = 0;
    static Semaphore sem = new Semaphore(1);
    
    void modify(String threadName) {
        try {
            System.out.println(threadName + " waiting for lock");
            sem.acquire();
            System.out.println(threadName + " acquired lock");
            for(int i = 0; i < 5; i++) {
                count++;
                System.out.println(threadName + ": " + count);
                Thread.sleep(100);
            }
        } catch(InterruptedException e) {
            e.printStackTrace();
        } finally {
            System.out.println(threadName + " released lock");
            sem.release();
        }
    }
}`;
    const lines = testSnippet.split('\n').length;
    const chars = testSnippet.length;

    const newCode = code + '\n\n' + testSnippet;
    setCode(newCode);
    updateActiveCode(newCode);

    const comp = handlePasteEvent(testSnippet, lines, chars);
    if (comp && comp.isSuspicious) {
      setStudentWarningModal({
        isOpen: true,
        assignmentName: currentLabSession?.experimentName || 'Java Programming Lab',
        linesPasted: lines,
        charsPasted: chars,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        riskLevel: comp.riskLevel,
        similarityScore: comp.similarityScore,
      });
    }
  };

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getTerminalCommand = () => {
    if (selectedLanguage === 'c') return 'gcc main.c -o main && ./main';
    if (selectedLanguage === 'java') return 'javac Main.java && java Main';
    return 'python3 main.py';
  };

  // Clear terminal output
  const handleClearConsoles = () => {
    setStdout('');
    setStderr('');
    setCompileOutput('');
    setExecutionStatus('Ready');
    setExecutionTime(null);
    setMemoryUsage(null);
  };

  // Reset Code
  const handleResetCode = () => {
    if (confirm('Reset code to default experiment template? Unsaved changes will be discarded.')) {
      const defaultCode =
        currentExperiment?.starterCode ||
        SUPPORTED_LANGUAGES[selectedLanguage].defaultBoilerplate;
      setCode(defaultCode);
      updateActiveCode(defaultCode);
    }
  };

  // Run Code against STDIN
  const handleRunCode = async () => {
    if (!executionGate.allowed) {
      setStderr(executionGate.reason || 'Execution is locked for your batch.');
      setExecutionStatus('Batch Locked');
      setActiveTerminalTab('terminal');
      return;
    }

    setIsRunning(true);
    setStudentCompiling(true);
    setExecutionStatus('Running...');
    setActiveTerminalTab('terminal');
    setStdout('');
    setStderr('');
    setCompileOutput('');

    try {
      const result = await executeCode(
        code,
        selectedLanguage,
        stdin,
        currentExperiment?.testCases?.[0]?.expectedOutput
      );

      setStdout(result.stdout || '');
      setStderr(result.stderr || '');
      setCompileOutput(result.compile_output || '');
      setExecutionStatus(result.status.description);
      setExecutionTime(result.time);
      setMemoryUsage(result.memory);
      setExecutionEngineNotice(result.executionEngine);

      const isSuccess = result.status.id === 3;
      const isError = Boolean(result.stderr || result.compile_output);
      recordCodeRun(isSuccess, isError);
    } catch (err: any) {
      setStderr(`Execution failed: ${err.message || 'Unknown error'}`);
      setExecutionStatus('Runtime Error');
      recordCodeRun(false, true);
    } finally {
      setStudentCompiling(false);
      setIsRunning(false);
    }
  };

  // Submit Code against all test cases
  const handleSubmitCode = async () => {
    if (!currentExperiment) return;
    if (!executionGate.allowed) {
      setStderr(executionGate.reason || 'Submission & execution are locked for your batch.');
      setExecutionStatus('Batch Locked');
      setActiveTerminalTab('terminal');
      return;
    }

    setIsSubmitting(true);
    setStudentCompiling(true);
    setExecutionStatus('Grading Test Suite...');
    setActiveTerminalTab('testcases');
    setStdout('');
    setStderr('');
    setCompileOutput('');

    try {
      const results = await runAllTestCases(
        code,
        selectedLanguage,
        currentExperiment.testCases
      );

      setSubmissionResults(results);

      const totalCases = results.length;
      const passedCases = results.filter((r) => r.passed).length;
      const allPassed = passedCases === totalCases;

      let verdict: 'Accepted' | 'Wrong Answer' | 'Compilation Error' = 'Wrong Answer';
      if (results.some((r) => r.errorDetails?.includes('error'))) {
        verdict = 'Compilation Error';
      } else if (allPassed) {
        verdict = 'Accepted';
      }

      setExecutionStatus(verdict);
      const score = Math.round((passedCases / totalCases) * currentExperiment.maxMarks);

      const avgTime = results.reduce((a, r) => a + r.executionTime, 0) / (results.length || 1);
      const maxMem = Math.max(...results.map((r) => r.memoryKb), 14200);

      setExecutionTime(avgTime.toFixed(3));
      setMemoryUsage(maxMem);

      submitLabProgram(code, verdict, score, parseFloat(avgTime.toFixed(3)), maxMem);
      recordCodeRun(allPassed, !allPassed);
    } catch (err: any) {
      setStderr(`Evaluation error: ${err.message}`);
      setExecutionStatus('Evaluation Error');
      recordCodeRun(false, true);
    } finally {
      setStudentCompiling(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      className="h-screen w-full flex flex-col bg-[#f4f8ff] overflow-hidden select-none"
    >
      {/* Top Full-Page Lab Workspace Header */}
      <header className="h-14 bg-white border-b border-blue-100 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Exit to Dashboard + Session Selector + Experiment Details button */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setActiveNavTab('dashboard')}
            className="px-3 py-1.5 rounded-lg bg-blue-50/60 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-slate-800 hover:text-slate-900 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Back to Dashboard</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 min-w-0">
            <select
              value={activeLabSessionId || ''}
              onChange={(e) => setActiveLabSessionId(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-blue-500 max-w-[240px] lg:max-w-xs truncate"
            >
              {labSessions
                .filter(
                  (ls) =>
                    !ls.isMakeup ||
                    currentUser?.role !== 'student' ||
                    ls.allowedStudentIds?.includes(currentUser.id)
                )
                .map((ls) => (
                  <option key={ls.id} value={ls.id}>
                    {ls.isMakeup ? '[Makeup Lab] ' : `${ls.subjectCode}: `}
                    {ls.experimentName}
                  </option>
                ))}
            </select>

            {executionGate.isMakeupAccess && (
              <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-300 shrink-0">
                Makeup Lab
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsProblemModalOpen(true)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-50/60 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-blue-700 flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Program Aim & Instructions</span>
            <span className="md:hidden">Aim</span>
          </button>
        </div>

        {/* Right: Language, Timer, Status, Run & Submit */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs font-bold text-blue-700 font-mono focus:outline-hidden focus:border-blue-500"
          >
            <option value="c">C (GCC 11.2)</option>
            <option value="python">Python (3.11.2)</option>
            <option value="java">Java (OpenJDK 17)</option>
          </select>

          <button
            type="button"
            onClick={handleResetCode}
            className="p-1.5 rounded-lg bg-blue-50/60 hover:bg-blue-100 text-slate-600 hover:text-slate-900 border border-blue-100 transition-colors cursor-pointer"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenJudge0Modal}
            className="hidden sm:flex p-1.5 rounded-lg bg-blue-50/60 hover:bg-blue-100 text-slate-600 hover:text-blue-700 border border-blue-100 transition-colors cursor-pointer"
            title="Compiler Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Lab Timer & Activity Status */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-700">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold tabular-nums">{formatCountdown(studentLabTimerSeconds)}</span>
            </div>
            <span
              className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                currentStudentSession?.activityStatus === 'Typing'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : currentStudentSession?.activityStatus === 'Compiling' || isRunning || isSubmitting
                  ? 'bg-orange-50 text-orange-600 border-orange-300'
                  : currentStudentSession?.activityStatus === 'Submitted'
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : currentStudentSession?.activityStatus === 'Idle'
                  ? 'bg-amber-50 text-amber-600 border-amber-300'
                  : 'bg-blue-50 text-blue-600 border-blue-300'
              }`}
            >
              {isRunning || isSubmitting
                ? 'Compiling'
                : currentStudentSession?.activityStatus || 'Viewing'}
            </span>
          </div>

          <button
            type="button"
            onClick={triggerTestBulkPaste}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-700 text-xs font-mono transition-colors cursor-pointer"
            title="Simulate external code paste"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>Simulate Paste</span>
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={!executionGate.allowed || isRunning || isSubmitting}
            title={!executionGate.allowed ? executionGate.reason : 'Run program in right terminal'}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitCode}
            disabled={!executionGate.allowed || isRunning || isSubmitting}
            title={!executionGate.allowed ? executionGate.reason : 'Submit lab program'}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Lab'}</span>
          </button>
        </div>
      </header>

      {/* Compact Experiment Banner */}
      {currentExperiment && (
        <div className="bg-[#f4f8ff] border-b border-blue-100 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-200 shrink-0">
              {currentExperiment.subjectCode} · Exp #{currentExperiment.experimentNumber}
            </span>
            <span className="font-semibold text-slate-900 truncate">
              {currentExperiment.title}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 shrink-0">
            <span>Max Marks: <strong className="text-emerald-600">{currentExperiment.maxMarks}</strong></span>
            {isCopyPasteRestricted && (
              <span className="inline-flex items-center gap-1 text-amber-600">
                <Lock className="w-3 h-3" />
                Copy/Paste Locked
              </span>
            )}
          </div>
        </div>
      )}

      {/* Batch Execution Lock Notice */}
      {!executionGate.allowed && (
        <div className="bg-amber-50 border-b border-amber-300 px-4 py-2 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">{executionGate.reason}</span>
          </div>
          {activeBatchSession && (
            <span className="text-[11px] font-mono text-amber-700 bg-blue-100/80 px-2 py-0.5 rounded border border-amber-200">
              Active Batch: Sem {activeBatchSession.semesterNumber} {activeBatchSession.batch}
            </span>
          )}
        </div>
      )}

      {/* Copy-Paste Violation Alert Banner */}
      {clipboardAlertMsg && (
        <div className="bg-rose-50 border-b border-rose-300 px-4 py-2 text-rose-800 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{clipboardAlertMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-rose-700">Recorded to Faculty Log</span>
        </div>
      )}

      {/* Main Split Workspace: LEFT = Code Editor, RIGHT = Terminal */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT: Code Editor */}
        <div className="flex-1 min-w-0 min-h-[300px] flex flex-col bg-white">
          <div className="h-9 bg-white border-b border-blue-100 px-4 flex items-center justify-between text-xs font-mono text-slate-600 shrink-0">
            <span>
              {selectedLanguage === 'c'
                ? 'main.c'
                : selectedLanguage === 'java'
                ? 'Main.java'
                : 'main.py'}
            </span>
            <span className="text-[11px] text-slate-500">
              {SUPPORTED_LANGUAGES[selectedLanguage].name}
            </span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              theme="light"
              language={SUPPORTED_LANGUAGES[selectedLanguage].monacoLang}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontLigatures: true,
                automaticLayout: true,
                tabSize: 4,
                lineNumbers: 'on',
                contextmenu: !isCopyPasteRestricted,
                padding: { top: 14, bottom: 14 },
              }}
            />
          </div>
        </div>

        {/* RIGHT: Dedicated Lab Terminal */}
        <aside className="w-full lg:w-[440px] xl:w-[500px] h-[340px] lg:h-auto shrink-0 bg-[#f4f8ff] border-t lg:border-t-0 lg:border-l border-blue-100 flex flex-col overflow-hidden">
          {/* Terminal Title Header */}
          <div className="h-9 bg-white border-b border-blue-100 px-3.5 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 font-mono">
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-bold text-slate-800">Terminal</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  executionStatus === 'Accepted'
                    ? 'bg-emerald-50 text-emerald-600'
                    : executionStatus.includes('Error') || executionStatus === 'Batch Locked'
                    ? 'bg-rose-50 text-rose-600'
                    : executionStatus === 'Ready'
                    ? 'bg-blue-100 text-slate-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {executionStatus}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setActiveTerminalTab('terminal')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeTerminalTab === 'terminal'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Console
              </button>
              <button
                type="button"
                onClick={() => setActiveTerminalTab('testcases')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeTerminalTab === 'testcases'
                    ? 'bg-blue-100 text-emerald-700'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Tests {submissionResults ? `(${submissionResults.filter((r) => r.passed).length}/${submissionResults.length})` : ''}
              </button>
              <button
                type="button"
                onClick={handleClearConsoles}
                className="p-1 rounded hover:bg-blue-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Clear terminal"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Body */}
          {activeTerminalTab === 'terminal' ? (
            <div className="flex-1 flex flex-col overflow-hidden font-mono text-xs">
              {/* Terminal Output Scroll Area */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#f4f8ff]">
                <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">student@smartlab:~$</span>
                  <span className="text-slate-800">{getTerminalCommand()}</span>
                </div>

                {compileOutput && (
                  <div className="p-2.5 rounded bg-rose-50 border border-rose-300 text-rose-700 whitespace-pre-wrap">
                    <div className="font-bold text-[11px] text-rose-600 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Compilation Error:</span>
                    </div>
                    {compileOutput}
                  </div>
                )}

                {stderr && !compileOutput && (
                  <div className="p-2.5 rounded bg-rose-50 border border-rose-300 text-rose-700 whitespace-pre-wrap">
                    <div className="font-bold text-[11px] text-rose-600 mb-1">stderr:</div>
                    {stderr}
                  </div>
                )}

                {stdout ? (
                  <pre className="text-emerald-700 whitespace-pre-wrap leading-relaxed">
                    {stdout}
                  </pre>
                ) : (
                  !compileOutput &&
                  !stderr && (
                    <p className="text-slate-500 italic text-[11px]">
                      Ready. Enter program input below if required, then click Run.
                    </p>
                  )
                )}

                {(executionTime || memoryUsage || executionEngineNotice) && (
                  <div className="pt-2 border-t border-blue-100 text-[10px] text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {executionTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {executionTime}s
                      </span>
                    )}
                    {memoryUsage && (
                      <span className="inline-flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-500" />
                        {(memoryUsage / 1024).toFixed(1)} MB
                      </span>
                    )}
                    {executionEngineNotice && (
                      <span className="text-slate-500 ml-auto">{executionEngineNotice}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Terminal Input (STDIN) Docked at Bottom of Right Terminal */}
              <div className="border-t border-blue-100 bg-[#f4f8ff] p-3 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Program Input (STDIN)</span>
                  <button
                    type="button"
                    onClick={() => setStdin('')}
                    className="text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  className="w-full bg-[#f4f8ff] border border-blue-100 rounded-lg p-2 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-blue-500 resize-none"
                  placeholder="Enter standard input values here..."
                />
              </div>
            </div>
          ) : (
            /* Test Cases Evaluation View inside Right Terminal */
            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-[#f4f8ff] text-xs font-mono">
              {submissionResults ? (
                submissionResults.map((tc) => (
                  <div
                    key={tc.testCaseId}
                    className={`p-3 rounded-lg border space-y-1.5 ${
                      tc.passed
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        {tc.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>
                          Test #{tc.index} {tc.isHidden ? '(Hidden)' : ''}
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-600">{tc.executionTime}s</span>
                    </div>

                    {!tc.isHidden ? (
                      <div className="space-y-1 text-[11px]">
                        <div className="text-slate-600">
                          In: <span className="text-slate-800">{tc.input.replace(/\n/g, ' ')}</span>
                        </div>
                        <div className="text-slate-600">
                          Expected: <span className="text-emerald-600">{tc.expectedOutput.replace(/\n/g, ' ')}</span>
                        </div>
                        <div className="text-slate-600">
                          Output:{' '}
                          <span className={tc.passed ? 'text-emerald-600' : 'text-rose-600'}>
                            {tc.actualOutput.replace(/\n/g, ' ') || '(no output)'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-600 italic">Hidden verification test case.</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-slate-500 italic py-8 text-center">
                  Click &quot;Submit Lab&quot; to evaluate all test cases.
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* Program Aim & Instructions Modal */}
      {isProblemModalOpen && currentExperiment && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50"
          onClick={() => setIsProblemModalOpen(false)}
        >
          <div
            className="bg-white border border-blue-200 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 uppercase block">
                  {currentExperiment.subjectCode} · Experiment #{currentExperiment.experimentNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">{currentExperiment.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProblemModalOpen(false)}
                className="p-1.5 rounded-lg bg-blue-50/60 hover:bg-blue-100 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider font-mono">
                  Problem Statement
                </h4>
                <p className="text-slate-800 leading-relaxed whitespace-pre-line">
                  {currentExperiment.problemStatement}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider font-mono mb-1">
                    Input Format
                  </h4>
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 font-mono text-[11px] text-slate-700 whitespace-pre-line">
                    {currentExperiment.inputFormat}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider font-mono mb-1">
                    Output Format
                  </h4>
                  <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 font-mono text-[11px] text-slate-700 whitespace-pre-line">
                    {currentExperiment.outputFormat}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 uppercase text-[10px] tracking-wider font-mono mb-1.5">
                  Sample Input & Output
                </h4>
                <div className="space-y-2">
                  {currentExperiment.testCases
                    .filter((tc) => !tc.isHidden)
                    .map((tc, idx) => (
                      <div key={tc.id} className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">Sample #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setStdin(tc.input);
                              setActiveTerminalTab('terminal');
                              setIsProblemModalOpen(false);
                            }}
                            className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                          >
                            Load Input into Terminal
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px]">
                          <pre className="bg-[#f4f8ff] p-2 rounded text-slate-700 overflow-x-auto">{tc.input}</pre>
                          <pre className="bg-[#f4f8ff] p-2 rounded text-emerald-600 overflow-x-auto">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT WARNING NOTIFICATION MODAL: Academic Integrity Alert */}
      {studentWarningModal?.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-amber-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Academic Integrity Alert</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    Warning Issued
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Automated telemetry alert generated by SmartLab Academic Integrity Engine
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              &quot;Unusual copy-paste activity has been detected in your coding session. Please ensure that your submitted code represents your own work.&quot;
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Date & Time</span>
                <span className="text-slate-800 font-bold">{studentWarningModal.timestamp}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Warning Status</span>
                <span className="text-amber-600 font-bold">Active Warning</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase block">Assignment Name</span>
                <span className="text-blue-700 truncate block font-sans font-semibold">
                  {studentWarningModal.assignmentName}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase block">Activity Details</span>
                <span className="text-slate-700 font-sans text-[11px] block">
                  Pasted {studentWarningModal.linesPasted} lines ({studentWarningModal.charsPasted} characters) from an external clipboard buffer.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 leading-normal italic">
              *Notice: Similarity indicators are recorded for faculty review, not automatic punishment. Faculty members review the code logic before making any academic evaluation.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStudentWarningModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md shadow-amber-600/20 cursor-pointer"
              >
                I Acknowledge & Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
