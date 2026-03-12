import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { FOLLOWUP_ROUND1_SYSTEM_PROMPT, FOLLOWUP_ROUND2_SYSTEM_PROMPT, FOLLOWUP_ROUND3_SYSTEM_PROMPT, AnalysisResult } from "@/lib/stories";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { originalText, analysis, reflection, round = 1, round1Response, round2Response } = await req.json() as {
      originalText: string;
      analysis: AnalysisResult;
      reflection: string;
      round?: 1 | 2 | 3;
      round1Response?: string;
      round2Response?: string;
    };

    if (!reflection || typeof reflection !== "string" || reflection.trim().length === 0) {
      return NextResponse.json({ error: "No reflection provided." }, { status: 400 });
    }

    const s = analysis.story;
    const storySummary = s
      ? `Role: ${s.role}\nTheme: ${s.theme}\nEmotional driver: ${s.emotionalDriver}\nProtective function: ${s.protectiveFunction}\nKey excerpt: "${s.keyExcerpt}"\nClarity insight: ${s.clarityInsight}`
      : "No clear identity narrative detected.";

    let userMessage: string;
    let systemPrompt: string;

    if (round === 1) {
      systemPrompt = FOLLOWUP_ROUND1_SYSTEM_PROMPT;
      userMessage = `ORIGINAL TEXT:
"${originalText}"

IDENTITY STORY DETECTED:
${storySummary}

OVERALL PATTERN: ${analysis.summary}

WHAT THE PERSON SAID RESONATED:
"${reflection}"`;
    } else if (round === 2) {
      systemPrompt = FOLLOWUP_ROUND2_SYSTEM_PROMPT;
      userMessage = `ORIGINAL TEXT:
"${originalText}"

IDENTITY STORY DETECTED:
${storySummary}

FIRST GOING DEEPER EXCHANGE:
Response: "${round1Response}"

PERSON'S REPLY:
"${reflection}"`;
    } else {
      systemPrompt = FOLLOWUP_ROUND3_SYSTEM_PROMPT;
      userMessage = `ORIGINAL TEXT:
"${originalText}"

IDENTITY STORY DETECTED:
${storySummary}

FIRST GOING DEEPER EXCHANGE:
Response: "${round1Response}"

SECOND GOING DEEPER EXCHANGE:
Response: "${round2Response}"

PERSON'S REPLY:
"${reflection}"`;
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const raw = message.content[0];
    if (raw.type !== "text") {
      throw new Error("Unexpected response type from Claude.");
    }

    return NextResponse.json({ response: raw.text });
  } catch (err) {
    console.error("[followup] error:", err);
    return NextResponse.json(
      { error: "Follow-up failed. Please try again." },
      { status: 500 }
    );
  }
}
