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

  useEffect(() => {
    saveSmsDraft(smsText);
  }, [smsText]);

  const analysis = useMemo(() => tokenizeSms(smsText), [smsText]);
  const recommended = useMemo(
    () => getRecommendedToken(analysis.tokens, selectedSequence),
    [analysis.tokens, selectedSequence],
  );

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

  const handlePrintGuide = () => {
    window.print();
    pushToast('success', 'প্রিন্ট/পিডিএফ ডায়ালগ খোলা হয়েছে।');
  };

  const handleInstall = async () => {
    const result = await promptInstall();
    if (result.outcome === 'accepted') {
      pushToast('success', 'অ্যাপ ইনস্টল হয়েছে।');
    } else if (result.outcome === 'dismissed') {
      pushToast('warning', 'ইনস্টলেশন বাতিল করা হয়েছে।');
    } else {
      pushToast('warning', 'ইনস্টল প্রম্পট এখন উপলব্ধ নয়।');
    }
  };

  return (
    <div className="min-h-screen">
      <ToastStack messages={toasts} />

      <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">PWA · BPDB</p>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">প্রিপেইড মিটার টোকেন সহকারী</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary hover:text-primary dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {theme === 'dark' ? 'লাইট মোড' : 'ডার্ক মোড'}
            </button>
            {canInstall && !installed ? (
              <button
                type="button"
                onClick={handleInstall}
                className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#12663f]"
              >
                অ্যাপ ইনস্টল
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="no-print overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-6 bg-hero-grid bg-[length:28px_28px] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div className="space-y-5">
              <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/20 dark:text-blue-200">জাতীয় প্রিপেইড টোকেন সহায়ক</span>
              <div className="space-y-3">
                <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">প্রিপেইড মিটার টোকেন সহকারী</h2>
                <p className="max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">একাধিক টোকেন সম্বলিত SMS থেকে সঠিক টোকেন খুঁজে বের করুন এবং সঠিক ক্রমে মিটারে ইনপুট দিন।</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => pushToast('success', 'SMS পেস্ট করুন, তারপর সিকোয়েন্স নির্বাচন করুন।')}
                  className="rounded-2xl bg-primary px-5 py-4 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-[#0849ab] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  শুরু করুন
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">অবস্থা</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{analysis.tokens.length ? 'টোকেন প্রস্তুত' : 'SMS ইনপুট অপেক্ষায়'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">অফলাইন</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">সাপোর্টেড</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-sm text-slate-500 dark:text-slate-400">পরামর্শ</p>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">সহজ ব্যবহার</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-soft">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">বর্তমান সিকোয়েন্স</p>
                <p className="mt-2 text-4xl font-black tracking-tight">{getSequenceLabel(selectedSequence)}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">প্রস্তাবিত টোকেন</p>
                <p className="mt-2 text-2xl font-bold">{formatRecommendedLabel(recommended)}</p>
                <p className="mt-1 text-sm text-slate-400">সঠিক ক্রমে পরের টোকেনটি ব্যবহার করুন।</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">সংখ্যা</p>
                <p className="mt-2 text-2xl font-bold">{analysis.stats.tokenCount} টি টোকেন</p>
                <p className="mt-1 text-sm text-slate-400">SMS থেকে স্বয়ংক্রিয়ভাবে বের করা হয়েছে।</p>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          title="SMS ইনপুট"
          subtitle="এখানে আপনার সম্পূর্ণ SMS পেস্ট করুন। অ্যাপটি স্বয়ংক্রিয়ভাবে টোকেন বের করবে।"
          className="print-break"
        >
          <div className="space-y-4">
            <textarea
              value={smsText}
              onChange={(event) => setSmsText(event.target.value.replace(/\u00A0/g, ' '))}
              placeholder="এখানে আপনার সম্পূর্ণ SMS পেস্ট করুন"
              rows={8}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span>অটো ক্লিন: স্পেস, লাইন ব্রেক, এবং ভাঙা ফরম্যাট স্বয়ংক্রিয়ভাবে সামলানো হচ্ছে।</span>
              <span>{smsText.length} / 10000</span>
            </div>
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
              <button
                type="button"
                onClick={handlePrintGuide}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:text-slate-200"
              >
                প্রিন্ট / পিডিএফ
              </button>
            </div>
            {validationMessages.length > 0 ? (
              <div className="space-y-2 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
                <p className="font-semibold">যাচাই বার্তা</p>
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {validationMessages.map((message) => <li key={message}>{message}</li>)}
                </ul>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="টোকেন এক্সট্রাকশন" subtitle="সমস্ত বৈধ ২০-ডিজিট টোকেন নিচে আলাদা কার্ডে দেখানো হলো।">
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">মোট টোকেন</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{analysis.stats.tokenCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">সম্ভাব্য ফলাফল</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{analysis.stats.candidateCount}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-500 dark:text-slate-400">মাস্ক/অসম্পূর্ণ</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{analysis.maskedOrIncompleteCandidates.length}</p>
            </div>
          </div>

          {analysis.tokens.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {analysis.tokens.map((token, index) => (
                <TokenCard
                  key={`${token}-${index}`}
                  token={token}
                  label={`Token ${index + 1}`}
                  copied={copiedToken === token}
                  onCopy={() => handleCopyToken(token)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-300">
              SMS পেস্ট করলে এখানে টোকেন কার্ড দেখা যাবে।
            </div>
          )}
        </SectionCard>

        <SectionCard title="সিকোয়েন্স নম্বর" subtitle="বর্তমান সিকোয়েন্স নম্বর লিখুন।">
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

            <button
              type="button"
              onClick={() => setSequenceHelpOpen((value) => !value)}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary dark:border-slate-800 dark:text-slate-200"
            >
              সিকোয়েন্স নম্বর জানেন না?
            </button>

            {sequenceHelpOpen ? (
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-slate-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-slate-100">
                <ol className="space-y-2 text-sm leading-7">
                  <li>১. মিটারে 889 লিখুন</li>
                  <li>২. Enter চাপুন</li>
                  <li>৩. প্রদর্শিত নম্বরটি এখানে লিখুন</li>
                </ol>
              </div>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard title="প্রস্তাবিত টোকেন" subtitle="নির্বাচিত সিকোয়েন্স অনুযায়ী এখন কোন টোকেন ইনপুট করবেন তা দেখানো হয়েছে।">
          {recommended ? (
            <div className="rounded-[1.75rem] border border-primary/20 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 shadow-soft dark:border-primary/30 dark:from-primary/20 dark:to-secondary/10">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">এখন এই টোকেনটি ইনপুট করুন</p>
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
              সিকোয়েন্স নম্বর নির্বাচন করুন। যদি পর্যাপ্ত টোকেন না থাকে, তাহলে আরেকটি SMS বা সঠিক সিকোয়েন্স চেক করুন।
            </div>
          )}
        </SectionCard>

        <SectionCard title="দ্রুত ব্যবহার" subtitle="সহজভাবে টোকেন বের করতে এই তিনটা ধাপ যথেষ্ট।">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              'SMS পেস্ট করুন',
              'সিকোয়েন্স নম্বর নির্বাচন করুন',
              'প্রস্তাবিত টোকেন কপি করে মিটারে দিন',
            ].map((item, index) => (
              <div key={item} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold text-primary">0{index + 1}</p>
                <p className="mt-3 text-base font-semibold leading-7 text-slate-900 dark:text-white">{item}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </main>

      <footer className="no-print mt-6 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-slate-600 dark:text-slate-300 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">প্রিপেইড মিটার টোকেন সহকারী</p>
            <p className="mt-1">সহজ SMS টোকেন সহায়ক · LocalStorage · Bangla-first UX</p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">Made by Ridwan · 01324210035</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handlePrintGuide} className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-200">পিডিএফ</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
