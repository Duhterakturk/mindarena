/**
 * Dekoratif beyin silüeti — arka planda dağıtılmış, düşük opaklıklı süsleme
 * öğesi olarak kullanılır (bkz. Home.jsx). Anatomik değil, stilize bir
 * ikon; tek bir path ile iki lob + orta kıvrım hattı.
 */
export default function BrainIcon({ className = "", style }) {
  return (
    <svg viewBox="0 0 200 160" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M100,8 C68,8 34,22 22,50 C10,74 16,100 34,116 C38,132 56,148 100,148 C144,148 162,132 166,116 C184,100 190,74 178,50 C166,22 132,8 100,8 Z" />
      <path
        d="M100,20 C100,45 92,55 100,70 C108,85 92,100 100,118 C104,128 100,136 100,140"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.35"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M55,35 C45,50 45,65 55,75"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M145,35 C155,50 155,65 145,75"
        fill="none"
        stroke="#fff"
        strokeOpacity="0.3"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
