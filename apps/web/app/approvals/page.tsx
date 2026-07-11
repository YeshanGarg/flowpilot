"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import type { User, Workflow } from "../../lib/types";

export default function ApprovalsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [actedByUserId, setActedByUserId] = useState("");
  const [comments, setComments] = useState("");
  const [error, setError] = useState("");

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
        {workflows.map((workflow) => (
          <article key={workflow.id} className="card">
            <h2 className="font-semibold">{workflow.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{workflow.id}</p>
            <div className="mt-3 flex gap-2">
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
        ))}
      </div>
    </section>
  );
}
