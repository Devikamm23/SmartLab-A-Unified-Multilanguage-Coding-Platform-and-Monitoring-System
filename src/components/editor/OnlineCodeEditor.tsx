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
  Sliders,
  Trash2,
  Clock,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  Lock,
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
    trackEditorInteraction,
    recordCodeRun,
    recordClipboardAttempt,
    updateActiveCode,
    submitLabProgram,
    sessionRemainingSeconds,
    totalSessionMinutes,
    handlePasteEvent,
    canStudentExecute,
    setStudentCompiling,
    activeBatchSession,
  } = useApp();

  const executionGate = canStudentExecute(currentUser);

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

  // Find active session
  const currentLabSession =
    labSessions.find((ls) => ls.id === activeLabSessionId) || labSessions[0];
  const currentExperiment = experiments.find(
    (e) => e.id === currentLabSession?.experimentId
  );
  const currentStudentSession = studentLabSessions.find(
    (s) => s.studentId === currentUser?.id && s.labSessionId === currentLabSession?.id
  );

  // Editor states
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(
    currentLabSession?.programmingLanguage || 'python'
  );
  const [code, setCode] = useState<string>(
    currentStudentSession?.currentCode ||
      currentExperiment?.starterCode ||
      SUPPORTED_LANGUAGES[selectedLanguage].defaultBoilerplate
  );
  const [isProblemOpen, setIsProblemOpen] = useState(true);

  // Consoles
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

  // Tab in bottom console: 'output' | 'input' | 'testcases'
  const [activeConsoleTab, setActiveConsoleTab] = useState<'output' | 'input' | 'testcases'>('output');

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

  // Monaco editor mount handler with onDidPaste listener
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Listen for paste event directly in Monaco
    editor.onDidPaste((e: any) => {
      const model = editor.getModel();
      if (model && e.range) {
        const pastedContent = model.getValueInRange(e.range);
        const lines = pastedContent.split('\n').length;
        const chars = pastedContent.length;

        // Perform AI Code Similarity & Copy-Paste Analysis
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
    // Only intercept Cut or Copy if copy/paste restriction is active
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

  // Live demonstration helper: simulates student pasting an external code block
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

  // Clear consoles
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
      setActiveConsoleTab('output');
      return;
    }

    setIsRunning(true);
    setStudentCompiling(true);
    setExecutionStatus('Compiling & Executing...');
    setActiveConsoleTab('output');
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
      setActiveConsoleTab('output');
      return;
    }

    setIsSubmitting(true);
    setStudentCompiling(true);
    setExecutionStatus('Grading Test Suite...');
    setActiveConsoleTab('testcases');
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
      className="h-[calc(100vh-4rem)] flex flex-col bg-[#070b19] overflow-hidden select-none"
    >
      {/* Top Editor Toolbar */}
      <div className="h-12 bg-[#0e1738] border-b border-slate-800 px-4 flex items-center justify-between gap-3 shrink-0">
        {/* Left: Problem Details Toggle & Lab Session Picker */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsProblemOpen(!isProblemOpen)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isProblemOpen
                ? 'bg-slate-800 text-sky-300 border border-slate-700'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Experiment Guide</span>
            {isProblemOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Session:</span>
            <select
              value={activeLabSessionId || ''}
              onChange={(e) => setActiveLabSessionId(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-hidden focus:border-sky-500 max-w-[200px] sm:max-w-xs truncate"
            >
              {labSessions.map((ls) => (
                <option key={ls.id} value={ls.id}>
                  {ls.subjectCode} · {ls.batch}: {ls.experimentName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Language Selector (C, Python, Java) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 hidden md:inline">Language:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
            className="px-3 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs font-bold text-sky-300 font-mono focus:outline-hidden focus:border-sky-500"
          >
            <option value="c">C (GCC 11.2)</option>
            <option value="python">Python (3.11.2)</option>
            <option value="java">Java (OpenJDK 17)</option>
          </select>

          <button
            onClick={handleResetCode}
            className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClearConsoles}
            className="p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Clear output console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Actions & Session Countdown */}
        <div className="flex items-center gap-2.5">
          {/* Lab Session Remaining Timer & Activity Status */}
          <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-sky-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-bold tabular-nums">{formatCountdown(sessionRemainingSeconds)}</span>
              <span className="text-[10px] text-slate-400">/ {totalSessionMinutes}m</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                currentStudentSession?.activityStatus === 'Typing'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  : currentStudentSession?.activityStatus === 'Compiling' || isRunning || isSubmitting
                  ? 'bg-orange-950 text-orange-400 border-orange-500/40'
                  : currentStudentSession?.activityStatus === 'Submitted'
                  ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                  : currentStudentSession?.activityStatus === 'Idle'
                  ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                  : 'bg-sky-950 text-sky-400 border-sky-500/40'
              }`}
            >
              {isRunning || isSubmitting
                ? 'Compiling'
                : currentStudentSession?.activityStatus || 'Viewing'}
            </span>
          </div>

          {isCopyPasteRestricted && (
            <div className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded">
              <Lock className="w-3 h-3" />
              <span>Copy/Paste Locked</span>
            </div>
          )}

          <button
            onClick={triggerTestBulkPaste}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-mono transition-colors shadow-xs"
            title="Simulate student pasting a 28-line code block to demonstrate real-time AI integrity detection and faculty alerts"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span>Simulate Paste</span>
          </button>

          <button
            onClick={handleRunCode}
            disabled={!executionGate.allowed || isRunning || isSubmitting}
            title={!executionGate.allowed ? executionGate.reason : 'Compile and execute code'}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            <Play className={`w-3.5 h-3.5 text-emerald-400 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Compiling...' : 'Run Code'}</span>
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={!executionGate.allowed || isRunning || isSubmitting}
            title={!executionGate.allowed ? executionGate.reason : 'Submit code for evaluation'}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20"
          >
            <Send className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-pulse' : ''}`} />
            <span>{isSubmitting ? 'Grading...' : 'Submit Lab'}</span>
          </button>
        </div>
      </div>

      {/* One-Active-Batch Execution Gate Notice */}
      {!executionGate.allowed && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-2 z-30">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold">{executionGate.reason}</span>
          </div>
          {activeBatchSession && (
            <span className="text-[11px] font-mono text-amber-300 bg-black/30 px-2 py-0.5 rounded border border-amber-500/30">
              Active Batch: Sem {activeBatchSession.semesterNumber} {activeBatchSession.batch} · {formatCountdown(sessionRemainingSeconds)} left
            </span>
          )}
        </div>
      )}

      {/* Copy-Paste Violation Alert Banner */}
      {clipboardAlertMsg && (
        <div className="bg-rose-950/90 border-b border-rose-500/50 px-4 py-2 text-rose-200 text-xs flex items-center justify-between z-30">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{clipboardAlertMsg}</span>
          </div>
          <span className="text-[10px] font-mono text-rose-300">Recorded to Teacher Log</span>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Collapsible Problem & Experiment Guide */}
        {isProblemOpen && currentExperiment && (
          <div className="w-80 lg:w-96 bg-[#090f22] border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-4 text-xs space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                  {currentExperiment.subjectCode}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Exp #{currentExperiment.experimentNumber}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {currentExperiment.title}
              </h2>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Max Marks: <strong className="text-emerald-400">{currentExperiment.maxMarks}</strong> · Sem {currentLabSession?.semesterNumber} ({currentLabSession?.batch})
              </div>
            </div>

            {/* Problem Statement */}
            <div className="space-y-1.5 text-slate-300 leading-relaxed">
              <h3 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider font-mono">
                Problem Description
              </h3>
              <p className="whitespace-pre-line text-slate-300">{currentExperiment.problemStatement}</p>
            </div>

            {/* Formats */}
            <div className="space-y-2">
              <div>
                <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider font-mono">
                  Input Format
                </h4>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-line">
                  {currentExperiment.inputFormat}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider font-mono">
                  Output Format
                </h4>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-line">
                  {currentExperiment.outputFormat}
                </div>
              </div>
            </div>

            {/* Constraints */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider font-mono">
                Constraints
              </h4>
              <ul className="space-y-1 font-mono text-[11px] text-slate-400 list-disc list-inside">
                {currentExperiment.constraints.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Sample Test Cases */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <h4 className="font-bold text-slate-200 uppercase text-[10px] tracking-wider font-mono">
                Sample Test Cases
              </h4>
              {currentExperiment.testCases
                .filter((tc) => !tc.isHidden)
                .map((tc, idx) => (
                  <div key={tc.id} className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-300 text-[11px]">
                        Sample #{idx + 1}
                      </span>
                      <button
                        onClick={() => {
                          setStdin(tc.input);
                          setActiveConsoleTab('input');
                        }}
                        className="text-[10px] text-sky-400 hover:text-sky-300 font-medium"
                      >
                        Copy to STDIN
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">Input:</span>
                      <pre className="font-mono text-[11px] text-slate-300 bg-[#070b19] p-1.5 rounded overflow-x-auto">
                        {tc.input}
                      </pre>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-mono block">Expected Output:</span>
                      <pre className="font-mono text-[11px] text-emerald-400 bg-[#070b19] p-1.5 rounded overflow-x-auto">
                        {tc.expectedOutput}
                      </pre>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Center: Monaco Editor & Consoles */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Monaco Editor Container */}
          <div className="flex-1 relative bg-[#0b132b]">
            <Editor
              height="100%"
              theme="vs-dark"
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
                contextmenu: !isCopyPasteRestricted, // disable right-click context menu when restricted!
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Console Ribbon */}
          <div className="h-9 bg-[#0e1738] border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-500 text-[11px]">Status:</span>
                <span
                  className={`font-bold ${
                    executionStatus === 'Accepted'
                      ? 'text-emerald-400'
                      : executionStatus.includes('Error')
                      ? 'text-rose-400'
                      : executionStatus === 'Ready'
                      ? 'text-slate-300'
                      : 'text-amber-400'
                  }`}
                >
                  {executionStatus}
                </span>
              </div>

              {executionTime && (
                <div className="hidden sm:flex items-center gap-1 font-mono text-[11px]">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="tabular-nums">{executionTime}s</span>
                </div>
              )}

              {memoryUsage && (
                <div className="hidden md:flex items-center gap-1 font-mono text-[11px]">
                  <Cpu className="w-3 h-3 text-slate-500" />
                  <span className="tabular-nums">{(memoryUsage / 1024).toFixed(1)} MB</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveConsoleTab('output')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeConsoleTab === 'output' ? 'bg-slate-800 text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Output Console
              </button>
              <button
                onClick={() => setActiveConsoleTab('input')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeConsoleTab === 'input' ? 'bg-slate-800 text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Standard Input (STDIN)
              </button>
              <button
                onClick={() => setActiveConsoleTab('testcases')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                  activeConsoleTab === 'testcases' ? 'bg-slate-800 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Test Cases Suite {submissionResults ? `(${submissionResults.filter(r => r.passed).length}/${submissionResults.length})` : ''}
              </button>
            </div>
          </div>

          {/* Bottom Console Drawer */}
          <div className="h-44 bg-[#090f22] border-t border-slate-800 p-3 overflow-y-auto text-xs font-mono">
            {/* Output tab */}
            {activeConsoleTab === 'output' && (
              <div className="h-full flex flex-col space-y-2">
                {compileOutput && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 whitespace-pre-wrap">
                    <div className="font-bold text-[11px] text-rose-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Compilation Diagnostics:</span>
                    </div>
                    {compileOutput}
                  </div>
                )}

                {stderr && !compileOutput && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 whitespace-pre-wrap">
                    <div className="font-bold text-[11px] text-rose-400 mb-1">Standard Error (stderr):</div>
                    {stderr}
                  </div>
                )}

                {stdout ? (
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">Standard Output (stdout):</div>
                    <pre className="text-emerald-300 whitespace-pre-wrap">{stdout}</pre>
                  </div>
                ) : (
                  !compileOutput &&
                  !stderr && (
                    <div className="text-slate-500 italic py-2">
                      Click "Run Code" to compile and execute against current input, or "Submit Lab" to evaluate all test cases.
                    </div>
                  )
                )}

                {executionEngineNotice && (
                  <div className="mt-auto pt-2 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-800/80">
                    <span>Engine: {executionEngineNotice}</span>
                    <span>Air-Gapped: Program executed in isolated container sandbox</span>
                  </div>
                )}
              </div>
            )}

            {/* Input tab */}
            {activeConsoleTab === 'input' && (
              <div className="h-full flex flex-col space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>Enter Standard Input (stdin) fed to your program:</span>
                  <button onClick={() => setStdin('')} className="text-slate-500 hover:text-slate-300">
                    Clear Input
                  </button>
                </div>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  className="flex-1 w-full bg-[#070b19] border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-sky-500 resize-none"
                  placeholder="Paste or type test input..."
                />
              </div>
            )}

            {/* Test cases tab */}
            {activeConsoleTab === 'testcases' && (
              <div className="space-y-3">
                {submissionResults ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {submissionResults.map((tc) => (
                      <div
                        key={tc.testCaseId}
                        className={`p-2.5 rounded-lg border text-xs ${
                          tc.passed
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                            : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold flex items-center gap-1.5">
                            {tc.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span>Test Case #{tc.index} {tc.isHidden ? '(Hidden)' : '(Visible)'}</span>
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{tc.executionTime}s</span>
                        </div>
                        {!tc.isHidden ? (
                          <div className="space-y-1 text-[11px] font-mono">
                            <div className="text-slate-400">In: <span className="text-slate-200">{tc.input.replace(/\n/g, ' ')}</span></div>
                            <div className="text-slate-400">Exp: <span className="text-emerald-400">{tc.expectedOutput.replace(/\n/g, ' ')}</span></div>
                            <div className="text-slate-400">Out: <span className={tc.passed ? 'text-emerald-400' : 'text-rose-400'}>{tc.actualOutput.replace(/\n/g, ' ') || '(no output)'}</span></div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-400 italic">Hidden verification test vector.</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 italic py-4 text-center">
                    Click "Submit Lab" to evaluate all test cases and log final marks.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STUDENT WARNING NOTIFICATION MODAL: Academic Integrity Alert */}
      {studentWarningModal?.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0e1738] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-tight">Academic Integrity Alert</h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                    Warning Issued
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Automated telemetry alert generated by SmartLab Academic Integrity Engine
                </p>
              </div>
            </div>

            {/* Prompt's exact mandatory message */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              &quot;Unusual copy-paste activity has been detected in your coding session. Please ensure that your submitted code represents your own work.&quot;
            </div>

            {/* Event Details Grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Date & Time</span>
                <span className="text-slate-200 font-bold">{studentWarningModal.timestamp}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Warning Status</span>
                <span className="text-amber-400 font-bold">Active Warning</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Assignment Name</span>
                <span className="text-sky-300 truncate block font-sans font-semibold">
                  {studentWarningModal.assignmentName}
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Activity Details</span>
                <span className="text-slate-300 font-sans text-[11px] block">
                  Pasted {studentWarningModal.linesPasted} lines ({studentWarningModal.charsPasted} characters) from an external clipboard buffer.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal italic">
              *Notice: Similarity indicators are recorded for faculty review, not automatic punishment. Faculty members review the code logic before making any academic evaluation.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStudentWarningModal(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
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
