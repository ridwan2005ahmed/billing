export function TokenCard({ token, label, onCopy, copied = false, compact = false }) {
  return (
    <article className={`rounded-2xl border p-4 shadow-sm transition-all duration-200 ${copied ? 'border-secondary bg-emerald-50 dark:border-emerald-400/50 dark:bg-emerald-950/40' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'} ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 break-all text-base font-semibold tracking-[0.18em] text-slate-900 dark:text-white">{token}</p>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0849ab] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          {copied ? 'কপি হয়েছে' : 'কপি'}
        </button>
      </div>
    </article>
  );
}
