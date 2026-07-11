"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import { elapsedLabel, isOverdue } from "../../lib/format";
import type { User, Workflow, AIReviewResult } from "../../lib/types";

function riskClasses(risk: string) {
  const r = risk?.toUpperCase();
  if (r === "LOW") return "bg-emerald-100 text-emerald-700";
  if (r === "MEDIUM") return "bg-amber-100 text-amber-700";
  if (r === "HIGH") return "bg-orange-100 text-orange-700";
  if (r === "CRITICAL") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function recClasses(rec: string) {
  if (rec === "APPROVE") return "bg-emerald-600 text-white";
  if (rec === "REJECT") return "bg-rose-600 text-white";
  return "bg-amber-500 text-white";
}

export default function ApprovalsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [actedByUserId, setActedByUserId] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState<Record<string, AIReviewResult>>({});
  const [reviewLoading, setReviewLoading] = useState<Record<string, boolean>>({});

  async function load() {
    setError("");
    try {
      const [workflowData, userData] = await Promise.all([apiClient.getWorkflows(), apiClient.getUsers()]);
      setWorkflows(workflowData.filter((workflow) => workflow.status === "RUNNING"));
      setUsers(userData);
      if (!actedByUserId && userData[0]) {
        setActedByUserId(userData[0].id);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function runReview(id: string) {
    setReviewLoading((s) => ({ ...s, [id]: true }));
    try {
      const wf = await apiClient.getWorkflow(id);
      const steps = (wf.workflowSteps || []).map((s) => s.workflowTemplateStep);
      const activeIdx = (wf.workflowSteps || []).findIndex((s) => s.status === "ACTIVE");
      const idx = activeIdx >= 0 ? activeIdx : 0;

      const result = await apiClient.reviewWorkflow({
        workflowTitle: wf.title,
        workflowTemplate: wf.workflowTemplate?.name || "Workflow",
        organizationName: "FlowPilot Labs",
        requesterName: "Requester",
        currentStep: steps[idx]?.name || "Review",
        payload: (wf.payload as Record<string, unknown>) || {},
        previousSteps: steps.slice(0, idx).map((s) => s.name),
        remainingSteps: steps.slice(idx + 1).map((s) => s.name),
      });
      setReviews((s) => ({ ...s, [id]: result }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setReviewLoading((s) => ({ ...s, [id]: false }));
    }
  }

  async function onAction(id: string, action: "approve" | "reject") {
    if (!actedByUserId) return;

    setError("");
    try {
      if (action === "approve") {
        await apiClient.approveWorkflow(id, { actedByUserId, comments });
      } else {
        await apiClient.rejectWorkflow(id, { actedByUserId, comments });
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Approvals</h1>

      <div className="card grid gap-3 md:grid-cols-2">
        <select className="rounded-md border border-slate-300 px-3 py-2" value={actedByUserId} onChange={(event) => setActedByUserId(event.target.value)}>
          <option value="">Acting user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Optional comment"
        />
      </div>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {workflows.length === 0 ? <p className="text-sm text-slate-600">No running workflows requiring action.</p> : null}

      <div className="grid gap-3">
        {workflows.map((workflow) => {
          const review = reviews[workflow.id];
          const decision = review?.decision;
          return (
            <article key={workflow.id} className="card">
              <h2 className="font-semibold">{workflow.title}</h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <span>Pending for {elapsedLabel(workflow.createdAt)}</span>
                {isOverdue(workflow.createdAt) ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-700">Overdue</span>
                ) : null}
              </div>

              {decision ? (
                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">🤖 AI:</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${recClasses(decision.recommendation)}`}>
                      {decision.recommendation}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskClasses(decision.overallRisk)}`}>
                      Risk: {decision.overallRisk}
                    </span>
                    {decision.escalated ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                        ⚠ Escalated to human review by policy
                      </span>
                    ) : null}
                  </div>
                  {decision.summary ? <p className="mt-2 text-sm text-slate-700">{decision.summary}</p> : null}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="rounded-md bg-brand-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  onClick={() => runReview(workflow.id)}
                  disabled={reviewLoading[workflow.id]}
                >
                  {reviewLoading[workflow.id] ? "Analyzing..." : "🤖 AI Recommendation"}
                </button>
                <button
                  className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => onAction(workflow.id, "approve")}
                >
                  Approve
                </button>
                <button
                  className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                  onClick={() => onAction(workflow.id, "reject")}
                >
                  Reject
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
