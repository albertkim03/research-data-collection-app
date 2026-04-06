"use client";

interface Props {
  isSpeaking: boolean;
}

export default function SpeakingAvatar({ isSpeaking }: Props) {
  return (
    <div
      className={`inline-flex flex-col items-center gap-1.5 bg-white border-2 rounded-xl p-2 shadow-md transition-all duration-200 ${
        isSpeaking ? "border-blue-400 shadow-blue-100" : "border-gray-200 opacity-60"
      }`}
      style={{ minWidth: 76 }}
    >
      {/*
        Avatar — Katara-inspired Water Tribe girl
        viewBox 0 0 100 130 gives room for head + neck + shoulders
      */}
      <svg viewBox="0 0 100 130" width="72" height="90" xmlns="http://www.w3.org/2000/svg">

        {/* ── Shoulders / Water Tribe clothing ── */}
        <path
          d="M12 130 L12 112 Q22 102 35 99 Q43 97 50 97 Q57 97 65 99 Q78 102 88 112 L88 130 Z"
          fill="#2E6080"
        />
        {/* Collar highlight */}
        <path
          d="M12 130 L12 112 Q22 102 35 99 Q43 97 50 97 L50 130 Z"
          fill="#3A7A9E"
          opacity="0.35"
        />
        {/* Neckline detail */}
        <path d="M38 99 Q50 106 62 99" stroke="#1B4A65" fill="none" strokeWidth="1.5" strokeLinecap="round" />

        {/* ── Neck ── */}
        <path d="M43 81 L43 99 Q50 103 57 99 L57 81 Z" fill="#CFAE8A" />
        <path d="M43 81 L46 99 Q48 102 50 103 Q48 92 44 82 Z" fill="#B08868" opacity="0.45" />
        <g transform="translate(0, 9)">
          {/* ── Hair back volume ── */}
          <ellipse cx="50" cy="45" rx="31" ry="33" fill="#1E0C06" />

          {/* ── Katara's signature hair loops ── */}
          {/* Left loop */}
          <path
            d="M27 37 Q17 44 16 57 Q15 69 24 72 Q31 75 35 67 Q39 58 32 52 Q27 46 29 39 Z"
            fill="#1E0C06"
          />
          {/* Right loop */}
          <path
            d="M73 37 Q83 44 84 57 Q85 69 76 72 Q69 75 65 67 Q61 58 68 52 Q73 46 71 39 Z"
            fill="#1E0C06"
          />

          {/* ── Hair top ── */}
          <path
            d="M25 40 Q28 17 50 13 Q72 17 75 40 Q69 27 62 25 Q50 21 38 25 Q31 27 25 40 Z"
            fill="#1E0C06"
          />
          {/* Bun */}
          <circle cx="50" cy="14" r="8" fill="#1E0C06" />
          {/* Hair tie accent */}
          <ellipse cx="50" cy="14" rx="5" ry="2.5" fill="none" stroke="#5B8FB9" strokeWidth="1.4" />

          {/* ── Face ── */}
          <ellipse cx="50" cy="50" rx="26" ry="29" fill="#CFAE8A" />

          {/* Subtle face shading for depth */}
          <path
            d="M50 21 Q76 26 76 50 Q76 67 62 77 Q59 70 57 58 Q63 48 60 35 Z"
            fill="#B08868"
            opacity="0.15"
          />

          {/* Cheek blush */}
          <ellipse cx="36" cy="57" rx="7.5" ry="4.5" fill="#E8B89A" opacity="0.35" />
          <ellipse cx="64" cy="57" rx="7.5" ry="4.5" fill="#E8B89A" opacity="0.35" />

          {/* ── LEFT EYE ──
              Avatar style: bold upper lid stroke only, no individual lashes */}
          <ellipse cx="37" cy="47" rx="8.5" ry="5.9" fill="white" />
          {/* Iris — Katara's blue-grey */}
          <circle cx="37" cy="47" r="5.2" fill="#3A6A8C" />
          <circle cx="37" cy="47" r="4.6" fill="#2A5070" opacity="0.75" />
          {/* Pupil */}
          <circle cx="37" cy="47" r="2.8" fill="#0A0808" />
          {/* Highlights */}
          <circle cx="39.5" cy="44.5" r="1.8" fill="white" opacity="0.9" />
          <circle cx="35.5" cy="49.5" r="1" fill="white" opacity="0.4" />
          {/* Bold upper lid — single clean stroke (Avatar style) */}
          <path d="M28.5 42 Q37 37.5 45.5 42" stroke="#1E0C06" fill="none" strokeWidth="3" strokeLinecap="round" />
          {/* Thin lower lid */}
          <path d="M29.5 51 Q37 54 44.5 51" stroke="#1E0C06" fill="none" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />

          {/* ── RIGHT EYE ── */}
          <ellipse cx="63" cy="47" rx="8.5" ry="5.9" fill="white" />
          <circle cx="63" cy="47" r="5.2" fill="#3A6A8C" />
          <circle cx="63" cy="47" r="4.6" fill="#2A5070" opacity="0.75" />
          <circle cx="63" cy="47" r="2.8" fill="#0A0808" />
          <circle cx="65.5" cy="44.5" r="1.8" fill="white" opacity="0.9" />
          <circle cx="61.5" cy="49.5" r="1" fill="white" opacity="0.4" />
          <path d="M54.5 42 Q63 37.5 71.5 42" stroke="#1E0C06" fill="none" strokeWidth="3" strokeLinecap="round" />
          <path d="M55.5 51 Q63 54 70.5 51" stroke="#1E0C06" fill="none" strokeWidth="0.8" strokeLinecap="round" opacity="0.45" />

          {/* ── Eyebrows — soft arch, Katara-style ── */}
          <path d="M28 38 Q37 34 46 38" stroke="#1E0C06" fill="none" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M54 38 Q63 34 72 38" stroke="#1E0C06" fill="none" strokeWidth="2.2" strokeLinecap="round" />

          {/* ── Nose — small curved hint ── */}
          <path d="M47 58 Q49 62 50 62 Q51 62 53 58" stroke="#A07850" fill="none" strokeWidth="1.4" strokeLinecap="round" />

          {/* ── Ears ── */}
          <ellipse cx="24" cy="52" rx="3.5" ry="5" fill="#CFAE8A" />
          <ellipse cx="76" cy="52" rx="3.5" ry="5" fill="#CFAE8A" />
          <ellipse cx="24" cy="52" rx="2" ry="3" fill="#B08868" opacity="0.4" />
          <ellipse cx="76" cy="52" rx="2" ry="3" fill="#B08868" opacity="0.4" />

          {/* ── MOUTH ── */}
          {!isSpeaking ? (
            /* Closed gentle smile */
            <path d="M42 69 Q50 75 58 69" stroke="#B06040" fill="none" strokeWidth="2" strokeLinecap="round" />
          ) : (
            /* Open talking mouth */
            <g>
              {/* Upper lip */}
              <path d="M42 68 Q46 71 50 71 Q54 71 58 68 Q54 65.5 50 66.5 Q46 65.5 42 68 Z" fill="#B06040" />
              {/* Animated mouth interior */}
              <ellipse cx="50" cy="70" rx="8" ry="2.5" fill="#1C0808" className="animate-mouth-talk-svg" />
              {/* Lower lip */}
              <path d="M42 70 Q50 76 58 70" stroke="#B06040" fill="none" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          )}

        </g>

      </svg>

      {/* Sound wave bars */}
      <div className="flex items-end gap-px" style={{ height: 14 }}>
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-400 animate-sound-wave1" : "bg-gray-200"}`} style={{ height: "40%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-500 animate-sound-wave2" : "bg-gray-200"}`} style={{ height: "65%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-600 animate-sound-wave3" : "bg-gray-200"}`} style={{ height: "100%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-500 animate-sound-wave2" : "bg-gray-200"}`} style={{ height: "65%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-400 animate-sound-wave1" : "bg-gray-200"}`} style={{ height: "40%" }} />
      </div>
    </div>
  );
}
