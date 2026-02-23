import { Brain } from 'lucide-react';

// ─── Spinner de loading ──────────────────────────────────────
function Spinner() {
  return (
    <svg
      className="w-5 h-5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

// ─── LinkButton ──────────────────────────────────────────────
export default function LinkButton({ button, loading, onClick }) {
  const isLoading = loading === button.id;

  function handleClick(e) {
    e.preventDefault();
    if (!isLoading && onClick) {
      onClick(button);
    }
  }

  return (
    <div className="animate-fade-in-up w-full max-w-sm">
      <button
        onClick={handleClick}
        disabled={isLoading}
        aria-label={button.label}
        className={`
          relative w-full group flex items-center gap-4 px-5 py-4 rounded-2xl
          border transition-all duration-300 text-left
          ${button.primary
            ? 'bg-gradient-to-r from-blue-600/20 to-blue-700/20 border-blue-500/50 hover:border-blue-400 hover:from-blue-600/30 hover:to-blue-700/30 hover:shadow-[0_0_24px_rgba(37,99,235,0.45)]'
            : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
          }
          ${isLoading ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Ícone */}
        <span
          className={`
            flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center
            ${button.primary
              ? 'bg-blue-600/30 text-blue-300'
              : 'bg-white/10 text-slate-300'
            }
          `}
        >
          {isLoading ? <Spinner /> : <Brain className="w-6 h-6" />}
        </span>

        {/* Texto */}
        <span className="flex-1 min-w-0">
          <span
            className={`block font-semibold text-sm sm:text-base leading-tight font-exo truncate ${
              button.primary ? 'text-white' : 'text-slate-200'
            }`}
          >
            {button.label}
          </span>
          {button.subLabel && (
            <span className="block text-xs text-slate-400 mt-0.5 truncate font-inter">
              {button.subLabel}
            </span>
          )}
        </span>

        {/* Seta */}
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1 ${
            button.primary ? 'text-blue-400' : 'text-slate-500'
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
