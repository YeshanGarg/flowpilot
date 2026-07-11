"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import { isOverdue } from "../lib/format";
import type { Workflow } from "../lib/types";

const SAMPLE_REQUESTS: Array<{ title: string; payload: Record<string, unknown> }> = [
  { title: "Production DB Admin Access", payload: { resource: "prod-db", access: "admin", amount: 5000, reason: "urgent incident" } },
  { title: "New Laptop Request", payload: { item: "MacBook Pro", amount: 1500, reason: "device refresh" } },
  { title: "Office Supplies", payload: { item: "notebooks", amount: 45, reason: "team stationery" } },
  { title: "Conference Travel Reimbursement", payload: { amount: 1200, reason: "AMD Dev Summit" } },
];

function StatCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="card">
      <p className="text-sm text-slate-600">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await apiClient.getWorkflows();
      setWorkflows(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function loadDemoData() {
    setSeeding(true);
    setError("");
    try {
      const [orgs, templates, users] = await Promise.all([
        apiClient.getOrganizations(),
        apiClient.getWorkflowTemplates(),
        apiClient.getUsers(),
      ]);
      const org = orgs[0];
      const template = templates[0];
      const requester = users[0];
      if (!org || !template || !requester) {
        throw new Error("Seed an organization, template, and user first.");
      }
      for (const sample of SAMPLE_REQUESTS) {
        await apiClient.createWorkflow({
          title: sample.title,
          workflowTemplateId: template.id,
          organizationId: org.id,
          requesterId: requester.id,
          payload: sample.payload,
        });
      }
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSeeding(false);
    }
  }

  const total = workflows.length;
  const running = workflows.filter((w) => w.status === "RUNNING").length;
  const completed = workflows.filter((w) => w.status === "COMPLETED").length;
  const rejected = workflows.filter((w) => w.status === "REJECTED").length;
  const overdue = workflows.filter((w) => w.status === "RUNNING" && isOverdue(w.createdAt)).length;
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <section className="space-y-5">
      <div className="card bg-gradient-to-r from-brand-900 to-brand-700 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">FlowPilot Dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm text-emerald-100 md:text-base">
              AI-assisted workflow approvals on AMD Developer Cloud. Create requests from plain
              English, triage risk, escalate by policy, and stay on top of every approval.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-100">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Live{lastUpdated ? ` · updated ${lastUpdated.toLocaleTimeString()}` : ""}
          </div>
        </div>
        <button
          className="mt-4 rounded-md bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 hover:bg-white/25 disabled:opacity-60"
          onClick={loadDemoData}
          disabled={seeding}
        >
          {seeding ? "Loading demo data..." : "⚡ Load Demo Data"}
        </button>
      </div>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Workflows" value={total} tone="" />
        <StatCard label="Pending" value={running} tone="text-blue-600" />
        <StatCard label="Completed" value={completed} tone="text-emerald-600" />
        <StatCard label="Rejected" value={rejected} tone="text-rose-600" />
        <StatCard label="Overdue" value={overdue} tone="text-orange-600" />
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Status Breakdown</h2>
        <div className="mt-4 space-y-3">
          {[
            { label: "Pending", value: running, color: "bg-blue-500" },
            { label: "Completed", value: completed, color: "bg-emerald-500" },
            { label: "Rejected", value: rejected, color: "bg-rose-500" },
          ].map((row) => (
            <div key={row.label}>
              <div className="flex justify-between text-sm">
                <span>{row.label}</span>
                <span className="text-slate-600">{row.value} ({pct(row.value)}%)</span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full ${row.color}`} style={{ width: `${pct(row.value)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { href: "/workflows/create", title: "Create Workflow", description: "Describe a request in plain English — AI fills the form." },
          { href: "/approvals", title: "Approvals", description: "AI recommendations, SLA timers, and one-click actions." },
          { href: "/workflow-templates", title: "Workflow Templates", description: "Reusable process definitions." },
          { href: "/workflows", title: "All Workflows", description: "Track every live workflow instance." },
        ].map((card) => (
          <Link key={card.href} href={card.href} className="card transition hover:-translate-y-0.5 hover:shadow">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
