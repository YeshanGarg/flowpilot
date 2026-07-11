type Status = "PENDING" | "RUNNING" | "COMPLETED" | "REJECTED" | "ACTIVE" | "APPROVED";

const styles: Record<Status, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  RUNNING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-rose-100 text-rose-700",
  ACTIVE: "bg-amber-100 text-amber-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ status }: { status: Status | string }) {
  const safe = (status as Status) in styles ? (status as Status) : "PENDING";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[safe]}`}>
      {status}
    </span>
  );
}
