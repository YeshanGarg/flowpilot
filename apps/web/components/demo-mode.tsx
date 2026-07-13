"use client";

import { useEffect, useState } from "react";
import { apiClient, isDemoMode, setDemoMode } from "../lib/api";

export function DemoModeControl() {
  const [mounted, setMounted] = useState(false);
  const [on, setOn] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOn(isDemoMode());
  }, []);

  async function startDemo() {
    setDemoMode(true);
    window.location.reload();
  }

  async function endDemo() {
    if (!window.confirm("End the demo? This clears all demo data and switches back to real data.")) {
      return;
    }
    setBusy(true);
    try {
      await apiClient.endDemo();
    } catch {
      // Even if the purge fails, still leave demo mode locally.
    } finally {
      setDemoMode(false);
      window.location.reload();
    }
  }

  if (!mounted) return null;

  return on ? (
    <button
      type="button"
      onClick={endDemo}
      disabled={busy}
      className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-60"
      title="Clear demo data and switch to real data"
    >
      {busy ? "Ending..." : "🎬 Demo Mode · End Demo"}
    </button>
  ) : (
    <button
      type="button"
      onClick={startDemo}
      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      title="Enter demo mode — new data is isolated and disposable"
    >
      ▶ Start Demo
    </button>
  );
}

export function DemoModeBanner() {
  const [mounted, setMounted] = useState(false);
  const [on, setOn] = useState(true);

  useEffect(() => {
    setMounted(true);
    setOn(isDemoMode());
  }, []);

  if (!mounted || !on) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-xs font-medium text-amber-800">
      🎬 Demo Mode is ON — data you create here is isolated and will be cleared when you end the demo. Real data is untouched.
    </div>
  );
}
