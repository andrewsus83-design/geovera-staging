"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export type AgentRole = "CEO" | "CMO" | "CTO" | "SUPPORT";

export interface HiredAgent {
  id: string;
  role: AgentRole;
  persona_name: string;
  persona_title: string | null;
  persona_description: string | null;
  profile_pic_url: string | null;
  dataset_url: string | null;
  dataset_summary: string | null;
  mindset_url: string | null;
  skillset_url: string | null;
  anchor_character_url: string | null;
  images_urls: string[];
  is_active: boolean;
}

interface HireAgentPanelProps {
  brandId: string;
  onHired?: (agent: HiredAgent) => void;
}

const ROLES: AgentRole[] = ["CEO", "CMO", "CTO", "SUPPORT"];
const ROLE_ICON: Record<AgentRole, string> = { CEO: "🧑‍💼", CMO: "📣", CTO: "💻", SUPPORT: "🎧" };
const ROLE_DESC: Record<AgentRole, string> = {
  CEO: "Strategic Planning & Oversight",
  CMO: "Marketing & Content Strategy",
  CTO: "Technical Strategy",
  SUPPORT: "Auto-Reply & Engagement",
};

// ── Reusable JSON file upload row ────────────────────────────────
function JsonUploadRow({
  label, hint, file, onPick,
}: {
  label: string;
  hint: string;
  file: File | null;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      className={`w-full flex items-center gap-3 rounded-xl border border-dashed p-2.5 text-left transition-colors ${
        file
          ? "border-brand-400 bg-brand-50/40 dark:bg-brand-500/5"
          : "border-gray-300 dark:border-gray-600 hover:border-brand-400"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${file ? "bg-brand-100 dark:bg-brand-500/20" : "bg-gray-100 dark:bg-gray-800"}`}>
        {file ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-500">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
        <p className={`text-[10px] truncate mt-0.5 ${file ? "text-brand-500" : "text-gray-400"}`}>
          {file ? file.name : hint}
        </p>
      </div>
      {!file && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
}

// ── Upload a single JSON to agent-datasets bucket ────────────────
async function uploadJson(brandId: string, role: string, type: string, file: File): Promise<string> {
  const ts = Date.now();
  const path = `${brandId}/${role.toLowerCase()}-${type}-${ts}.json`;
  const { error } = await supabase.storage
    .from("agent-datasets")
    .upload(path, file, { upsert: true, contentType: "application/json" });
  if (error) throw new Error(`${type} upload failed: ${error.message}`);
  const { data } = supabase.storage.from("agent-datasets").getPublicUrl(path);
  return data.publicUrl;
}

export default function HireAgentPanel({ brandId, onHired }: HireAgentPanelProps) {
  const [hiredAgents, setHiredAgents] = useState<HiredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [role, setRole] = useState<AgentRole>("CEO");
  const [personaName, setPersonaName] = useState("");
  const [personaTitle, setPersonaTitle] = useState("");
  const [description, setDescription] = useState("");

  // File state
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [mindsetFile, setMindsetFile] = useState<File | null>(null);
  const [skillsetFile, setSkillsetFile] = useState<File | null>(null);
  const [anchorFile, setAnchorFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadStep, setUploadStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const datasetInputRef = useRef<HTMLInputElement>(null);
  const mindsetInputRef = useRef<HTMLInputElement>(null);
  const skillsetInputRef = useRef<HTMLInputElement>(null);
  const anchorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!brandId) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("gv_ai_agents")
        .select("*")
        .eq("brand_id", brandId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });
      if (!error && data) setHiredAgents(data as HiredAgent[]);
      setLoading(false);
    };
    load();
  }, [brandId]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setImageFiles((prev) => [...prev, ...files].slice(0, 8)); // max 8
    setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))].slice(0, 8));
  };

  const removeImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleHire = async () => {
    if (!personaName.trim()) { setError("Persona name is required"); return; }
    if (!brandId) { setError("Brand not loaded"); return; }

    setSaving(true);
    setError(null);

    try {
      let profilePicUrl: string | null = null;
      let datasetUrl: string | null = null;
      let mindsetUrl: string | null = null;
      let skillsetUrl: string | null = null;
      let anchorUrl: string | null = null;
      const uploadedImages: string[] = [];

      // 1. Profile photo
      if (profileFile) {
        setUploadStep("Uploading profile photo…");
        const ext = profileFile.name.split(".").pop();
        const path = `${brandId}/${role.toLowerCase()}-profile-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("agent-profiles")
          .upload(path, profileFile, { upsert: true });
        if (upErr) throw new Error(`Profile upload failed: ${upErr.message}`);
        profilePicUrl = supabase.storage.from("agent-profiles").getPublicUrl(path).data.publicUrl;
      }

      // 2. Additional images
      if (imageFiles.length > 0) {
        setUploadStep(`Uploading ${imageFiles.length} image(s)…`);
        for (const img of imageFiles) {
          const ext = img.name.split(".").pop();
          const path = `${brandId}/${role.toLowerCase()}-img-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: upErr } = await supabase.storage
            .from("agent-profiles")
            .upload(path, img, { upsert: true });
          if (upErr) throw new Error(`Image upload failed: ${upErr.message}`);
          uploadedImages.push(supabase.storage.from("agent-profiles").getPublicUrl(path).data.publicUrl);
        }
      }

      // 3. Dataset JSON
      if (datasetFile) {
        setUploadStep("Uploading dataset…");
        datasetUrl = await uploadJson(brandId, role, "dataset", datasetFile);
      }

      // 4. Mindset JSON
      if (mindsetFile) {
        setUploadStep("Uploading mindset…");
        mindsetUrl = await uploadJson(brandId, role, "mindset", mindsetFile);
      }

      // 5. Skillset JSON
      if (skillsetFile) {
        setUploadStep("Uploading skillset…");
        skillsetUrl = await uploadJson(brandId, role, "skillset", skillsetFile);
      }

      // 6. Anchor character JSON
      if (anchorFile) {
        setUploadStep("Uploading anchor character…");
        anchorUrl = await uploadJson(brandId, role, "anchor", anchorFile);
      }

      // 7. Insert DB row
      setUploadStep("Saving agent…");
      const { data: inserted, error: insErr } = await supabase
        .from("gv_ai_agents")
        .insert({
          brand_id: brandId,
          role,
          persona_name: personaName.trim(),
          persona_title: personaTitle.trim() || null,
          persona_description: description.trim() || null,
          profile_pic_url: profilePicUrl,
          dataset_url: datasetUrl,
          dataset_summary: null,
          mindset_url: mindsetUrl,
          skillset_url: skillsetUrl,
          anchor_character_url: anchorUrl,
          images_urls: uploadedImages,
        })
        .select()
        .single();

      if (insErr) throw new Error(insErr.message);

      const newAgent = inserted as HiredAgent;
      setHiredAgents((prev) => [...prev, newAgent]);
      onHired?.(newAgent);
      setSuccessMsg(`${personaName} hired as ${role}!`);
      setTimeout(() => setSuccessMsg(null), 4000);

      // Reset form
      setShowForm(false);
      setPersonaName(""); setPersonaTitle(""); setDescription("");
      setProfileFile(null); setProfilePreview(null);
      setImageFiles([]); setImagePreviews([]);
      setDatasetFile(null); setMindsetFile(null);
      setSkillsetFile(null); setAnchorFile(null);
      setRole("CEO");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to hire agent");
    } finally {
      setSaving(false);
      setUploadStep("");
    }
  };

  const handleRemove = async (agentId: string) => {
    await supabase.from("gv_ai_agents").update({ is_active: false }).eq("id", agentId);
    setHiredAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

  const uploadCount = [datasetFile, mindsetFile, skillsetFile, anchorFile].filter(Boolean).length + imageFiles.length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white" style={{ fontFamily: "Georgia, serif" }}>
              Hire AI Agent
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">Upload a real-world leader persona as your AI agent</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex-shrink-0 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600 transition-colors"
            >
              + Hire
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-3">
        {/* Success toast */}
        {successMsg && (
          <div className="rounded-xl bg-brand-50 border border-brand-200 px-4 py-3 dark:bg-brand-500/10 dark:border-brand-500/30">
            <p className="text-xs font-medium text-brand-700 dark:text-brand-400">{successMsg}</p>
          </div>
        )}

        {/* Hired agents list */}
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-5 w-5 rounded-full border-2 border-brand-200 border-t-brand-500 animate-spin" />
          </div>
        ) : hiredAgents.length === 0 && !showForm ? (
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
            <p className="text-2xl mb-2">🧑‍💼</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No agents hired yet</p>
            <p className="text-xs text-gray-400 mt-1">Hire a persona like Steve Jobs (CEO) or Gary Vee (CMO)</p>
          </div>
        ) : (
          <div className="space-y-2">
            {hiredAgents.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
                <div className="flex items-start gap-3">
                  {agent.profile_pic_url ? (
                    <Image src={agent.profile_pic_url} alt={agent.persona_name} width={44} height={44} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0 text-xl">
                      {ROLE_ICON[agent.role]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{agent.persona_name}</p>
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
                        {agent.role}
                      </span>
                    </div>
                    {agent.persona_title && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{agent.persona_title}</p>
                    )}
                    {agent.persona_description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2">
                        {agent.persona_description}
                      </p>
                    )}
                    {/* Upload badges */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {agent.dataset_url && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500">Dataset</span>}
                      {agent.mindset_url && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500">Mindset</span>}
                      {agent.skillset_url && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500">Skillset</span>}
                      {agent.anchor_character_url && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500">Anchor</span>}
                      {agent.images_urls?.length > 0 && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] text-gray-500">{agent.images_urls.length} image{agent.images_urls.length > 1 ? "s" : ""}</span>}
                    </div>
                  </div>
                  <button onClick={() => handleRemove(agent.id)} className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors" title="Remove">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Hire form ─────────────────────────────────────────── */}
        {showForm && (
          <div className="rounded-xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/30 dark:bg-brand-500/5 p-3 space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">New Persona</h4>

            {error && <p className="text-xs text-red-500 dark:text-red-400">{error}</p>}

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <div className="grid grid-cols-4 gap-1">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg py-2 text-[10px] font-semibold transition-colors ${
                      role === r ? "bg-brand-500 text-white" : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300"
                    }`}
                  >
                    {ROLE_ICON[r]} {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{ROLE_DESC[role]}</p>
            </div>

            {/* Profile photo */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Profile Photo</label>
              <div
                onClick={() => profileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-2.5 cursor-pointer hover:border-brand-400 transition-colors"
              >
                {profilePreview ? (
                  <Image src={profilePreview} alt="preview" width={44} height={44} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xl">
                    {ROLE_ICON[role]}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{profileFile ? profileFile.name : "Upload photo"}</p>
                  <p className="text-[10px] text-gray-400">JPG, PNG, WebP · max 5MB</p>
                </div>
              </div>
              <input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProfileChange} />
            </div>

            {/* Additional images */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Additional Images</label>
                {imageFiles.length > 0 && (
                  <span className="text-[10px] text-brand-500">{imageFiles.length}/8 uploaded</span>
                )}
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative group">
                      <Image src={src} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={() => imagesInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 py-2.5 text-xs text-gray-400 hover:border-brand-400 hover:text-brand-500 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Add images (up to 8)
              </button>
              <input ref={imagesInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImagesChange} />
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Persona Name *</label>
              <input
                value={personaName}
                onChange={(e) => setPersonaName(e.target.value)}
                placeholder="e.g. Steve Jobs"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</label>
              <input
                value={personaTitle}
                onChange={(e) => setPersonaTitle(e.target.value)}
                placeholder="e.g. Co-founder of Apple · Visionary CEO"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the mindset and approach this persona brings to the company..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 outline-none focus:border-brand-400 resize-none"
              />
            </div>

            {/* JSON uploads */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Training Files <span className="text-gray-400 font-normal">(.json)</span>
                {uploadCount > 0 && <span className="ml-1.5 text-brand-500">{uploadCount} file{uploadCount > 1 ? "s" : ""} selected</span>}
              </label>
              <div className="space-y-1.5">
                <JsonUploadRow
                  label="Dataset"
                  hint="Training data · facts, Q&A, references"
                  file={datasetFile}
                  onPick={() => datasetInputRef.current?.click()}
                />
                <JsonUploadRow
                  label="Mindset"
                  hint="Thinking patterns · principles · worldview"
                  file={mindsetFile}
                  onPick={() => mindsetInputRef.current?.click()}
                />
                <JsonUploadRow
                  label="Skillset"
                  hint="Expertise · capabilities · domain knowledge"
                  file={skillsetFile}
                  onPick={() => skillsetInputRef.current?.click()}
                />
                <JsonUploadRow
                  label="Anchor Character"
                  hint="System prompt · tone · behavior constraints"
                  file={anchorFile}
                  onPick={() => anchorInputRef.current?.click()}
                />
              </div>
              <input ref={datasetInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => setDatasetFile(e.target.files?.[0] ?? null)} />
              <input ref={mindsetInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => setMindsetFile(e.target.files?.[0] ?? null)} />
              <input ref={skillsetInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => setSkillsetFile(e.target.files?.[0] ?? null)} />
              <input ref={anchorInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => setAnchorFile(e.target.files?.[0] ?? null)} />
            </div>

            {/* Saving progress */}
            {saving && uploadStep && (
              <p className="text-[10px] text-brand-500 text-center">{uploadStep}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleHire}
                disabled={saving || !personaName.trim()}
                className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {saving ? "Hiring…" : `Hire as ${role}`}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null); }}
                disabled={saving}
                className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
