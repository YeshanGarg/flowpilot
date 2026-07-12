"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import { elapsedLabel } from "../../lib/format";
import type { Workflow } from "../../lib/types";

interface Draft {
  subject: string;
  body: string;
  recipient: string;
  sent?: boolean;
}

export default function EscalationsPage() {
  const [overdue, setOverdue] = useState<Workflow[]>([]);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [autoEnabled, setAutoEnabled] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getWorkflows();
      // Overdue = still running and pending longer than the SLA threshold.
      const stale = data.filter(
        (w) => w.status === "RUNNING" && Date.now() - new Date(w.createdAt).getTime() > 15 * 60000
      );
      setOverdue(stale);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
    apiClient.getAutoEscalation().then((s) => setAutoEnabled(s.enabled)).catch(() => {});
    const interval = setInterval(() => void load(), 8000);
    return () => clearInterval(interval);
  }, [load]);

  async function toggleAuto() {
    try {
      const s = await apiClient.setAutoEscalation(!autoEnabled);
      setAutoEnabled(s.enabled);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function runEscalationCheck() {
    setRunning(true);
    setError("");
    try {
      const results = await Promise.all(
        overdue.map(async (w) => {
          const full = await apiClient.getWorkflow(w.id);
          const active = (full.workflowSteps || []).find((s) => s.status === "ACTIVE");
          const draft = await apiClient.draftEscalation({
            workflowTitle: full.title,
            currentStep: active?.workflowTemplateStep.name || "the current step",
            pendingLabel: active?.startedAt ? elapsedLabel(active.startedAt) : elapsedLabel(full.createdAt),
            requesterName: "Requester",
            approverName: "Approver",
          });
          return [w.id, draft] as const;
        })
      );
      setDrafts((prev) => {
        const next = { ...prev };
        for (const [id, draft] of results) next[id] = draft;
        return next;
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRunning(false);
    }
  }

  async function send(id: string) {
    const draft = drafts[id];
    if (!draft) return;
    try {
      await apiClient.remindWorkflow(id, `${draft.subject} — ${draft.body}`);
      setDrafts((prev) => ({ ...prev, [id]: { ...draft, sent: true } }));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">AI Escalation Engine</h1>
          <p className="text-sm text-slate-600">
            Automatically detects approvals stuck past their SLA and drafts reminder emails.
          </p>
        </div>
        <button
          className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={runEscalationCheck}
          disabled={running || overdue.length === 0}
        >
          {running ? "Scanning..." : "⚡ Run Escalation Check"}
        </button>
      </div>

      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Automatic reminders</p>
          <p className="text-xs text-slate-500">
            When on, the AI checks every 30s and auto-sends reminders for overdue approvals — no clicks needed.
          </p>
        </div>
        <button
          type="button"
          onClick={toggleAuto}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${autoEnabled ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}
        >
          {autoEnabled ? "🟢 Auto: ON" : "⚪ Auto: OFF"}
        </button>
      </div>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {overdue.length === 0 ? (
        <p className="text-sm text-slate-600">No overdue approvals. Everything is on track. ✅</p>
      ) : null}

      <div className="grid gap-3">
        {overdue.map((w) => {
          const draft = drafts[w.id];
          return (
            <article key={w.id} className="card">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold">{w.title}</h2>
                <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                  Overdue · pending {elapsedLabel(w.createdAt)}
                </span>
              </div>

              {draft ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">To: {draft.recipient}</p>
                  <p className="mt-1 text-sm font-semibold">{draft.subject}</p>
                  <p className="mt-1 text-sm text-slate-700">{draft.body}</p>
                  <div className="mt-3">
                    {draft.sent ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        ✓ Reminder sent to Slack &amp; logged to audit trail
                      </span>
                    ) : (
                      <button
                        className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                        onClick={() => send(w.id)}
                      >
                        Send Reminder
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Run the escalation check to draft an AI reminder.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
