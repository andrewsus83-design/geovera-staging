"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import type { Agent } from "./AgentList";
import type { HiredAgent } from "./HireAgentPanel";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AgentDetailCardProps {
  agent: Agent;
  hiredAgent?: HiredAgent | null;
  brandId?: string;
}

export default function AgentDetailCard({ agent, hiredAgent, brandId }: AgentDetailCardProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Reset chat when agent changes
  useEffect(() => {
    setMessages([]);
    setChatError(null);
  }, [agent.id]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    if (!brandId || !hiredAgent) return;

    setInput("");
    setSending(true);
    setChatError(null);

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);

    try {
      const res = await fetch("/api/agent-inference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: brandId,
          role: hiredAgent.role,
          message: text,
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      if (data.success && data.response) {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      } else {
        setChatError(data.error ?? "Failed to get response");
      }
    } catch {
      setChatError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasPersona = !agent.locked && !!hiredAgent;

  return (
    <div className="space-y-4">
      {/* Agent header */}
      <div className={`rounded-xl border p-5 ${
        agent.locked
          ? "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50"
          : "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
      }`}>
        {agent.locked && (
          <div className="mb-3 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            Upgrade your plan to unlock this agent
          </div>
        )}

        <div className="flex items-center gap-3 mb-4">
          {hiredAgent?.profile_pic_url ? (
            <Image
              src={hiredAgent.profile_pic_url}
              alt={hiredAgent.persona_name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <span className="text-3xl">{agent.icon}</span>
          )}
          <div>
            <h2
              className="text-lg font-semibold text-gray-900 dark:text-white"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {hiredAgent ? hiredAgent.persona_name : agent.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hiredAgent?.persona_title ?? agent.title}
            </p>
          </div>
          {agent.active && !agent.locked && (
            <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400">
              Active
            </span>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          {hiredAgent?.persona_description ?? agent.description}
        </p>

        {/* Uploaded data badges */}
        {hiredAgent && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hiredAgent.dataset_url && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">Dataset</span>
            )}
            {hiredAgent.mindset_url && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">Mindset</span>
            )}
            {hiredAgent.skillset_url && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">Skillset</span>
            )}
            {hiredAgent.anchor_character_url && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">Anchor</span>
            )}
            {hiredAgent.images_urls?.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {hiredAgent.images_urls.length} image{hiredAgent.images_urls.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        )}

        {/* Daily Tasks */}
        <div className="mb-4">
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Daily Job Description</h4>
          <ul className="space-y-1.5">
            {agent.dailyTasks.map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-500 flex-shrink-0 mt-0.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {task}
              </li>
            ))}
          </ul>
        </div>

        {/* Skills */}
        <div>
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-2">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {agent.skills.map((skill) => (
              <span key={skill} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {!agent.locked && agent.recentActivity.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <h4 className="text-xs font-medium uppercase text-gray-400 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {agent.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                <span className="text-xs text-gray-700 dark:text-gray-300">{activity.title}</span>
                <span className="text-[10px] text-gray-400">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Chat with Agent (Llama via Cloudflare Workers AI) ── */}
      {hasPersona && (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 overflow-hidden">
          {/* Chat header */}
          <button
            onClick={() => setChatOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-500">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Chat with {hiredAgent!.persona_name}
              </span>
              <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[9px] text-gray-400">
                Llama · Cloudflare
              </span>
            </div>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`text-gray-400 transition-transform ${chatOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {chatOpen && (
            <div className="border-t border-gray-100 dark:border-gray-800">
              {/* Messages */}
              <div className="h-56 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {messages.length === 0 && (
                  <p className="text-center text-[10px] text-gray-400 pt-4">
                    Ask {hiredAgent!.persona_name} anything about strategy, marketing, or their approach.
                  </p>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-500 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
                {chatError && (
                  <p className="text-center text-[10px] text-red-400">{chatError}</p>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-2 flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask ${hiredAgent!.persona_name}…`}
                  disabled={sending}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 outline-none focus:border-brand-400 disabled:opacity-60"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !input.trim()}
                  className="rounded-lg bg-brand-500 px-3 py-2 hover:bg-brand-600 disabled:opacity-50 transition-colors flex-shrink-0"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompt to hire if not locked but no persona */}
      {!agent.locked && !hiredAgent && (
        <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-400">
            Hire a persona in the center panel to chat with this agent via Llama on Cloudflare.
          </p>
        </div>
      )}
    </div>
  );
}
