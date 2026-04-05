"use client";

interface Props {
  isSpeaking: boolean;
}

export default function SpeakingAvatar({ isSpeaking }: Props) {
  return (
    <div
      className={`inline-flex flex-col items-center gap-1.5 bg-white border-2 rounded-xl p-2 shadow-md transition-all duration-200 ${
        isSpeaking ? "border-blue-400" : "border-gray-200 opacity-40"
      }`}
      style={{ minWidth: 60 }}
    >
      {/* Avatar face */}
      <div className="w-11 h-11 relative rounded-full overflow-hidden bg-amber-200 border-2 border-amber-400">
        {/* Hair */}
        <div className="absolute top-0 left-0 right-0 h-[40%] bg-amber-800 rounded-t-full" />
        {/* Eyes + mouth */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pt-4">
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-gray-800" />
          </div>
          <div
            className={`bg-rose-500 rounded ${isSpeaking ? "animate-mouth-talk" : ""}`}
            style={{ width: "9px", height: "3px" }}
          />
        </div>
      </div>

      {/* Sound wave bars */}
      <div className="flex items-end gap-px" style={{ height: 16 }}>
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-400 animate-sound-wave1" : "bg-gray-200"}`} style={{ height: "40%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-500 animate-sound-wave2" : "bg-gray-200"}`} style={{ height: "65%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-600 animate-sound-wave3" : "bg-gray-200"}`} style={{ height: "100%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-500 animate-sound-wave2" : "bg-gray-200"}`} style={{ height: "65%" }} />
        <div className={`w-1.5 rounded-full ${isSpeaking ? "bg-blue-400 animate-sound-wave1" : "bg-gray-200"}`} style={{ height: "40%" }} />
      </div>
    </div>
  );
}
