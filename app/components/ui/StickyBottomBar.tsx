"use client";

import React from "react";

interface StickyBottomBarProps {
  priceFrom?: number;
  zaloNumber?: string;
  onBook: () => void;
  priceLabel?: string;
  leftTitle?: string;
  leftSubtitle?: string;
}

export default function StickyBottomBar({ 
  priceFrom, 
  zaloNumber, 
  onBook, 
  priceLabel = "/ người",
  leftTitle = "Giá từ",
  leftSubtitle
}: StickyBottomBarProps) {
  const hasPrice = typeof priceFrom === 'number';
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 pb-safe shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:!hidden lg:!hidden">
      <div className="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{leftTitle}</p>
          <div className="flex items-baseline gap-1">
            {hasPrice ? (
              <>
                <strong className="text-lg font-black text-teal-800">
                  {priceFrom > 0 ? priceFrom.toLocaleString("vi-VN") + "đ" : "Liên hệ"}
                </strong>
                {priceFrom > 0 && <span className="text-[11px] text-slate-500 font-semibold">{priceLabel}</span>}
              </>
            ) : (
              <strong className="text-sm font-black text-teal-800">
                {leftSubtitle}
              </strong>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {zaloNumber && (
            <a
              href={`https://zalo.me/${zaloNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat Zalo"
              className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal-50 text-teal-800 border-2 border-teal-800 active:scale-95 transition-transform shrink-0"
            >
              <i className="fa-brands fa-comment-dots text-lg" />
            </a>
          )}
          <button
            type="button"
            onClick={onBook}
            className="h-11 px-5 rounded-xl bg-gradient-to-br from-teal-800 to-teal-700 text-white font-extrabold text-sm active:scale-95 transition-transform flex items-center gap-2 shadow-lg shadow-teal-900/20 whitespace-nowrap"
          >
            <i className="fa-solid fa-calendar-check" /> Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
}
