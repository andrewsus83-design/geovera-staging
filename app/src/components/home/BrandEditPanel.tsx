"use client";
import { useState } from "react";

export default function BrandEditPanel() {
  const [form, setForm] = useState({
    brandName: "GeoVera",
    tagline: "AI-Powered Marketing Intelligence",
    industry: "Marketing Intelligence",
    website: "geovera.xyz",
    location: "Jakarta, ID",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const fields = [
    { key: "brandName", label: "Brand Name",  type: "text" },
    { key: "tagline",   label: "Tagline",      type: "text" },
    { key: "industry",  label: "Industry",     type: "text" },
    { key: "website",   label: "Website",      type: "text" },
    { key: "location",  label: "Location",     type: "text" },
  ] as const;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 border-b border-[#F3F4F6]">
        <h3
          className="text-[16px] font-bold text-[#1F2428]"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Edit Brand
        </h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5">Update your brand profile settings</p>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
        {fields.map(({ key, label }) => (
          <div key={key}>
            <label className="block text-[12px] font-semibold text-[#4A545B] mb-1.5">
              {label}
            </label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => update(key, e.target.value)}
              className="gv-input"
            />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-[#F3F4F6]">
        <button className="gv-btn-primary w-full">
          Save Changes
        </button>
      </div>
    </div>
  );
}
