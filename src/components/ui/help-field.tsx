"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Info, X, ChevronRight } from "lucide-react";

interface HelpFieldProps {
  label: string;
  tooltip: string;
  modal?: { title: string; content: ReactNode };
  guide?: { title: string; content: ReactNode };
  children?: ReactNode;
}

export function HelpField({ label, tooltip, modal, guide, children }: HelpFieldProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showTooltip) return;
    const handler = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) setShowTooltip(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showTooltip]);

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5 mb-1">
        <label className="text-[13px] font-medium text-text-primary">{label}</label>
        <button
          type="button"
          className="cursor-pointer text-text-secondary hover:text-primary transition-colors"
          onClick={() => modal ? setShowModal(true) : setShowTooltip(!showTooltip)}
          onMouseEnter={() => { if (!modal) setShowTooltip(true); }}
          onMouseLeave={() => { if (!modal) setShowTooltip(false); }}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {showTooltip && !modal && (
        <div ref={tooltipRef} className="absolute z-30 top-6 left-0 bg-[#1a1a2e] text-white text-[12px] px-3 py-2 rounded-[var(--radius-sm)] max-w-[280px] shadow-lg">
          {tooltip}
        </div>
      )}

      {children}

      {showModal && modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-[var(--radius-md)] shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-neutral-lighter">
              <h3 className="text-[16px] font-medium text-primary">{modal.title}</h3>
              <button className="cursor-pointer text-text-secondary hover:text-primary" onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 text-[13px] text-text-primary leading-relaxed">
              <p className="text-[13px] text-text-secondary mb-3 italic">{tooltip}</p>
              {modal.content}
              {guide && (
                <button className="flex items-center gap-1 mt-4 text-primary text-[13px] font-medium cursor-pointer hover:underline" onClick={() => { setShowModal(false); setShowGuide(true); }}>
                  View Full Guide <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showGuide && guide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowGuide(false)}>
          <div className="bg-surface rounded-[var(--radius-md)] shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-neutral-lighter">
              <h3 className="text-[16px] font-medium text-primary">{guide.title}</h3>
              <button className="cursor-pointer text-text-secondary hover:text-primary" onClick={() => setShowGuide(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 text-[13px] text-text-primary leading-relaxed">
              {guide.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
