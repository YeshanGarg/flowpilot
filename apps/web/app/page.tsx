import Link from "next/link";

const cards = [
  { href: "/organizations", title: "Organizations", description: "Create and browse organizations" },
  { href: "/workflow-templates", title: "Workflow Templates", description: "Reusable process definitions" },
  { href: "/workflows", title: "Workflows", description: "Track live workflow instances" },
  { href: "/approvals", title: "Approvals", description: "Approve or reject active steps" },
];

export default function DashboardPage() {
  return (
    <section className="space-y-5">
      <div className="card bg-gradient-to-r from-brand-900 to-brand-700 text-white">
        <h1 className="text-2xl font-bold md:text-3xl">FlowPilot Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm text-emerald-100 md:text-base">
          Create workflow templates, start workflows, and drive approvals through a single workflow engine.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="card transition hover:-translate-y-0.5 hover:shadow">
            <h2 className="text-lg font-semibold">{card.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
