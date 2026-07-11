import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/organizations", label: "Organizations" },
  { href: "/workflow-templates", label: "Workflow Templates" },
  { href: "/workflows", label: "Workflows" },
  { href: "/workflows/create", label: "Create Workflow" },
  { href: "/approvals", label: "Approvals" },
];

export function Nav() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="container-shell flex flex-wrap items-center gap-2 py-4">
        <div className="mr-4 rounded-lg bg-brand-700 px-3 py-1.5 text-sm font-bold text-white">FlowPilot</div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
