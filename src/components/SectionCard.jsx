export function SectionCard({ title, subtitle, children, className = '', ...props }) {
  return (
    <section
      {...props}
      className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-card dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}
