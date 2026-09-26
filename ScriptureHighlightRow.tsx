import React, { useState } from "react";

interface ScriptureHighlightRowProps {
  verseId: string;
  verseNumber?: number;
  verseText: string;
  initialHighlight?: string | null;
  onSaveHighlight?: (verseId: string, color: string | null) => void;
}

export const ScriptureHighlightRow: React.FC<ScriptureHighlightRowProps> = ({
  verseId,
  verseNumber,
  verseText,
  initialHighlight = null,
  onSaveHighlight
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [highlightColor, setHighlightColor] = useState<string | null>(initialHighlight);

  const savePersonalHighlight = (id: string, color: string | null) => {
    setHighlightColor(color);
    setShowPicker(false);
    if (onSaveHighlight) {
      onSaveHighlight(id, color);
    }
  };

  return (
    <div
      className={`relative group p-4 border-b border-amber-500/10 transition-colors ${
        showPicker ? "z-40" : "z-10 hover:z-30"
      } ${highlightColor ? "rounded-xl" : ""}`}
      style={{
        backgroundColor: highlightColor ? `${highlightColor}25` : undefined
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-base text-gray-200 selection:bg-amber-500 selection:text-black leading-relaxed flex-1">
          {verseNumber && (
            <span className="font-mono text-xs text-amber-500 font-bold mr-2 select-none">
              {verseNumber}
            </span>
          )}
          {verseText}
        </p>

        <button
          onClick={() => setShowPicker((prev) => !prev)}
          className="text-xs font-mono px-2 py-1 rounded bg-neutral-900 border border-amber-500/30 text-amber-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer shrink-0"
        >
          {highlightColor ? "Edit Color" : "Highlight"}
        </button>
      </div>

      {/* Highlighting Toolbar - z-50 with negative top offset */}
      {showPicker && (
        <div className="absolute -top-12 left-4 z-50 flex items-center gap-2 bg-neutral-950 border border-amber-500/40 p-2 rounded-xl shadow-2xl animate-fadeIn">
          {["#fef08a", "#bbf7d0", "#bae6fd", "#fbcfe8"].map((color) => (
            <button
              key={color}
              onClick={() => savePersonalHighlight(verseId, color)}
              style={{ backgroundColor: color }}
              className="w-6 h-6 rounded-full border border-black/20 hover:scale-110 transition-transform cursor-pointer"
              title={`Highlight with ${color}`}
            />
          ))}

          {highlightColor && (
            <button
              onClick={() => savePersonalHighlight(verseId, null)}
              className="text-[10px] font-mono text-rose-400 hover:text-rose-300 ml-1 px-1.5 py-0.5 rounded bg-rose-950/40 border border-rose-800 cursor-pointer"
            >
              Clear
            </button>
          )}

          <button
            onClick={() => setShowPicker(false)}
            className="text-gray-400 hover:text-white text-xs px-1 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
};
