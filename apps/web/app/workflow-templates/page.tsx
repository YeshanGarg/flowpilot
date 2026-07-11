"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../../lib/api";
import type { Organization, WorkflowTemplate } from "../../lib/types";

export default function WorkflowTemplatesPage() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const stepDefaults = useMemo(
    () => [
      { order: 1, name: "Manager Approval", type: "APPROVAL" },
      { order: 2, name: "Finance Review", type: "REVIEW" },
    ],
    []
  );

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

    setError("");
    try {
      await apiClient.createWorkflowTemplate({
        name: name.trim(),
        description: description.trim() || null,
        organizationId,
        steps: stepDefaults,
      });
      setName("");
      setDescription("");
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
                <li key={step.id}>{step.name} ({step.type})</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
