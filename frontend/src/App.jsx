import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import {
  Sparkles,
  UploadCloud,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Linkedin,
  Github,
  Link2,
  ArrowUpRight,
} from "lucide-react";

import PillNav from "@/components/ui/PillNav";
import { AiRewriteButton } from "@/components/ui/AiRewriteButton";
import { AnalyzeButton } from "@/components/ui/AnalyzeButton";
const Cloudscape = lazy(() => import("@/components/ui/Cloudscape"));

/* ---------------- Component ---------------- */

export default function App() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [jd, setJd] = useState(
    "We're hiring a Senior Frontend Engineer with strong React/TypeScript skills. Experience with GraphQL, AWS, Kubernetes, and building performant dashboards is a plus.",
  );
  const [dragOver, setDragOver] = useState(false);
  
  // Backend State
  const [score, setScore] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [metricsDetected, setMetricsDetected] = useState(0);
  const [MATCHED_SKILLS, setMatchedSkills] = useState([]);
  const [MISSING_SKILLS, setMissingSkills] = useState([]);
  const [STRUCTURE_CHECKS, setStructureChecks] = useState([]);
  const [CONTACT_CHECKS, setContactChecks] = useState([]);
  const [bullets, setBullets] = useState([]);

  const fileInput = useRef(null);
  const [iridescenceMounted, setIridescenceMounted] = useState(false);
  useEffect(() => setIridescenceMounted(true), []);

  const runAnalyze = async () => {
    if (!file || !jd.trim()) {
      alert("Please upload a resume and paste a job description.");
      return;
    }
    
    setAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jd);

      const res = await fetch("http://127.0.0.1:8000/internal/v1/extract-and-score", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis failed");

      const data = await res.json();
      
      setScore(data.score || 0);
      setSuggestions(data.suggestions || []);
      setMetricsDetected(data.metrics_detected || 0);
      setMatchedSkills(data.matched_skills || []);
      setMissingSkills(data.missing_skills || []);
      
      const sc = data.structure_check || {};
      setStructureChecks([
        { label: "Word Count", value: `${sc.word_count || 0} words`, ok: sc.word_count >= 300 && sc.word_count <= 800 },
        { label: "Education Section", value: sc.has_education ? "Detected" : "Not found", ok: sc.has_education },
        { label: "Experience Section", value: sc.has_experience ? "Detected" : "Not found", ok: sc.has_experience },
        { label: "Skills Section", value: sc.has_skills ? "Detected" : "Not found", ok: sc.has_skills },
        { label: "Projects Section", value: sc.has_projects ? "Detected" : "Not found", ok: sc.has_projects, warn: sc.has_projects ? undefined : "Add 2–3 projects to boost your score." },
      ]);

      const fc = data.formatting_check || {};
      setContactChecks([
        { label: "Email", value: fc.has_email ? "Detected" : "Not found", ok: fc.has_email, icon: Mail },
        { label: "Phone", value: fc.has_phone ? "Detected" : "Not found", ok: fc.has_phone, icon: Phone },
        { label: "LinkedIn", value: fc.has_linkedin ? "Detected" : "Not found", ok: fc.has_linkedin, icon: Linkedin },
        { label: "GitHub", value: fc.has_github ? "Detected" : "Not found", ok: fc.has_github, icon: Github },
        { label: "Project Repo Links", value: `${fc.repo_link_count || 0} links`, ok: fc.repo_link_count > 0, icon: Link2 },
      ]);

      const wb = data.weak_bullets || [];
      setBullets(wb.map((b, i) => ({ id: i + 1, weak: b, fixed: null, loading: false })));
      
      setAnalyzed(true);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Error connecting to backend API.");
    } finally {
      setAnalyzing(false);
    }
  };

  const onFilePicked = (f) => {
    if (f) {
      setFile(f);
      setFileName(f.name);
    }
  };

  const fixBullet = async (id) => {
    const bullet = bullets.find(b => b.id === id);
    if (!bullet) return;

    setBullets((prev) => prev.map((b) => (b.id === id ? { ...b, loading: true } : b)));
    
    try {
      const res = await fetch("http://127.0.0.1:8000/internal/v1/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: bullet.weak })
      });
      if (!res.ok) throw new Error("Rewrite failed");
      
      const data = await res.json();
      setBullets((prev) => prev.map((b) => (b.id === id ? { ...b, loading: false, fixed: data.rewritten_bullet } : b)));
    } catch (err) {
      console.error(err);
      setBullets((prev) => prev.map((b) => (b.id === id ? { ...b, loading: false } : b)));
      alert("Error rewriting bullet point.");
    }
  };

  const ringCircumference = 2 * Math.PI * 70;
  const ringOffset = useMemo(
    () => ringCircumference - (score / 100) * ringCircumference,
    [score, ringCircumference],
  );

  return (
    <div className="relative min-h-screen text-ink selection:bg-emerald-400/20 selection:text-emerald-100">
      {iridescenceMounted && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <Suspense fallback={null}>
            <Cloudscape colorBottom="#0b1220" colorMid="#3b4a7a" colorTop="#e6ecff" speed={0.6} />
          </Suspense>
        </div>
      )}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 bg-slate-950/30" />
      <div className="relative z-10">
        <PillNav
          items={[
            { label: "Home", href: "#" },
            { label: "Features", href: "#features" },
            { label: "Bullet Fixer", href: "#bullet-fixer" },
            { label: "Docs", href: "#docs" },
          ]}
          activeHref="#"
          baseColor="rgba(8,9,11,0.92)"
          pillColor="rgba(255,255,255,0.08)"
          hoveredPillTextColor="#ffffff"
          pillTextColor="#ffffff"
          className="md:left-1/2 md:-translate-x-1/2"
        />

        {/* Hero / Input */}
        <section className="mx-auto max-w-7xl px-3 pt-24 pb-6 sm:px-4 sm:pt-28 md:pt-32 lg:px-6 lg:pt-36 sm:pb-8 lg:pb-10">
          <div className="mb-6 sm:mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cream-border bg-cream px-2.5 py-1 text-[11px] text-subtle sm:mb-5">
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              v2.1 · Bullet rewriter now powered by Groq
            </div>
            <h1 className="max-w-3xl text-[32px] font-medium leading-[1.05] tracking-[-0.03em] text-ink sm:text-[44px] lg:text-[56px] drop-shadow-sm">
              Beat the ATS.
              <br />
              <span className="text-subtle">Land the interview.</span>
            </h1>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-subtle drop-shadow-sm sm:mt-4">
              Drop your resume, paste a job description, and get an instant ATS score with AI-rewritten bullets — in seconds.
            </p>
          </div>

          <div className="grid gap-2 sm:gap-3 lg:grid-cols-5">
            {/* Upload */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); onFilePicked(e.dataTransfer.files?.[0]); }}
              onClick={() => fileInput.current?.click()}
              className={`group relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all sm:p-6 lg:col-span-2 ${
                dragOver
                  ? "border-emerald-400/40 bg-emerald-500/15 shadow-[0_0_0_4px_rgba(16,185,129,0.08)]"
                  : "border-cream-border bg-cream backdrop-blur-xl hover:bg-cream/80"
              }`}
            >
              <input ref={fileInput} type="file" accept=".pdf" className="hidden" onChange={(e) => onFilePicked(e.target.files?.[0])} />
              <div className="flex items-center justify-between">
                <div className="text-[20px] font-medium tracking-wider text-subtle uppercase">Resume</div>
                <UploadCloud className="h-8 w-8 text-subtle transition-colors group-hover:text-ink" />
              </div>

              <div className="mt-14 mb-2">
                <p className="text-[20px] font-medium text-ink">Drop your PDF here</p>
                <p className="mt-1 text-[15px] text-subtle">or click to browse — max 10 MB</p>
              </div>

              {fileName && (
                <div className="mt-6 flex items-center justify-between rounded-lg border border-cream-border bg-white/10 px-3 py-2 shadow-sm">
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span className="truncate text-[13px] text-ink">{fileName}</span>
                  </div>
                  <span className="text-[11px] text-subtle">218 KB</span>
                </div>
              )}
            </div>

            {/* JD */}
            <div className="rounded-xl border border-cream-border bg-cream backdrop-blur-xl p-4 sm:p-6 lg:col-span-3">
              <div className="flex items-center justify-between">
                <div className="text-[15px] font-medium tracking-wider text-subtle uppercase">Job description</div>
                <span className="text-[15px] text-subtle">{jd.length} chars</span>
              </div>
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                rows={7}
                placeholder="Paste the job description here…"
                className="mt-4 w-full resize-none bg-transparent text-[14px] leading-relaxed text-ink placeholder:text-subtle focus:outline-none"
              />
              <div className="mt-2 flex items-center justify-between border-t border-cream-border pt-3 text-[15px] text-subtle">
                <span>Tip: paste the full listing for best matching</span>
                <AnalyzeButton onClick={runAnalyze} disabled={analyzing} loading={analyzing}>
                  {analyzing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Analyzing
                    </>
                  ) : (
                    <>
                      Analyze
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </AnalyzeButton>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        {analyzed && (
          <section id="results" className="mx-auto max-w-7xl px-3 pb-12 sm:px-4 lg:px-6 sm:pb-24 animate-fade-in">
            <div className="mb-8 flex items-center gap-3">
              <div className="text-[11px] font-medium tracking-wider text-subtle uppercase">Results</div>
              <div className="h-px flex-1 bg-white/[0.12]" />
              <div className="text-[11px] text-subtle">Just now</div>
            </div>

            <div className="grid gap-2 sm:gap-3 lg:grid-cols-5">
              <div className="relative overflow-hidden rounded-xl border border-cream-border bg-cream backdrop-blur-xl p-4 sm:p-6 lg:col-span-2">
                <div className="text-[11px] font-medium tracking-wider text-subtle uppercase">ATS Score</div>
                <div className="mt-3 flex items-center gap-4 sm:mt-4 sm:gap-5">
                  <div className="relative h-20 w-20 shrink-0 sm:h-28 sm:w-28">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                      <circle
                        cx="80" cy="80" r="70" fill="none"
                        stroke="#34d399" strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-[22px] font-semibold tracking-tight tabular-nums text-ink sm:text-3xl">{score}</div>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-ink">Good</div>
                    <div className="mt-1 text-[12px] leading-relaxed text-subtle">
                      Passes most ATS parsers. Close 3 gaps to reach the 90s.
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-xl border border-amber-tint-border bg-amber-tint p-5 sm:p-7 shadow-md lg:col-span-3">
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-amber-400/25 bg-amber-500/15 text-amber-300">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[18px] font-medium text-ink">
                    {suggestions.length > 0 ? `${suggestions.length} high-priority action items` : 'Looking good!'}
                  </p>
                  <ul className="mt-3 space-y-2 text-[15px] list-disc ml-5 text-subtle">
                    {suggestions.length > 0 ? (
                      suggestions.map((s, i) => <li key={i}>{s}</li>)
                    ) : (
                      <li>No major issues detected. Great job!</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bento grid */}
            <div className="mt-2 grid gap-2 sm:mt-3 sm:gap-3 md:grid-cols-2">
              <BentoCard title="Technical Match" hint={`${MATCHED_SKILLS.length} / ${MATCHED_SKILLS.length + MISSING_SKILLS.length}`} tint="blue">
                <div>
                  <p className="mb-2 text-[11px] tracking-wider text-subtle uppercase">Matched</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MATCHED_SKILLS.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md border border-emerald-400/25 bg-emerald-500/15 px-2 py-1 text-[12px] text-ink">
                        <span className="h-1 w-1 rounded-full bg-emerald-400" />
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-5">
                  <p className="mb-2 text-[11px] tracking-wider text-subtle uppercase">Missing</p>
                  <div className="flex flex-wrap gap-1.5">
                    {MISSING_SKILLS.map((s) => (
                      <span key={s} className="inline-flex items-center gap-1 rounded-md border border-cream-border bg-white/5 px-2 py-1 text-[12px] text-subtle line-through decoration-white/30">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </BentoCard>

              <BentoCard title="Proof of Impact" hint={`${Math.min(Math.round((metricsDetected / 5) * 100), 100)}%`} tint="amber">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tracking-tight tabular-nums text-ink">{metricsDetected}</span>
                  <span className="text-[13px] text-subtle">/ 5 quantified bullets</span>
                </div>
                <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400" style={{ width: `${Math.min((metricsDetected / 5) * 100, 100)}%` }} />
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-8 flex-1 rounded ${i <= metricsDetected ? "bg-emerald-400/80" : "bg-white/10"}`} />
                  ))}
                </div>
                <p className="mt-4 text-[13px] leading-relaxed text-subtle">
                  {metricsDetected >= 5 ? "Great job quantifying your impact!" : `Add numbers or dollar amounts to ${5 - metricsDetected} more bullets to enter the top tier.`}
                </p>
              </BentoCard>

              <BentoCard title="ATS Structure" hint={`${STRUCTURE_CHECKS.filter(c => c.ok).length} / ${STRUCTURE_CHECKS.length}`} tint="mint">
                <ul className="divide-y divide-cream-border">
                  {STRUCTURE_CHECKS.map((c) => (
                    <li key={c.label} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                      <div className="flex min-w-0 items-start gap-2.5">
                        {c.ok ? (
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-400" />
                        )}
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium text-ink">{c.label}</p>
                          {c.warn && <p className="mt-0.5 text-[12px] text-subtle">{c.warn}</p>}
                        </div>
                      </div>
                      <span className="shrink-0 text-[12px] tabular-nums text-subtle">{c.value}</span>
                    </li>
                  ))}
                </ul>
              </BentoCard>

              <BentoCard title="Contact & Links" hint={`${CONTACT_CHECKS.filter(c => c.ok).length} / ${CONTACT_CHECKS.length}`} tint="violet">
                <ul className="divide-y divide-cream-border">
                  {CONTACT_CHECKS.map((c) => {
                    const Icon = c.icon;
                    return (
                      <li key={c.label} className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-accent-violet" />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-ink">{c.label}</p>
                            <p className="truncate text-[12px] text-subtle">{c.value}</p>
                          </div>
                        </div>
                        {c.ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </BentoCard>
            </div>

            {/* Smart Bullet Fixer */}
            <div id="bullet-fixer" className="mt-2 rounded-xl border border-ai-tint-border bg-ai-tint backdrop-blur-xl shadow-sm sm:mt-3">
              <div className="flex items-start justify-between gap-4 border-b border-ai-tint-border px-4 py-4 sm:px-6 sm:py-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-accent-violet" />
                    <h3 className="text-[15px] font-medium tracking-tight text-ink">Smart Bullet Fixer</h3>
                  </div>
                  <p className="mt-1 text-[13px] text-subtle">
                    Rewrite weak bullets into quantified, recruiter-ready achievements.
                  </p>
                </div>
                <div className="hidden shrink-0 items-center gap-1.5 rounded-md border border-ai-tint-border bg-white/5 px-2 py-1 text-[11px] text-subtle md:flex">
                  <span className="tabular-nums text-ink">{bullets.filter((b) => b.fixed).length}</span>
                  <span className="text-subtle">/</span>
                  <span className="tabular-nums text-subtle">{bullets.length}</span>
                  <span className="text-subtle">rewritten</span>
                </div>
              </div>

              <ul className="divide-y divide-cream-border">
                {bullets.map((b, i) => (
                  <li key={b.id} className="px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex min-w-0 items-start gap-3 md:max-w-2xl">
                        <span className="mt-0.5 text-[11px] tabular-nums text-subtle">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-[14px] leading-relaxed text-subtle">{b.weak}</p>
                      </div>
                      {!b.fixed && (
                        <AiRewriteButton onClick={() => fixBullet(b.id)} disabled={b.loading} loading={b.loading} />
                      )}
                    </div>

                    {b.loading && !b.fixed && (
                      <div className="mt-4 ml-8 space-y-2">
                        <div className="h-2 w-11/12 animate-pulse rounded-full bg-accent-violet/25" />
                        <div className="h-2 w-8/12 animate-pulse rounded-full bg-accent-violet/25" />
                      </div>
                    )}

                    {b.fixed && (
                      <div className="mt-4 ml-8 rounded-lg border-l-2 border-accent-violet/60 bg-accent-violet/10 px-4 py-3">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium tracking-wider text-ink uppercase">
                          <Sparkles className="h-3 w-3 text-accent-violet" />
                          AI Suggestion
                        </div>
                        <p className="text-[14px] leading-relaxed text-ink">{b.fixed}</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <footer className="mt-8 flex flex-col gap-1 border-t border-white/10 pt-4 text-[12px] text-subtle sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:pt-6">
              <span>ResumeForge AI</span>
              <span className="tabular-nums">v2.1.0</span>
            </footer>
          </section>
        )}
      </div>
    </div>
  );
}

/* ---------------- Bits ---------------- */

function BentoCard({
  title,
  hint,
  tint,
  children,
}) {
  const tintClasses = {
    blue: "border-blue-tint-border bg-blue-tint hover:bg-blue-tint/80",
    amber: "border-amber-tint-border bg-amber-tint hover:bg-amber-tint/80",
    mint: "border-mint-tint-border bg-mint-tint hover:bg-mint-tint/80",
    violet: "border-violet-tint-border bg-violet-tint hover:bg-violet-tint/80",
  };

  return (
    <div className={`rounded-xl backdrop-blur-xl p-4 sm:p-5 shadow-sm transition-all ${tintClasses[tint]}`}>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[13px] font-medium text-ink">{title}</h4>
        {hint && <span className="text-[11px] tabular-nums text-subtle">{hint}</span>}
      </div>
      {children}
    </div>
  );
}
