"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../lib/api";
import type { Organization, User, WorkflowTemplate } from "../../../lib/types";

export default function CreateWorkflowPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [workflowTemplateId, setWorkflowTemplateId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [requesterId, setRequesterId] = useState("");
  const [payloadText, setPayloadText] = useState('{"amount": 1200, "reason": "Conference travel"}');

  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [nlText, setNlText] = useState("");
  const [nlLoading, setNlLoading] = useState(false);

  async function aiFill() {
    if (!nlText.trim()) return;
    setNlLoading(true);
    setError("");
    try {
      const result = await apiClient.parseWorkflow({
        text: nlText.trim(),
        templates: templates.map((t) => ({ id: t.id, name: t.name })),
      });
      setTitle(result.title);
      setWorkflowTemplateId(result.workflowTemplateId);
      setPayloadText(JSON.stringify(result.payload, null, 2));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setNlLoading(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [templateData, organizationData, userData] = await Promise.all([
          apiClient.getWorkflowTemplates(),
          apiClient.getOrganizations(),
          apiClient.getUsers(),
        ]);
        setTemplates(templateData);
        setOrganizations(organizationData);
        setUsers(userData);

        if (templateData[0]) setWorkflowTemplateId(templateData[0].id);
        if (organizationData[0]) setOrganizationId(organizationData[0].id);
        if (userData[0]) setRequesterId(userData[0].id);
      } catch (err) {
        setError((err as Error).message);
      }
    }

    void load();
  }, []);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = JSON.parse(payloadText) as Record<string, unknown>;
      const created = await apiClient.createWorkflow({
        title: title.trim(),
        workflowTemplateId,
        organizationId,
        requesterId,
        payload,
      });
      router.push(`/workflows/${created.id}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Create Workflow</h1>

      <div className="card border-2 border-brand-500 bg-brand-50">
        <h2 className="text-lg font-semibold">✨ Describe your request</h2>
        <p className="text-sm text-slate-600">
          Type in plain English and let AI pick the template and fill the form.
        </p>
        <textarea
          className="mt-3 w-full rounded-md border border-slate-300 p-3 text-sm"
          rows={2}
          placeholder="e.g. I need admin access to the production database to investigate an urgent outage"
          value={nlText}
          onChange={(event) => setNlText(event.target.value)}
        />
        <button
          type="button"
          className="mt-2 rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          onClick={aiFill}
          disabled={nlLoading}
        >
          {nlLoading ? "Thinking..." : "✨ AI Fill Form"}
        </button>
      </div>

      <form className="card grid gap-3" onSubmit={onSubmit}>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Workflow title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <select className="rounded-md border border-slate-300 px-3 py-2" value={workflowTemplateId} onChange={(event) => setWorkflowTemplateId(event.target.value)}>
          <option value="">Select template</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>

        <select className="rounded-md border border-slate-300 px-3 py-2" value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}>
          <option value="">Select organization</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>{organization.name}</option>
          ))}
        </select>

        <select className="rounded-md border border-slate-300 px-3 py-2" value={requesterId} onChange={(event) => setRequesterId(event.target.value)}>
          <option value="">Select requester</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
          ))}
        </select>

        <textarea
          className="min-h-36 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
          value={payloadText}
          onChange={(event) => setPayloadText(event.target.value)}
          placeholder="JSON payload"
          required
        />

        <button className="w-fit rounded-md bg-brand-700 px-4 py-2 font-semibold text-white" disabled={saving}>
          {saving ? "Creating..." : "Create Workflow"}
        </button>
      </form>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
