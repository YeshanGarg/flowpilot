"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { StatusBadge } from "../../../components/status-badge";
import { apiClient } from "../../../lib/api";
import type { Workflow } from "../../../lib/types";

export default function WorkflowDetailsPage() {
  const params = useParams<{ id: string }>();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p>Loading workflow details...</p>;
  if (error) return <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p>;
  if (!workflow) return <p className="text-sm text-slate-600">Workflow not found.</p>;

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
              {step.comments ? <p className="mt-2 text-sm">Comment: {step.comments}</p> : null}
            </article>
          ))}
        </div>
      </div>

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
