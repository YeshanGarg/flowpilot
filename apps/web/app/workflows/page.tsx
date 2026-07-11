"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/status-badge";
import { apiClient } from "../../lib/api";
import type { Workflow } from "../../lib/types";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient.getWorkflows();
        setWorkflows(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Link href="/workflows/create" className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Create Workflow
        </Link>
      </div>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p>Loading workflows...</p> : null}
      {!loading && workflows.length === 0 ? <p className="text-sm text-slate-600">No workflows started yet.</p> : null}

      <div className="grid gap-3">
        {workflows.map((workflow) => (
          <Link key={workflow.id} href={`/workflows/${workflow.id}`} className="card block transition hover:shadow">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold">{workflow.title}</h2>
              <StatusBadge status={workflow.status} />
            </div>
            <p className="mt-2 text-xs text-slate-500">Workflow ID: {workflow.id}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
