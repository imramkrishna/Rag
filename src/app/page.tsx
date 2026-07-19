import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(79,70,229,0.18),transparent_32%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/60 bg-white/70 px-5 py-3 shadow-sm backdrop-blur">
          <div>
            <p className="text-sm font-semibold tracking-[0.2em] text-indigo-600 uppercase">
              RAG Vault
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-slate-700 transition-colors hover:bg-slate-100"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-900 px-4 py-2 text-white transition-colors hover:bg-slate-700"
            >
              Open dashboard
            </Link>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              Upload files with aliases and store them in S3
            </span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              A simple home for your uploaded files and file aliases.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Use the dashboard to upload a file, attach an alias, and send both values to the backend in one request. The file lands in S3 and the alias can be stored alongside it for later lookup.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 hover:bg-indigo-700"
              >
                Go to dashboard
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Create account
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">S3 upload</p>
                <p className="mt-1 text-sm text-slate-600">Files are sent straight to your bucket.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Alias support</p>
                <p className="mt-1 text-sm text-slate-600">Capture a friendly name with the upload.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-slate-900">Backend ready</p>
                <p className="mt-1 text-sm text-slate-600">Read the alias from multipart form data.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 translate-x-6 translate-y-6 rounded-[2rem] bg-indigo-200/50 blur-3xl" />
            <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-slate-100 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Upload preview</p>
                  <p className="text-lg font-semibold">Multipart request payload</p>
                </div>
                <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Live
                </div>
              </div>

              <div className="mt-5 space-y-4 text-sm">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-slate-400">Field</p>
                  <p className="mt-1 font-medium text-white">file</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-slate-400">Field</p>
                  <p className="mt-1 font-medium text-white">alias</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-slate-400">Backend read</p>
                  <p className="mt-1 font-medium text-white">formData.get(&quot;alias&quot;)</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
