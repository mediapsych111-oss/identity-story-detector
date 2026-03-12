"use client";

import { useState } from "react";
import { AnalysisResult, StoryResult } from "@/lib/stories";

const PLACEHOLDER = `Paste a journal entry, personal reflection, or message about your life here.

Example: "I feel like I'm always chasing success but never quite reaching it. I work harder than most people I know, but somehow other people move ahead faster. I know I have what it takes — I just haven't found the right situation yet."`;

const CHAR_LIMIT = 5000;

const RIGIDITY_LABELS: Record<string, string> = {
  flexible: "Flexible",
  moderate: "Moderate attachment",
  strong: "Strong fusion",
};

const RIGIDITY_COLORS: Record<string, string> = {
  flexible: "text-emerald-400",
  moderate: "text-yellow-400",
  strong: "text-orange-400",
};

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Round 1 followup
  const [reflection, setReflection] = useState("");
  const [followupResult, setFollowupResult] = useState<string | null>(null);
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);

  // Round 2 followup
  const [reflection2, setReflection2] = useState("");
  const [followupResult2, setFollowupResult2] = useState<string | null>(null);
  const [followupLoading2, setFollowupLoading2] = useState(false);
  const [followupError2, setFollowupError2] = useState<string | null>(null);

  // Round 3 followup
  const [showRound3, setShowRound3] = useState(false);
  const [reflection3, setReflection3] = useState("");
  const [followupResult3, setFollowupResult3] = useState<string | null>(null);
  const [followupLoading3, setFollowupLoading3] = useState(false);
  const [followupError3, setFollowupError3] = useState<string | null>(null);

  async function analyze() {
    if (!text.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setReflection("");
    setFollowupResult(null);
    setFollowupError(null);
    setReflection2("");
    setFollowupResult2(null);
    setFollowupError2(null);
    setShowRound3(false);
    setReflection3("");
    setFollowupResult3(null);
    setFollowupError3(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function goDeeper() {
    if (!reflection.trim() || !result || followupLoading) return;
    setFollowupLoading(true);
    setFollowupError(null);
    setFollowupResult(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalText: text, analysis: result, reflection, round: 1 }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFollowupError(data.error || "Something went wrong.");
        return;
      }

      setFollowupResult(data.response);
    } catch {
      setFollowupError("Network error. Please try again.");
    } finally {
      setFollowupLoading(false);
    }
  }

  async function goDeeperRound2() {
    if (!reflection2.trim() || !result || followupLoading2) return;
    setFollowupLoading2(true);
    setFollowupError2(null);
    setFollowupResult2(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: text,
          analysis: result,
          reflection: reflection2,
          round: 2,
          round1Response: followupResult,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFollowupError2(data.error || "Something went wrong.");
        return;
      }

      setFollowupResult2(data.response);
    } catch {
      setFollowupError2("Network error. Please try again.");
    } finally {
      setFollowupLoading2(false);
    }
  }

  async function goDeeperRound3() {
    if (!reflection3.trim() || !result || followupLoading3) return;
    setFollowupLoading3(true);
    setFollowupError3(null);
    setFollowupResult3(null);

    try {
      const res = await fetch("/api/followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: text,
          analysis: result,
          reflection: reflection3,
          round: 3,
          round1Response: followupResult,
          round2Response: followupResult2,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFollowupError3(data.error || "Something went wrong.");
        return;
      }

      setFollowupResult3(data.response);
    } catch {
      setFollowupError3("Network error. Please try again.");
    } finally {
      setFollowupLoading3(false);
    }
  }

  const charCount = text.length;
  const overLimit = charCount > CHAR_LIMIT;

  return (
    <main className="min-h-screen bg-[#0B1A2B] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-semibold tracking-tight">
            Identity Story Detector
          </h1>
          <p className="text-sm text-white/50 mt-0.5">
            Mental Clarity &mdash; by Bryan Odom
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-10 space-y-8">
        {/* Intro */}
        <p className="text-sm text-white/50 leading-relaxed">
          Most people think they&apos;re responding to events. In reality, they&apos;re responding to the story they believe about themselves. Paste something you wrote about your life — a journal entry, a reflection, anything personal.
        </p>

        {/* Input */}
        <section className="space-y-3">
          <label className="block text-sm font-medium text-white/70">
            What&apos;s going on in your life right now?
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/25 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span
              className={`text-xs ${overLimit ? "text-red-400" : "text-white/30"}`}
            >
              {charCount.toLocaleString()} / {CHAR_LIMIT.toLocaleString()}
            </span>
            <button
              onClick={analyze}
              disabled={loading || !text.trim() || overLimit}
              className="px-5 py-2 text-sm font-medium bg-[#2B78A6] hover:bg-[#3589ba] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loading ? "Analyzing..." : "Detect Identity Story"}
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <section className="space-y-4 animate-pulse">
            <div className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-3">
              <div className="h-5 bg-white/10 rounded w-1/3" />
              <div className="h-3 bg-white/10 rounded w-full" />
              <div className="h-3 bg-white/10 rounded w-4/5" />
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-lg p-5 space-y-3"
              >
                <div className="h-3 bg-white/10 rounded w-1/4" />
                <div className="h-3 bg-white/10 rounded w-3/5" />
              </div>
            ))}
          </section>
        )}

        {/* Results */}
        {result && !loading && (
          <section className="space-y-4">
            {result.detected && result.story ? (
              <>
                <StoryReport story={result.story} summary={result.summary} />

                {/* Round 1 followup */}
                <div className="border-t border-white/10 pt-6 space-y-3">
                  <label className="block text-sm font-medium text-white/50">
                    What part of this landed? Write it out — even a sentence.
                  </label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={3}
                    placeholder="Take your time with this..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 leading-relaxed"
                  />
                  {reflection.trim().length > 0 && !followupResult && (
                    <div className="flex justify-end">
                      <button
                        onClick={goDeeper}
                        disabled={followupLoading}
                        className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                      >
                        {followupLoading ? "Going deeper..." : "Go Deeper"}
                      </button>
                    </div>
                  )}

                  {followupError && (
                    <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                      {followupError}
                    </div>
                  )}

                  {followupLoading && (
                    <div className="animate-pulse space-y-2 pt-1">
                      <div className="h-3 bg-white/10 rounded w-full" />
                      <div className="h-3 bg-white/10 rounded w-4/5" />
                      <div className="h-3 bg-white/10 rounded w-3/5" />
                    </div>
                  )}

                  {followupResult && !followupLoading && (
                    <div className="bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4 space-y-1">
                      <span className="text-xs text-white/30 uppercase tracking-wider font-medium block mb-2">
                        Going deeper
                      </span>
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                        {followupResult}
                      </p>
                    </div>
                  )}
                </div>

                {/* Round 2 followup — only shows after round 1 response */}
                {followupResult && !followupLoading && (
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    <label className="block text-sm font-medium text-white/50">
                      What comes up when you sit with that question?
                    </label>
                    <textarea
                      value={reflection2}
                      onChange={(e) => setReflection2(e.target.value)}
                      rows={3}
                      placeholder="Write whatever comes up, even if it's incomplete..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 leading-relaxed"
                    />
                    {reflection2.trim().length > 0 && !followupResult2 && (
                      <div className="flex justify-end">
                        <button
                          onClick={goDeeperRound2}
                          disabled={followupLoading2}
                          className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                        >
                          {followupLoading2 ? "Going deeper..." : "Go Deeper"}
                        </button>
                      </div>
                    )}

                    {followupError2 && (
                      <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                        {followupError2}
                      </div>
                    )}

                    {followupLoading2 && (
                      <div className="animate-pulse space-y-2 pt-1">
                        <div className="h-3 bg-white/10 rounded w-full" />
                        <div className="h-3 bg-white/10 rounded w-4/5" />
                        <div className="h-3 bg-white/10 rounded w-3/5" />
                      </div>
                    )}

                    {followupResult2 && !followupLoading2 && (
                      <div className="bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4 space-y-1">
                        <span className="text-xs text-white/30 uppercase tracking-wider font-medium block mb-2">
                          Going deeper
                        </span>
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                          {followupResult2}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Round 3 — optional, surfaces after round 2 response */}
                {followupResult2 && !followupLoading2 && (
                  <div className="border-t border-white/10 pt-6 space-y-3">
                    {!showRound3 && !followupResult3 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-white/40">Want to keep exploring this?</span>
                        <button
                          onClick={() => setShowRound3(true)}
                          className="px-4 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 border border-white/10 hover:border-white/20 rounded-md transition-colors"
                        >
                          Keep going
                        </button>
                      </div>
                    )}

                    {showRound3 && (
                      <>
                        <label className="block text-sm font-medium text-white/50">
                          What&apos;s still alive in you after reading that?
                        </label>
                        <textarea
                          value={reflection3}
                          onChange={(e) => setReflection3(e.target.value)}
                          rows={3}
                          placeholder="Write whatever comes up..."
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 resize-none focus:outline-none focus:ring-1 focus:ring-white/20 leading-relaxed"
                        />
                        {reflection3.trim().length > 0 && !followupResult3 && (
                          <div className="flex justify-end">
                            <button
                              onClick={goDeeperRound3}
                              disabled={followupLoading3}
                              className="px-5 py-2 text-sm font-medium bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors"
                            >
                              {followupLoading3 ? "Going deeper..." : "Go Deeper"}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {followupError3 && (
                      <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                        {followupError3}
                      </div>
                    )}

                    {followupLoading3 && (
                      <div className="animate-pulse space-y-2 pt-1">
                        <div className="h-3 bg-white/10 rounded w-full" />
                        <div className="h-3 bg-white/10 rounded w-4/5" />
                        <div className="h-3 bg-white/10 rounded w-3/5" />
                      </div>
                    )}

                    {followupResult3 && !followupLoading3 && (
                      <div className="bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4 space-y-1">
                        <span className="text-xs text-white/30 uppercase tracking-wider font-medium block mb-2">
                          Going deeper
                        </span>
                        <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
                          {followupResult3}
                        </p>
                      </div>
                    )}

                    {/* Closing anchor — shows after round 3 response, or after round 2 if user skips round 3 */}
                    {(followupResult3 || (!showRound3 && !followupResult3 && followupResult2)) && !followupLoading3 && (
                      <div className="border border-white/10 rounded-lg px-5 py-4 mt-2">
                        <p className="text-sm text-white/40 leading-relaxed italic">
                          Awareness of the story is the first move. The next is noticing when it&apos;s interpreting something for you in real time — not to fight it, but to pause and ask: is this the story talking, or is this actually true?
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-lg px-5 py-4 text-sm text-white/60 leading-relaxed">
                <span className="text-white/30 uppercase text-xs tracking-wider font-medium block mb-1.5">
                  No clear narrative detected
                </span>
                {result.summary}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function StoryReport({
  story,
  summary,
}: {
  story: StoryResult;
  summary: string;
}) {
  return (
    <div className="space-y-4">
      {/* Identity card */}
      <div className="bg-[#0B3C5D]/60 border border-[#2B78A6]/30 rounded-lg px-5 py-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <span className="text-xs text-[#2B78A6] uppercase tracking-wider font-medium block mb-1">
              Identity Story Detected
            </span>
            <h2 className="text-lg font-semibold text-white leading-tight">
              {story.role}
            </h2>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs text-white/30 block mb-0.5 uppercase tracking-wider font-medium">Rigidity</span>
            <span className={`text-xs font-medium ${RIGIDITY_COLORS[story.rigidity] ?? "text-white/50"}`}>
              {RIGIDITY_LABELS[story.rigidity] ?? story.rigidity}
            </span>
          </div>
        </div>
        {summary && (
          <p className="text-sm text-white/70 leading-relaxed">{summary}</p>
        )}
        {story.storyAge && (
          <p className="text-xs text-white/40 mt-2 italic">{story.storyAge}</p>
        )}
      </div>

      {/* Key excerpt */}
      {story.keyExcerpt && (
        <blockquote className="border-l-2 border-[#2B78A6] pl-4 py-1 text-sm text-white/60 italic leading-relaxed">
          &ldquo;{story.keyExcerpt}&rdquo;
        </blockquote>
      )}

      {/* Story fields */}
      <div className="grid grid-cols-1 gap-3">
        <ReportField label="Narrative theme" value={story.theme} />
        <ReportField label="Emotional driver" value={story.emotionalDriver} />
        <ReportField label="Your role in the story" value={story.heroRole} />
        <ReportField label="Obstacle pattern" value={story.obstacle} />
        <ReportField label="Reinforcement pattern" value={story.reinforcementPattern} />
        <ReportField label="What this story protects" value={story.protectiveFunction} />
      </div>

      {/* Clarity insight */}
      <div className="bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4">
        <span className="text-xs text-white/30 uppercase tracking-wider font-medium block mb-2">
          Clarity insight
        </span>
        <p className="text-sm text-white/80 leading-relaxed">
          {story.clarityInsight}
        </p>
      </div>
    </div>
  );
}

function ReportField({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3">
      <span className="text-xs text-white/30 uppercase tracking-wider font-medium block mb-1">
        {label}
      </span>
      <p className="text-sm text-white/75 leading-relaxed">{value}</p>
    </div>
  );
}
