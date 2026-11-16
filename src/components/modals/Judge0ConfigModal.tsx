import React, { useState } from 'react';
import { getStoredJudge0Config, saveJudge0Config } from '../../services/judge0Service';
import { Judge0Config } from '../../types';
import { X, CheckCircle, ShieldAlert, Cpu, ExternalLink, HelpCircle } from 'lucide-react';

interface Judge0ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Judge0ConfigModal: React.FC<Judge0ConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<Judge0Config>(getStoredJudge0Config);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    saveJudge0Config(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      if (!config.apiKey && !config.isMockEnabled) {
        setTestStatus('Please enter an API Key or enable Client Sandbox Simulation.');
        setIsTesting(false);
        return;
      }

      if (config.isMockEnabled) {
        await new Promise((r) => setTimeout(r, 400));
        setTestStatus('Client Sandbox Simulation is Active & Ready. Zero server execution.');
        setIsTesting(false);
        return;
      }

      const headers: Record<string, string> = {};
      if (config.baseUrl.includes('rapidapi.com')) {
        headers['X-RapidAPI-Key'] = config.apiKey;
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
      } else if (config.apiKey) {
        headers['X-Auth-Token'] = config.apiKey;
      }

      const res = await fetch(`${config.baseUrl}/about`, { headers });
      if (res.ok) {
        const info = await res.json();
        setTestStatus(`Connected successfully! Judge0 Version: ${info.version || 'CE'}`);
      } else {
        setTestStatus(`Server returned HTTP ${res.status}. Check API key and CORS policy.`);
      }
    } catch (err: any) {
      setTestStatus(
        `Connection notice: ${err.message || 'CORS or Network unreachable'}. Falling back to SmartLab Sandbox.`
      );
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl bg-[#0e1738] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090f22]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Judge0 Code Execution Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-300">
          {/* Security Architecture Notice */}
          <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-emerald-300">Air-Gapped Server Guarantee</span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                In accordance with GSSSIETW safety protocols, student code is{' '}
                <strong>never executed directly inside the Node/Flask application server</strong>. Code runs
                exclusively within the external containerized Judge0 CE sandbox or the isolated client-side
                evaluator.
              </p>
            </div>
          </div>

          {/* Engine Mode Toggle */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200 block">Execution Mode</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setConfig({ ...config, isMockEnabled: true })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  config.isMockEnabled
                    ? 'bg-sky-500/15 border-sky-500 text-sky-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold mb-0.5">SmartLab Client Sandbox</div>
                <div className="text-[11px] text-slate-400">
                  Instant offline testing with algorithmic verification and test case grading.
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, isMockEnabled: false })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  !config.isMockEnabled
                    ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold mb-0.5">Live Judge0 API Endpoint</div>
                <div className="text-[11px] text-slate-400">
                  Containerized compiler execution using Judge0 CE or RapidAPI.
                </div>
              </button>
            </div>
          </div>

          {/* Judge0 Parameters */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div>
              <label className="font-medium text-slate-300 mb-1 block">Judge0 Base URL</label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-sky-500"
                placeholder="https://judge0-ce.p.rapidapi.com or http://localhost:2358"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-medium text-slate-300">API Key / Auth Token</label>
                <span className="text-[11px] text-slate-500">Optional for self-hosted instances</span>
              </div>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-sky-500"
                placeholder="RapidAPI Key or X-Auth-Token"
              />
            </div>
          </div>

          {/* Language Mapping IDs */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <span className="font-medium text-slate-300 block">Configured Language IDs</span>
            <div className="grid grid-cols-4 gap-2 font-mono text-center text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Python 3</div>
                <div className="font-bold text-sky-400">ID: 71</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">Java 17</div>
                <div className="font-bold text-sky-400">ID: 62</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">C (GCC 11)</div>
                <div className="font-bold text-sky-400">ID: 50</div>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <div className="text-slate-400">C++ (GCC 11)</div>
                <div className="font-bold text-sky-400">ID: 54</div>
              </div>
            </div>
          </div>

          {testStatus && (
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-sky-300">
              {testStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#090f22] flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            {isTesting ? 'Testing Link...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors shadow-xs"
            >
              {savedSuccess ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
