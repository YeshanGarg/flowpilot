"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import type { Organization, WorkflowTemplate } from "../../lib/types";

const STEP_TYPES = ["APPROVAL", "REVIEW", "AI_REVIEW", "AUTO_APPROVAL", "NOTIFICATION"];
const ROLES = ["", "MANAGER", "FINANCE", "IT", "SECURITY", "ADMIN"];

interface StepDraft {
  name: string;
  type: string;
  requiredRole: string;
}

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [steps, setSteps] = useState<StepDraft[]>([
    { name: "Manager Approval", type: "APPROVAL", requiredRole: "MANAGER" },
    { name: "Finance Review", type: "REVIEW", requiredRole: "FINANCE" },
  ]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  function updateStep(index: number, patch: Partial<StepDraft>) {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addStep() {
    setSteps((prev) => [...prev, { name: "", type: "APPROVAL", requiredRole: "" }]);
  }

  function removeStep(index: number) {
    setSteps((prev) => prev.filter((_, i) => i !== index));
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [templateData, organizationData] = await Promise.all([
        apiClient.getWorkflowTemplates(),
        apiClient.getOrganizations(),
      ]);
      setTemplates(templateData);
      setOrganizations(organizationData);
      if (!organizationId && organizationData[0]) {
        setOrganizationId(organizationData[0].id);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !organizationId) return;

    const cleanSteps = steps
      .map((s) => ({ name: s.name.trim(), type: s.type, requiredRole: s.requiredRole || null }))
      .filter((s) => s.name.length > 0)
      .map((s, i) => ({ order: i + 1, name: s.name, type: s.type, requiredRole: s.requiredRole }));

    if (cleanSteps.length === 0) {
      setError("Add at least one step.");
      return;
    }

    setError("");
    try {
      await apiClient.createWorkflowTemplate({
        name: name.trim(),
        description: description.trim() || null,
        organizationId,
        steps: cleanSteps,
      });
      setName("");
      setDescription("");
      setSteps([
        { name: "Manager Approval", type: "APPROVAL", requiredRole: "MANAGER" },
        { name: "Finance Review", type: "REVIEW", requiredRole: "FINANCE" },
      ]);
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
      <h1 className="text-2xl font-bold">Workflow Templates</h1>

      <form className="card grid gap-3" onSubmit={onCreate}>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Template name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <textarea
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Description (optional)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <select
          className="rounded-md border border-slate-300 px-3 py-2"
          value={organizationId}
          onChange={(event) => setOrganizationId(event.target.value)}
        >
          <option value="">Select organization</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>

        <div className="rounded-lg border border-slate-200 p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Approval Steps</h3>
            <button
              type="button"
              className="rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700"
              onClick={addStep}
            >
              + Add Step
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-wrap items-center gap-2">
                <span className="w-6 text-sm text-slate-500">{index + 1}.</span>
                <input
                  className="min-w-40 flex-1 rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Step name (e.g. Security Approval)"
                  value={step.name}
                  onChange={(event) => updateStep(index, { name: event.target.value })}
                />
                <select
                  className="rounded-md border border-slate-300 px-2 py-2"
                  value={step.type}
                  onChange={(event) => updateStep(index, { type: event.target.value })}
                >
                  {STEP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-slate-300 px-2 py-2"
                  value={step.requiredRole}
                  onChange={(event) => updateStep(index, { requiredRole: event.target.value })}
                  title="Which role can approve this step"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r === "" ? "Anyone" : r}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-md px-2 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  onClick={() => removeStep(index)}
                  aria-label="Remove step"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button className="w-fit rounded-md bg-brand-700 px-4 py-2 font-semibold text-white">Create Template</button>
      </form>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p>Loading workflow templates...</p> : null}
      {!loading && templates.length === 0 ? <p className="text-sm text-slate-600">No templates yet.</p> : null}

      <div className="grid gap-3">
        {templates.map((template) => (
          <article key={template.id} className="card">
            <h2 className="font-semibold">{template.name}</h2>
            <p className="mt-1 text-sm text-slate-600">{template.description || "No description"}</p>
            <ul className="mt-3 list-inside list-decimal text-sm text-slate-700">
              {template.steps.map((step) => (
                <li key={step.id}>
                  {step.name} ({step.type}){step.requiredRole ? ` — approver: ${step.requiredRole}` : ""}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
