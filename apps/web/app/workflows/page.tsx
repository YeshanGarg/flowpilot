"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/status-badge";
import { apiClient, getAdminToken, setAdminToken, clearAdminToken } from "../../lib/api";
import type { Workflow } from "../../lib/types";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function load() {
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

  useEffect(() => {
    setIsAdmin(Boolean(getAdminToken()));
    void load();
  }, []);

  async function onLogin(event: React.FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const { token } = await apiClient.adminLogin(email.trim(), password);
      setAdminToken(token);
      setIsAdmin(true);
      setShowLogin(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      setLoginError((err as Error).message);
    } finally {
      setLoggingIn(false);
    }
  }

  function onLogout() {
    clearAdminToken();
    setIsAdmin(false);
  }

  async function onDelete(workflow: Workflow) {
    if (!window.confirm(`Delete "${workflow.title}"? This permanently removes the workflow and its history.`)) {
      return;
    }
    setError("");
    setDeletingId(workflow.id);
    try {
      await apiClient.deleteWorkflow(workflow.id);
      await load();
    } catch (err) {
      const message = (err as Error).message;
      // Session expired / invalid → drop back to logged-out state.
      if (/admin|session|auth/i.test(message)) {
        clearAdminToken();
        setIsAdmin(false);
      }
      setError(message);
    } finally {
      setDeletingId("");
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Workflows</h1>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              🔓 Admin · Log out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogin((v) => !v)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              🔒 Admin Login
            </button>
          )}
          <Link href="/workflows/create" className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white">
            Create Workflow
          </Link>
        </div>
      </div>

      {showLogin && !isAdmin ? (
        <form className="card grid max-w-md gap-3" onSubmit={onLogin}>
          <h2 className="text-sm font-semibold">Admin Login</h2>
          <p className="text-xs text-slate-500">Only an administrator can delete workflows.</p>
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            type="email"
            placeholder="admin@flowpilot.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {loginError ? <p className="text-sm text-rose-600">{loginError}</p> : null}
          <button
            className="w-fit rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            disabled={loggingIn}
          >
            {loggingIn ? "Signing in..." : "Sign in"}
          </button>
        </form>
      ) : null}

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
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => onDelete(workflow)}
                  disabled={deletingId === workflow.id}
                  title="Delete workflow"
                  className="shrink-0 rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                >
                  {deletingId === workflow.id ? "Deleting..." : "🗑 Delete"}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
