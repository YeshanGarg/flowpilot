"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/status-badge";
import { apiClient } from "../../lib/api";
import type { User, Workflow } from "../../lib/types";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [actingUserId, setActingUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  async function load() {
    setError("");
    try {
      const [workflowData, userData] = await Promise.all([apiClient.getWorkflows(), apiClient.getUsers()]);
      setWorkflows(workflowData);
      setUsers(userData);
      // Default the acting user to an ADMIN, since only admins can delete.
      setActingUserId((prev) => prev || userData.find((u) => u.role === "ADMIN")?.id || userData[0]?.id || "");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const actingUser = users.find((u) => u.id === actingUserId);
  const isAdmin = actingUser?.role === "ADMIN";

  async function onDelete(workflow: Workflow) {
    if (!actingUserId) return;
    if (!window.confirm(`Delete "${workflow.title}"? This permanently removes the workflow and its history.`)) {
      return;
    }
    setError("");
    setDeletingId(workflow.id);
    try {
      await apiClient.deleteWorkflow(workflow.id, actingUserId);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <Link href="/workflows/create" className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
          Create Workflow
        </Link>
      </div>

      <div className="card flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-slate-600">Acting as</span>
        <select
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={actingUserId}
          onChange={(event) => setActingUserId(event.target.value)}
        >
          <option value="">Select user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role || "EMPLOYEE"})
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-500">
          {isAdmin ? "Admin can delete workflows." : "Only an ADMIN can delete workflows."}
        </span>
      </div>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      {loading ? <p>Loading workflows...</p> : null}
      {!loading && workflows.length === 0 ? <p className="text-sm text-slate-600">No workflows started yet.</p> : null}

      <div className="grid gap-3">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="card">
            <div className="flex items-center justify-between gap-3">
              <Link href={`/workflows/${workflow.id}`} className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="truncate font-semibold hover:text-brand-700">{workflow.title}</h2>
                  <StatusBadge status={workflow.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">Workflow ID: {workflow.id}</p>
              </Link>
              <button
                type="button"
                onClick={() => onDelete(workflow)}
                disabled={!isAdmin || deletingId === workflow.id}
                title={isAdmin ? "Delete workflow" : "Only an ADMIN can delete"}
                className="shrink-0 rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {deletingId === workflow.id ? "Deleting..." : "🗑 Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
