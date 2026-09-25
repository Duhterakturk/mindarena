function Scene({ id }) {
  if (id === "theme-space") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="g-space" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#312e81" />
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#g-space)" />
        {[12, 28, 46, 70, 96, 130, 160, 184].map((x, i) => (
          <circle key={x} className="scene-twinkle" cx={x} cy={14 + (i % 4) * 16} r={i % 2 ? 1.1 : 1.6} fill="#fef3c7" style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
        <g className="scene-drift">
          <ellipse cx="150" cy="36" rx="14" ry="6" fill="none" stroke="#c4b5fd" />
          <circle cx="150" cy="36" r="7" fill="#7c3aed" />
        </g>
        <g className="scene-float">
          <path d="M36 78 l10 6 -10 2 3-4 z" fill="#e2e8f0" />
          <rect x="28" y="76" width="10" height="6" rx="2" fill="#f8fafc" />
          <circle cx="40" cy="79" r="2" fill="#fb7185" />
        </g>
        <line className="scene-shoot" x1="20" y1="20" x2="48" y2="32" stroke="#fff" strokeWidth="1.2" />
      </svg>
    );
  }
  if (id === "theme-candy") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="g-candy" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbcfe8" />
            <stop offset="1" stopColor="#ddd6fe" />
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#g-candy)" />
        <g className="scene-drift">
          <circle cx="30" cy="28" r="8" fill="#fb7185" />
          <rect x="28" y="12" width="4" height="12" fill="#fff" />
          <circle cx="168" cy="40" r="7" fill="#a78bfa" />
          <rect x="166" y="24" width="4" height="12" fill="#fff" />
        </g>
        <ellipse cx="70" cy="24" rx="8" ry="5" fill="#f472b6" />
        <ellipse cx="110" cy="90" rx="7" ry="4" fill="#34d399" />
        <circle cx="54" cy="80" r="6" fill="#fbbf24" />
        <circle cx="140" cy="22" r="5" fill="#fb7185" />
        <circle cx="90" cy="30" r="7" fill="none" stroke="#f9a8d4" strokeWidth="4" />
        {[20, 60, 100, 140, 180].map((x, i) => (
          <circle key={x} className="scene-rise" cx={x} cy="100" r={2 + (i % 3)} fill={["#f472b6", "#fbbf24", "#67e8f9", "#c4b5fd", "#fb7185"][i]} style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
      </svg>
    );
  }
  if (id === "theme-forest") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="200" height="120" fill="#bbf7d0" />
        <path d="M10 100 L28 48 L46 100 Z" fill="#166534" />
        <path d="M150 100 L170 40 L190 100 Z" fill="#14532d" />
        <path d="M40 104 L54 70 L68 104 Z" fill="#15803d" />
        {[24, 70, 120, 160].map((x, i) => (
          <ellipse key={x} className="scene-fall" cx={x} cy="16" rx="4" ry="2" fill="#b45309" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
        <g className="scene-drift">
          <ellipse cx="90" cy="40" rx="6" ry="3" fill="#f472b6" />
          <ellipse cx="100" cy="40" rx="6" ry="3" fill="#c084fc" />
        </g>
        <ellipse cx="48" cy="88" rx="8" ry="4" fill="#9a3412" />
        <circle cx="56" cy="84" r="3" fill="#9a3412" />
      </svg>
    );
  }
  if (id === "theme-sea") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="g-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7dd3fc" />
            <stop offset="1" stopColor="#0369a1" />
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#g-sea)" />
        {[18, 50, 90, 130, 170].map((x, i) => (
          <circle key={x} className="scene-rise" cx={x} cy="100" r={2 + (i % 3)} fill="#e0f2fe" style={{ animationDelay: `${i * 0.35}s` }} />
        ))}
        <g className="scene-drift">
          <ellipse cx="70" cy="50" rx="10" ry="5" fill="#f97316" />
          <polygon points="60,50 48,44 48,56" fill="#f97316" />
          <ellipse cx="140" cy="70" rx="8" ry="4" fill="#fde68a" />
        </g>
        <path d="M20 96 Q30 80 24 70" stroke="#166534" fill="none" strokeWidth="2" />
        <path d="M170 100 Q180 84 174 72" stroke="#14532d" fill="none" strokeWidth="2" />
        <polygon points="110,88 116,96 104,96" fill="#fbbf24" />
        <path d="M0 108 Q25 98 50 108 T100 108 T150 108 T200 108" fill="none" stroke="#e0f2fe" strokeWidth="3" />
      </svg>
    );
  }
  if (id === "theme-night") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="200" height="120" fill="#1e1b4b" />
        <circle cx="150" cy="28" r="12" fill="#fef3c7" />
        <ellipse cx="40" cy="30" rx="16" ry="6" fill="#312e81" />
        <ellipse cx="90" cy="22" rx="18" ry="6" fill="#3730a3" />
        {[30, 60, 100, 130, 80].map((x, i) => (
          <circle key={x} className="scene-twinkle" cx={x} cy={50 + (i % 3) * 14} r="1.4" fill="#fde68a" style={{ animationDelay: `${i * 0.4}s` }} />
        ))}
        <path d="M36 96 q10 -14 20 0 q-4 -4 -10 0 q-6 -4 -10 0 z" fill="#1e1a16" />
        <circle cx="54" cy="90" r="4" fill="#1e1a16" />
      </svg>
    );
  }
  if (id === "bg-dawn") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id="g-dawn" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#fdba74" />
            <stop offset="1" stopColor="#fecdd3" />
          </linearGradient>
        </defs>
        <rect width="200" height="120" fill="url(#g-dawn)" />
        <circle cx="40" cy="70" r="16" fill="#fb923c" />
        <ellipse cx="90" cy="36" rx="18" ry="7" fill="#fff7ed" />
        <ellipse cx="140" cy="28" rx="16" ry="6" fill="#ffe4e6" />
        <g className="scene-drift">
          <path d="M120 60 l8 2 -8 2 z" fill="#9a3412" />
          <path d="M150 74 l8 2 -8 2 z" fill="#7c2d12" />
        </g>
      </svg>
    );
  }
  if (id === "bg-meadow") {
    return (
      <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect width="200" height="120" fill="#d9f99d" />
        <ellipse cx="100" cy="110" rx="120" ry="28" fill="#84cc16" />
        <g className="scene-drift">
          <circle cx="40" cy="70" r="5" fill="#f472b6" />
          <rect x="38" y="74" width="2" height="10" fill="#166534" />
          <circle cx="90" cy="78" r="4" fill="#fbbf24" />
          <circle cx="150" cy="72" r="5" fill="#fb7185" />
        </g>
        <ellipse className="scene-float" cx="120" cy="40" rx="4" ry="2" fill="#ca8a04" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 120" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="200" height="120" fill="#1a1c28" />
      {[30, 70, 120, 160].map((x, i) => (
        <circle key={x} className="scene-fall" cx={x} cy="10" r={3 + i} fill="#312e81" style={{ animationDelay: `${i * 0.3}s` }} />
      ))}
      <path d="M40 80 q30 -20 50 0" fill="none" stroke="#c4b5fd" strokeWidth="2" />
      <path d="M150 40 l8 28" stroke="#e9d5ff" strokeWidth="2" />
      <path d="M158 40 l10 4 -10 2 z" fill="#e9d5ff" />
    </svg>
  );
}

export default function ThemeScene({ id, mini = false }) {
  if (!id) return null;
  return (
    <div className={mini ? "absolute inset-0" : "theme-scene pointer-events-none fixed inset-0 z-0"} data-testid={mini ? undefined : "theme-scene"}>
      <Scene id={id} />
    </div>
  );
}
