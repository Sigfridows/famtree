import { HealthStatus } from "@/components/health-status";

export default function Home() {
  return (
    <main className="min-h-screen bg-emerald-950 px-6 py-16 text-emerald-50">
      <section className="mx-auto flex max-w-4xl flex-col gap-10">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/70 px-4 py-2 text-sm font-medium text-emerald-100">
          <span aria-hidden="true">🌳</span>
          Entorno de desarrollo
        </div>

        <div className="max-w-3xl space-y-5">
          <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">FamTree</h1>
          <p className="text-lg leading-8 text-emerald-100 sm:text-xl">
            La base técnica está lista para que frontend, backend y QA construyan las historias de
            usuario como vertical slices.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Frontend", "Next.js + TypeScript"],
            ["Backend", "FastAPI + SQLAlchemy"],
            ["Datos", "PostgreSQL + Alembic"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-emerald-800 bg-emerald-900/60 p-5">
              <p className="text-sm text-emerald-300">{label}</p>
              <p className="mt-2 font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        <HealthStatus />
      </section>
    </main>
  );
}
