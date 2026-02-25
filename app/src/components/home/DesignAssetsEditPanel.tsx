"use client";
import { useState } from "react";

const initialColors = ["#16A34A", "#0B0F19", "#6B7280", "#F9FAFB", "#DC2626"];

export default function DesignAssetsEditPanel() {
  const [colors, setColors] = useState(initialColors);

  const updateColor = (index: number, value: string) => {
    setColors((prev) => prev.map((c, i) => (i === index ? value : c)));
  };

  return (
    <div className="h-full flex flex-col p-2 overflow-y-auto custom-scrollbar">
      <h3
        className="text-base font-semibold text-gray-900 dark:text-white mb-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        Design Assets
      </h3>

      <div className="flex-1 space-y-5 overflow-y-auto">
        {/* Brand Colors */}
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Brand Colors</h4>
          <div className="space-y-2">
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="h-8 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-700"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => updateColor(i, e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-mono text-gray-700 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Logos</h4>
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center dark:border-gray-700">
            <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18v-1.5M3 16.5l4.72-4.72a2.25 2.25 0 013.18 0l4.72 4.72M16.5 12l1.28-1.28a2.25 2.25 0 013.18 0L21 12" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">Drop logos here or click to upload</p>
            <p className="text-[10px] text-gray-400 mt-1">PNG, SVG up to 5MB</p>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
              <span className="text-xs text-gray-700 dark:text-gray-300">logo-primary.svg</span>
              <span className="text-[10px] text-gray-400">12 KB</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
              <span className="text-xs text-gray-700 dark:text-gray-300">logo-white.png</span>
              <span className="text-[10px] text-gray-400">48 KB</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
              <span className="text-xs text-gray-700 dark:text-gray-300">favicon.ico</span>
              <span className="text-[10px] text-gray-400">4 KB</span>
            </div>
          </div>
        </div>

        {/* LoRA Product Training */}
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">LoRA Product Training</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Upload product images to train your custom AI image model. Your plan allows up to 10 products.
          </p>
          <div className="rounded-lg border-2 border-dashed border-gray-200 p-4 text-center dark:border-gray-700">
            <svg className="mx-auto mb-2 h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
            </svg>
            <p className="text-xs text-gray-500 dark:text-gray-400">Upload product photos for AI training</p>
            <p className="text-[10px] text-gray-400 mt-1">5-15 images per product recommended</p>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Products trained</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">3 / 10</span>
          </div>
          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
            <div className="h-1.5 rounded-full bg-brand-500" style={{ width: "30%" }} />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Premium plan: 10 products max</p>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
        <button className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  );
}
