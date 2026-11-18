import React, { useState } from 'react';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  FAQItem,
  INITIAL_FAQS,
} from '../../data/studentFeaturesData';
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  AlertTriangle,
  Code2,
  ShieldAlert,
  Sliders,
  Mail,
  User,
  MessageSquare,
  FileText,
} from 'lucide-react';

export const HelpAndSupport: React.FC = () => {
  const [faqs] = useState<FAQItem[]>(INITIAL_FAQS);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  // Support Form state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState<'editor' | 'compiler' | 'grading' | 'other'>('editor');
  const [ticketMessage, setTicketMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    const generatedId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedId);
    setIsSubmitted(true);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Help & Technical Support</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Guides, FAQs, and laboratory support desk for {COLLEGE_CONFIG.name}
        </p>
      </div>

      {/* Quick Troubleshooting Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Code2 className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Monaco Editor & STDIN</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            If your C or Python program uses <code>scanf</code> or <code>input()</code>, always supply input values line-by-line in the Standard Input console before hitting Run.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Sliders className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Judge0 Compiler Engine</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            All code executes in isolated Docker sandboxes via Judge0 CE. If timeout occurs, check for infinite loops or heavy memory allocations.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-blue-100 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Clipboard Security Lock</h3>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Clipboard shortcuts (Ctrl+C, Ctrl+V) are disabled during restricted laboratory evaluations to enforce academic honesty protocols.
          </p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-600">Search laboratory platform documentation and workflows</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {filteredFaqs.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No matching FAQs found.</p>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-blue-100 bg-[#f4f8ff] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-blue-50/60 transition-colors"
                  >
                    <span className="text-xs font-semibold text-slate-800">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-600 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-slate-700 leading-relaxed font-sans border-t border-blue-100 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Support Request Ticket Form */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Contact Faculty or Lab In-Charge</h2>
          <p className="text-xs text-slate-600">
            Submit a support ticket regarding compiler anomalies, score discrepancies, or hardware issues
          </p>
        </div>

        {isSubmitted ? (
          <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900">Support Ticket Dispatched</h3>
            <p className="text-xs text-slate-700 max-w-md mx-auto">
              Your inquiry has been registered in the {COLLEGE_CONFIG.department} system under Reference ID:
            </p>
            <div className="inline-block px-3 py-1 rounded bg-blue-50/60 font-mono text-sm font-bold text-blue-600 border border-blue-200">
              {ticketId}
            </div>
            <p className="text-[11px] text-slate-600">
              Lab coordinator Dr Girish S C will respond via your institutional email within 24 academic hours.
            </p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setTicketSubject('');
                setTicketMessage('');
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-slate-850 hover:bg-blue-100 text-xs font-semibold text-slate-800 border border-blue-200 transition-colors"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Issue Category
                </label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="editor">Online Monaco Editor & Linting</option>
                  <option value="compiler">Judge0 Compilation & Timeouts</option>
                  <option value="grading">Test Cases & Submission Grading</option>
                  <option value="other">Laboratory Hardware & Terminal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Test Case 4 timeout on Experiment 2"
                  required
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Detailed Description & Error Output
              </label>
              <textarea
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Include error codes, language selected, and exact steps to reproduce..."
                rows={4}
                required
                className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-mono">
                Dispatched directly to {COLLEGE_CONFIG.shortAcronym} Lab Technical Board
              </span>
              <button
                type="submit"
                className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-sky-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
