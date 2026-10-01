import React from 'react';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSize = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  }[size];

  const titleSize = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`} id="fill-brand-header">
      {/* Refined geometric emblem: minimalist shield/document glyph with precise fill-line check */}
      <div
        className={`${iconSize} rounded-xl bg-slate-900 text-white flex items-center justify-center font-black tracking-tight shadow-sm shrink-0 relative overflow-hidden`}
        aria-hidden="true"
      >
        {/* Subtle geometric corner accent */}
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-slate-800 rounded-bl-sm" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-3/5 h-3/5 text-white"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M9 15l2 2 4-4" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`${titleSize} font-extrabold tracking-tight text-slate-900 leading-none font-sans`}>
            FILL
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 leading-none">
            Privacy First
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-500 font-medium tracking-tight mt-0.5">
            Your information. One time.
          </span>
        )}
      </div>
    </div>
  );
};
