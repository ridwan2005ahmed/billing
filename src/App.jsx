import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from './components/SectionCard';
import { TokenCard } from './components/TokenCard';
import { ToastStack } from './components/ToastStack';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useTheme } from './hooks/useTheme';
import {
  getRecommendedToken,
  getReadableValidationMessages,
  getSequenceLabel,
  tokenizeSms,
} from './utils/token';
import {
  clearSmsDraft,
  loadSmsDraft,
  saveSmsDraft,
} from './utils/storage';

function formatRecommendedLabel(recommended) {
  if (!recommended) {
    return 'উপলব্ধ নয়';
  }

  return `Token ${recommended.tokenNumber}`;
}

function App() {
  const { theme, setTheme } = useTheme();
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [smsText, setSmsText] = useState(() => loadSmsDraft());
  const [selectedSequence, setSelectedSequence] = useState('');
  const [sequenceHelpOpen, setSequenceHelpOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState('');
  const [toasts, setToasts] = useState([]);
import { useEffect, useMemo, useState } from 'react';
import { SectionCard } from './components/SectionCard';
import { TokenCard } from './components/TokenCard';
import { ToastStack } from './components/ToastStack';
import {
  getRecommendedToken,
  getReadableValidationMessages,
  getSequenceLabel,
  TOKEN_ORDER,
  tokenizeSms,
} from './utils/token';

import { clearSmsDraft, loadSmsDraft, saveSmsDraft } from './utils/storage';

function App() {
  const [smsText, setSmsText] = useState(() => loadSmsDraft());
  const [selectedSequence, setSelectedSequence] = useState('');
  const [copiedToken, setCopiedToken] = useState('');
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    saveSmsDraft(smsText);
  }, [smsText]);

  const analysis = useMemo(() => tokenizeSms(smsText), [smsText]);
  const recommended = useMemo(() => getRecommendedToken(analysis.tokens, selectedSequence), [analysis.tokens, selectedSequence]);

  const validationMessages = getReadableValidationMessages(analysis.warnings);

  const pushToast = (type, text) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, type, text }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  };

  const copyToClipboard = async (text, successMessage) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast('success', successMessage);
      return true;
    } catch {
      pushToast('warning', 'কপি করা যায়নি। ব্রাউজারের অনুমতি পরীক্ষা করুন।');
      return false;
    }
  };

  const handleCopyToken = (token) => {
    setCopiedToken(token);
    copyToClipboard(token, 'টোকেন কপি হয়েছে।');
    window.setTimeout(() => setCopiedToken(''), 2000);
  };

  return (
    <div className="min-h-screen">
      <ToastStack messages={toasts} />

      <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">প্রিপেইড মিটার টোকেন সহকারী</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <SectionCard title="SMS ইনপুট" subtitle="SMS পেস্ট করুন, তারপর টোকেন বের হবে।" className="print-break">
          <div className="space-y-4">
            <textarea
              value={smsText}
              onChange={(event) => setSmsText(event.target.value.replace(/\u00A0/g, ' '))}
              placeholder="এখানে SMS পেস্ট করুন"
              rows={7}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSmsText('');
                  clearSmsDraft();
                  pushToast('success', 'SMS ইনপুট পরিষ্কার করা হয়েছে।');
                }}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-danger hover:text-danger dark:border-slate-800 dark:text-slate-200"
              >
                ইনপুট পরিষ্কার করুন
              </button>
            </div>
            {validationMessages.length > 0 ? (
              <div className="space-y-2 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="font-semibold">নোট</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {validationMessages.map((message) => <li key={message}>{message}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="টোকেন" subtitle="এখানে বৈধ ২০-ডিজিট টোকেন দেখাবে।">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">মোট টোকেন</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{analysis.stats.tokenCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">সর্বশেষ সিকোয়েন্স</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{getSequenceLabel(selectedSequence)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">প্রস্তাবিত</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{recommended ? `Token ${recommended.tokenNumber}` : 'নেই'}</p>
            </div>
          </div>

          {analysis.tokens.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {analysis.tokens.map((token, index) => (
                <TokenCard key={`${token}-${index}`} token={token} label={`Token ${index + 1}`} copied={copiedToken === token} onCopy={() => handleCopyToken(token)} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
              SMS পেস্ট করলে টোকেন দেখা যাবে।
            </div>
          )}
        </SectionCard>

        <SectionCard title="সিকোয়েন্স নম্বর" subtitle="কীভাবে দেখবেন: মিটারে 889 লিখে Enter চাপুন, তারপর যে নম্বর দেখাবে সেটাই এখানে দিন।">
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">বর্তমান সিকোয়েন্স নম্বর লিখুন</span>
              <select
                value={selectedSequence}
                onChange={(event) => setSelectedSequence(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                <option value="">নির্বাচন করুন</option>
                {TOKEN_ORDER.map((sequence) => (
                  <option key={sequence} value={sequence}>{sequence}</option>
                ))}
              </select>
            </label>
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
              সিকোয়েন্স নম্বর দেখতে মিটারে <span className="font-semibold text-slate-900 dark:text-white">889</span> লিখে <span className="font-semibold text-slate-900 dark:text-white">Enter</span> চাপুন।
            </p>
          </div>
        </SectionCard>

        <SectionCard title="প্রস্তাবিত টোকেন" subtitle="নির্বাচিত সিকোয়েন্স অনুযায়ী টোকেন দেখানো হয়েছে।">
          {recommended ? (
            <div className="rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 shadow-soft dark:border-primary/30 dark:from-primary/20 dark:to-secondary/10">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <h3 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Token {recommended.tokenNumber}</h3>
                  <p className="mt-2 text-lg text-slate-700 dark:text-slate-200">Sequence Number: {recommended.sequenceNumber}</p>
                  <p className="mt-2 break-all text-2xl font-bold tracking-[0.14em] text-slate-900 dark:text-white">{recommended.tokenValue}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyToken(recommended.tokenValue)}
                  className="rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-[#0849ab]"
                >
                  টোকেন কপি করুন
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
              সিকোয়েন্স নম্বর নির্বাচন করুন।
            </div>
          )}
        </SectionCard>
      </main>

      <footer className="no-print mt-6 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 dark:text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">প্রিপেইড মিটার টোকেন সহকারী</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Made by Ridwan · 01324210035</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
              <p className="text-sm text-slate-500 dark:text-slate-400">মোট টোকেন</p>
