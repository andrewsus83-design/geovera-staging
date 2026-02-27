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

export default function HireAgentPanel({ brandId, onHired }: HireAgentPanelProps) {
  const [hiredAgents, setHiredAgents] = useState<HiredAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [role, setRole] = useState<AgentRole>("CEO");
  const [personaName, setPersonaName] = useState("");
  const [personaTitle, setPersonaTitle] = useState("");
  const [description, setDescription] = useState("");
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [datasetFile, setDatasetFile] = useState<File | null>(null);
  const [datasetSummary, setDatasetSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const datasetInputRef = useRef<HTMLInputElement>(null);

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

  const handleDatasetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDatasetFile(file);
    // Auto-read summary from JSON
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        const keys = Object.keys(json).slice(0, 5).join(", ");
        setDatasetSummary(`Keys: ${keys}${Object.keys(json).length > 5 ? "…" : ""}`);
      } catch { setDatasetSummary(""); }
    };
    reader.readAsText(file);
  };

  const handleHire = async () => {
    if (!personaName.trim()) { setError("Persona name is required"); return; }
    if (!brandId) { setError("Brand not loaded"); return; }

    setSaving(true);
    setError(null);

    try {
      let profilePicUrl: string | null = null;
      let datasetUrl: string | null = null;

      // Upload profile pic
      if (profileFile) {
        const ext = profileFile.name.split(".").pop();
        const path = `${brandId}/${role.toLowerCase()}-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("agent-profiles")
          .upload(path, profileFile, { upsert: true });
        if (upErr) throw new Error(`Profile upload failed: ${upErr.message}`);
        const { data: urlData } = supabase.storage.from("agent-profiles").getPublicUrl(path);
        profilePicUrl = urlData.publicUrl;
      }

      // Upload JSON dataset
      if (datasetFile) {
        const path = `${brandId}/${role.toLowerCase()}-${Date.now()}.json`;
        const { error: upErr } = await supabase.storage
          .from("agent-datasets")
          .upload(path, datasetFile, { upsert: true, contentType: "application/json" });
        if (upErr) throw new Error(`Dataset upload failed: ${upErr.message}`);
        const { data: urlData } = supabase.storage.from("agent-datasets").getPublicUrl(path);
        datasetUrl = urlData.publicUrl;
      }

      // Insert agent row
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
          dataset_summary: datasetSummary || null,
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
      setDatasetFile(null); setDatasetSummary("");
      setRole("CEO");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to hire agent");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (agentId: string) => {
    await supabase.from("gv_ai_agents").update({ is_active: false }).eq("id", agentId);
    setHiredAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

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
                    <Image
                      src={agent.profile_pic_url}
                      alt={agent.persona_name}
                      width={44}
                      height={44}
                      className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                    />
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
                    {agent.dataset_url && (
                      <p className="text-[10px] text-brand-500 mt-1">Dataset uploaded</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(agent.id)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                    title="Remove agent"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hire form */}
        {showForm && (
          <div className="rounded-xl border border-brand-200 dark:border-brand-500/30 bg-brand-50/30 dark:bg-brand-500/5 p-3 space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">New Persona</h4>

            {error && (
              <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
            )}

            {/* Role */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <div className="grid grid-cols-4 gap-1">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`rounded-lg py-2 text-[10px] font-semibold transition-colors ${
                      role === r
                        ? "bg-brand-500 text-white"
                        : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-brand-300"
                    }`}
                  >
                    {ROLE_ICON[r]} {r}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{ROLE_DESC[role]}</p>
            </div>

            {/* Profile pic */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Profile Photo</label>
              <div
                onClick={() => profileInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-3 cursor-pointer hover:border-brand-400 transition-colors"
              >
                {profilePreview ? (
                  <Image src={profilePreview} alt="preview" width={48} height={48} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 text-xl">
                    {ROLE_ICON[role]}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {profileFile ? profileFile.name : "Upload photo"}
                  </p>
                  <p className="text-[10px] text-gray-400">JPG, PNG, WebP · max 5MB</p>
                </div>
              </div>
              <input ref={profileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleProfileChange} />
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

            {/* Dataset JSON */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Dataset (.json)</label>
              <div
                onClick={() => datasetInputRef.current?.click()}
                className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 p-3 cursor-pointer hover:border-brand-400 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 truncate">
                    {datasetFile ? datasetFile.name : "Upload dataset"}
                  </p>
                  {datasetSummary ? (
                    <p className="text-[10px] text-brand-500 truncate">{datasetSummary}</p>
                  ) : (
                    <p className="text-[10px] text-gray-400">JSON mindset / training data · max 10MB</p>
                  )}
                </div>
              </div>
              <input ref={datasetInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleDatasetChange} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleHire}
                disabled={saving || !personaName.trim()}
                className="flex-1 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
              >
                {saving ? "Hiring…" : `Hire as ${role}`}
              </button>
              <button
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
