import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MARKS = [
  { top: "16%", left: "9%", delay: "0s", duration: "13s", rot: "-8deg", color: "#d9c7a3", node: "digit" },
  { top: "22%", left: "78%", delay: "1.2s", duration: "15s", rot: "10deg", color: "#9bb7c9", node: "star" },
  { top: "68%", left: "12%", delay: "0.6s", duration: "12s", rot: "6deg", color: "#c9a39a", node: "ship" },
  { top: "72%", left: "80%", delay: "1.8s", duration: "14s", rot: "-12deg", color: "#a8c0b2", node: "grid" },
  { top: "40%", left: "6%", delay: "2.1s", duration: "16s", rot: "4deg", color: "#e4ddd0", node: "ring" },
  { top: "44%", left: "86%", delay: "0.4s", duration: "11s", rot: "-6deg", color: "#d9c7a3", node: "plus" },
  { top: "84%", left: "42%", delay: "1.5s", duration: "13s", rot: "8deg", color: "#9bb7c9", node: "path" },
  { top: "10%", left: "46%", delay: "2.4s", duration: "15s", rot: "-4deg", color: "#c9a39a", node: "brick" },
];

function Mark({ kind }) {
  if (kind === "digit") {
    return (
      <svg viewBox="0 0 48 48" className="w-9 h-9">
        <rect x="4" y="4" width="40" height="40" rx="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <text x="24" y="31" textAnchor="middle" fontSize="18" fontFamily="Nunito, sans-serif" fill="currentColor">7</text>
      </svg>
    );
  }
  if (kind === "star") {
    return (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <path d="M24 6l4.8 11.2L41 19.2l-9 8.2L34.2 40 24 33.8 13.8 40 16 27.4 7 19.2l12.2-2z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "ship") {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-8">
        <path d="M8 30h32l-4 8H12z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M24 28V10M24 14h10l-10 8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "grid") {
    return (
      <svg viewBox="0 0 48 48" className="w-8 h-8">
        <rect x="8" y="8" width="14" height="14" rx="2" fill="currentColor" />
        <rect x="26" y="8" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="8" y="26" width="14" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="26" y="26" width="14" height="14" rx="2" fill="currentColor" opacity="0.45" />
      </svg>
    );
  }
  if (kind === "ring") {
    return (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <circle cx="24" cy="24" r="12" fill="none" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    );
  }
  if (kind === "plus") {
    return (
      <svg viewBox="0 0 48 48" className="w-7 h-7">
        <path d="M24 10v28M10 24h28" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "path") {
    return (
      <svg viewBox="0 0 64 24" className="w-12 h-5">
        <circle cx="8" cy="12" r="4" fill="currentColor" />
        <circle cx="32" cy="12" r="4" fill="currentColor" opacity="0.7" />
        <circle cx="56" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 32" className="w-9 h-6">
      <rect x="4" y="6" width="18" height="10" rx="1" fill="currentColor" />
      <rect x="24" y="6" width="18" height="10" rx="1" fill="currentColor" opacity="0.55" />
      <rect x="14" y="18" width="18" height="10" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="home-desk">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {MARKS.map((mark) => (
          <span
            key={`${mark.node}-${mark.top}`}
            className="home-mark"
            style={{
              top: mark.top,
              left: mark.left,
              color: mark.color,
              "--delay": mark.delay,
              "--dur": mark.duration,
              "--rot": mark.rot,
            }}
          >
            <Mark kind={mark.node} />
          </span>
        ))}
      </div>
      <div className="relative z-10 min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <h1 className="font-display text-4xl sm:text-6xl font-semibold text-white text-center text-balance leading-[1.05]">
          <Link to="/games" className="hover:text-white/80">
            {t("home.title")}
          </Link>
        </h1>
      </div>
    </div>
  );
}
