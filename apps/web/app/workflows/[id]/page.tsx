"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "../../../components/status-badge";
import { apiClient } from "../../../lib/api";
import { elapsedLabel, isOverdue } from "../../../lib/format";
import type { Workflow, AIReviewResult, AIReviewSection } from "../../../lib/types";

function riskClasses(risk: string) {
  const r = risk?.toUpperCase();
  if (r === "LOW") return "bg-emerald-100 text-emerald-700";
  if (r === "MEDIUM") return "bg-amber-100 text-amber-700";
  if (r === "HIGH") return "bg-orange-100 text-orange-700";
  if (r === "CRITICAL") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function ReviewSection({ title, section }: { title: string; section: AIReviewSection }) {
  return (
    <article className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-medium">{title}</h3>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskClasses(section.risk)}`}>
            {section.risk}
          </span>
          <span className="text-xs text-slate-500">{section.confidence}% conf.</span>
        </div>
      </div>
      {section.reasoning?.length ? (
        <ul className="mt-2 list-inside list-disc text-sm text-slate-700">
          {section.reasoning.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export default function WorkflowDetailsPage() {
  const params = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [review, setReview] = useState<AIReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const [reminder, setReminder] = useState("");

  useEffect(() => {
    async function load() {
      if (!params.id) return;

      setLoading(true);
      setError("");
      try {
        const data = await apiClient.getWorkflow(params.id);
        setWorkflow(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params.id]);

  async function runAIReview() {
    if (!workflow) return;

    setReviewLoading(true);
    setReviewError("");
    setReview(null);
    try {
      const steps = (workflow.workflowSteps || []).map((s) => s.workflowTemplateStep);
      const activeIdx = (workflow.workflowSteps || []).findIndex((s) => s.status === "ACTIVE");
      const idx = activeIdx >= 0 ? activeIdx : 0;

      const result = await apiClient.reviewWorkflow({
        workflowTitle: workflow.title,
        workflowTemplate: workflow.workflowTemplate?.name || "Workflow",
        organizationName: "FlowPilot Labs",
        requesterName: "Requester",
        currentStep: steps[idx]?.name || "Review",
        payload: (workflow.payload as Record<string, unknown>) || {},
        previousSteps: steps.slice(0, idx).map((s) => s.name),
        remainingSteps: steps.slice(idx + 1).map((s) => s.name),
      });
      setReview(result);
    } catch (err) {
      setReviewError((err as Error).message);
    } finally {
      setReviewLoading(false);
    }
  }

  if (loading) return <p>Loading workflow details...</p>;
  if (error) return <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>;
  if (!workflow) return <p className="text-sm text-slate-600">Workflow not found.</p>;

  const activeStep = (workflow.workflowSteps || []).find((s) => s.status === "ACTIVE");

  function generateReminder() {
    if (!workflow) return;
    const stepName = activeStep?.workflowTemplateStep.name || "the current step";
    const pending = activeStep?.startedAt ? elapsedLabel(activeStep.startedAt) : "some time";
    const risk = review
      ? ` AI assessment: ${review.decision.overallRisk} risk — recommendation ${review.decision.recommendation}.`
      : "";
    const escalated = review?.decision.escalated
      ? " This request was escalated to human review by policy."
      : "";
    setReminder(
      `Reminder: "${workflow.title}" is awaiting action at "${stepName}" and has been pending for ${pending}.${risk}${escalated} Please review and take action.`
    );
  }

  return (
    <section className="space-y-5">
      <div className="card">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{workflow.title}</h1>
          <StatusBadge status={workflow.status} />
        </div>
        <p className="mt-2 text-xs text-slate-500">Workflow ID: {workflow.id}</p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">AI Review</h2>
            <p className="text-sm text-slate-600">
              Qwen3-0.6B on AMD via vLLM assesses Security, Compliance, Operations, and Cost.
            </p>
          </div>
          <button
            className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            onClick={runAIReview}
            disabled={reviewLoading}
          >
            {reviewLoading ? "Analyzing..." : "Run AI Review"}
          </button>
        </div>

        {reviewError ? (
          <p className="mt-3 rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{reviewError}</p>
        ) : null}

        {review ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-lg border-2 border-brand-500 bg-brand-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Recommendation: {review.decision.recommendation}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${riskClasses(review.decision.overallRisk)}`}>
                  Overall: {review.decision.overallRisk}
                </span>
              </div>
              {review.decision.summary ? (
                <p className="mt-2 text-sm text-slate-700">{review.decision.summary}</p>
              ) : null}
            </div>
            <ReviewSection title="Security" section={review.security} />
            <ReviewSection title="Compliance" section={review.compliance} />
            <ReviewSection title="Operations" section={review.operations} />
            <ReviewSection title="Cost" section={review.cost} />
          </div>
        ) : null}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <div className="mt-4 space-y-3">
          {(workflow.workflowSteps || []).map((step) => (
            <article key={step.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">
                  Step {step.workflowTemplateStep.order}: {step.workflowTemplateStep.name}
                </h3>
                <StatusBadge status={step.status} />
              </div>
              <p className="mt-1 text-xs text-slate-500">Type: {step.workflowTemplateStep.type}</p>
              {step.status === "ACTIVE" && step.startedAt ? (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="text-slate-600">Pending for {elapsedLabel(step.startedAt)}</span>
                  {isOverdue(step.startedAt) ? (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-700">Overdue</span>
                  ) : null}
                </div>
              ) : null}
              {step.comments ? <p className="mt-2 text-sm">Comment: {step.comments}</p> : null}
            </article>
          ))}
        </div>
      </div>

      {activeStep ? (
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Follow-up Reminder</h2>
              <p className="text-sm text-slate-600">
                Generate a ready-to-send nudge for the pending approver.
              </p>
            </div>
            <button
              className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
              onClick={generateReminder}
            >
              Generate Reminder
            </button>
          </div>
          {reminder ? (
            <textarea
              readOnly
              className="mt-3 w-full rounded-md border border-slate-300 p-3 text-sm"
              rows={3}
              value={reminder}
            />
          ) : null}
        </div>
      ) : null}

      <div className="card">
        <h2 className="text-lg font-semibold">Audit Logs</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(workflow.auditLogs || []).map((log) => (
            <li key={log.id} className="rounded border border-slate-200 p-3">
              <div className="font-medium">{log.action}</div>
              <div className="text-slate-600">{log.message || "No details"}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
