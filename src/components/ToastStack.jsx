export function ToastStack({ messages }) {
  if (!messages.length) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      {messages.map((message) => (
        <div key={message.id} className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-soft ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100' : message.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100' : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'}`}>
          {message.text}
        </div>
      ))}
    </div>
  );
}
