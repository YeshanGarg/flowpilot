"use client";

import { useEffect, useState } from "react";
import { apiClient } from "../../lib/api";
import type { Organization } from "../../lib/types";

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadOrganizations() {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.getOrganizations();
      setOrganizations(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");
    try {
      await apiClient.createOrganization(name.trim());
      setName("");
      await loadOrganizations();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    void loadOrganizations();
  }, []);

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Organizations</h1>
      <form className="card grid gap-3 md:grid-cols-[1fr_auto]" onSubmit={onSubmit}>
        <input
          className="rounded-md border border-slate-300 px-3 py-2"
          placeholder="Organization name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="rounded-md bg-brand-700 px-4 py-2 font-semibold text-white" disabled={saving}>
          {saving ? "Creating..." : "Create"}
        </button>
      </form>

      {error ? <p className="rounded-md bg-rose-100 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {loading ? <p>Loading organizations...</p> : null}
      {!loading && organizations.length === 0 ? <p className="text-sm text-slate-600">No organizations yet.</p> : null}

      <div className="grid gap-3">
        {organizations.map((organization) => (
          <article key={organization.id} className="card">
            <h2 className="font-semibold">{organization.name}</h2>
            <p className="mt-1 text-xs text-slate-500">{organization.id}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
