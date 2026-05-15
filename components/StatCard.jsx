import clsx from 'clsx';

export default function StatCard({ label, value, sub, accent = false, className = '' }) {
  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl p-5 border',
        accent
          ? 'bg-lime-400/5 border-lime-400/20'
          : 'bg-[#111] border-[#1e1e1e]',
        className
      )}
    >
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/8 to-transparent pointer-events-none" />
      )}
      <div className="relative">
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-medium mb-2">{label}</p>
        <p
          className={clsx(
            'text-2xl font-bold leading-none',
            accent ? 'text-lime-400' : 'text-white'
          )}
        >
          {value}
        </p>
        {sub && <p className="text-zinc-600 text-xs mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
