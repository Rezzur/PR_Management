import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const OPENROUTER_CHAT_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_EMBEDDINGS_URL = "https://openrouter.ai/api/v1/embeddings";
const CHAT_MODEL = "google/gemini-2.0-flash-001";
const DEFAULT_EMBEDDING_MODEL = "openai/text-embedding-3-small";

function missingEnvKeys(keys: string[]) {
  return keys.filter((k) => !process.env[k] || process.env[k]?.trim() === "");
}

function buildRagQuery(brand: string, occasion: string, audience: string) {
  return `Бренд: ${brand}\nИнфоповод: ${occasion}\nАудитория: ${audience}`;
}

async function fetchEmbeddingVector(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model =
    process.env.OPENROUTER_EMBEDDING_MODEL?.trim() || DEFAULT_EMBEDDING_MODEL;

  let res: Response;
  try {
    res = await fetch(OPENROUTER_EMBEDDINGS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });
  } catch {
    return null;
  }

  const raw = await res.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!res.ok) {
    console.warn("[OpenRouter embeddings] HTTP", res.status, parsed);
    return null;
  }

  const json = parsed as {
    data?: Array<{ embedding?: number[] }>;
    error?: { message?: string };
  };

  if (json.error?.message) {
    console.warn("[OpenRouter embeddings]", json.error.message);
    return null;
  }

  const vec = json.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length === 0) {
    console.warn("[OpenRouter embeddings] пустой embedding");
    return null;
  }

  return vec;
}

type MatchRow = { id: string; content: string; metadata: unknown; similarity: number };

async function retrieveKnowledgeContext(
  supabase: ReturnType<typeof createClient>,
  queryEmbedding: number[],
  limit: number,
): Promise<{ text: string; chunkCount: number }> {
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: queryEmbedding,
    match_count: limit,
  });

  if (error) {
    console.warn("[Supabase match_documents]", error.message);
    return { text: "", chunkCount: 0 };
  }

  const rows = (data ?? []) as MatchRow[];
  if (rows.length === 0) return { text: "", chunkCount: 0 };

  const parts = rows
    .map((r) => (typeof r.content === "string" ? r.content.trim() : ""))
    .filter(Boolean);

  return {
    text: parts.join("\n\n---\n\n"),
    chunkCount: parts.length,
  };
}

export async function POST(req: Request) {
  const missing = missingEnvKeys(["OPENROUTER_API_KEY"]);
  if (missing.length) {
    return NextResponse.json(
      { success: false, error: `Missing required env vars: ${missing.join(", ")}` },
      { status: 500 },
    );
  }

  let data: { brand?: string; occasion?: string; audience?: string };
  try {
    data = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Ошибка парсинга тела запроса" },
      { status: 400 },
    );
  }

  const { brand, occasion, audience } = data || {};
  if (!brand || !occasion || !audience) {
    return NextResponse.json(
      { success: false, error: "Необходимо передать brand, occasion и audience" },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const ragQuery = buildRagQuery(brand, occasion, audience);
  const embedding = await fetchEmbeddingVector(ragQuery);
  let retrievedText = "";
  let ragChunkCount = 0;
  if (embedding) {
    const retrieved = await retrieveKnowledgeContext(supabase, embedding, 3);
    retrievedText = retrieved.text;
    ragChunkCount = retrieved.chunkCount;
  }

  const ragUsed = retrievedText.length > 0;
  console.log("[RAG]", {
    embedding_ok: Boolean(embedding),
    used: ragUsed,
    chunks: ragChunkCount,
    prompt_chars_from_kb: retrievedText.length,
  });

  const ragBlock =
    retrievedText.length > 0
      ? `Используй эти примеры как вдохновение:\n${retrievedText}\n\n`
      : "";

  const prompt = `${ragBlock}Ты — дерзкий и гениальный Креативный Директор топового PR-агентства. 
Твоя задача: на основе трех вводных (Бренд, Повод, Аудитория) выдать 3 взрывные, нестандартные и конкретные PR-идеи.

ПРАВИЛА:
1. НИКАКИХ уточняющих вопросов. Работай с тем, что есть. Если данных мало — импровизируй и додумывай контекст сам, исходя из своего опыта.
2. Идеи должны быть "виральными" (чтобы о них написали СМИ и паблики).
3. Каждая идея должна включать:
   - Название (сочное и запоминающееся).
   - Суть (что конкретно мы делаем).
   - "Крючок" (почему это станет виральным и зацепит аудиторию).
4. Стиль ответов: профессиональный, уверенный, без воды.

ВВОДНЫЕ:
Бренд: ${brand}
Повод: ${occasion}
Аудитория: ${audience}

Выдай результат сразу в виде трех идей.`;

  const body = {
    model: CHAT_MODEL,
    messages: [{ role: "user" as const, content: prompt }],
  };

  let openRouterRes: Response;
  try {
    openRouterRes = await fetch(OPENROUTER_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { success: false, error: `Сеть / OpenRouter: ${message}` },
      { status: 500 },
    );
  }

  const rawText = await openRouterRes.text();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    parsed = rawText;
  }

  console.log("[OpenRouter] status:", openRouterRes.status, "response:", parsed);

  if (!openRouterRes.ok) {
    return NextResponse.json(
      {
        success: false,
        error: `OpenRouter HTTP ${openRouterRes.status}: ${typeof parsed === "string" ? parsed : JSON.stringify(parsed)}`,
      },
      { status: 502 },
    );
  }

  const json = parsed as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (json.error?.message) {
    return NextResponse.json(
      { success: false, error: `OpenRouter: ${json.error.message}` },
      { status: 502 },
    );
  }

  const resultString = json.choices?.[0]?.message?.content?.trim() ?? "";
  if (!resultString) {
    return NextResponse.json(
      { success: false, error: "Пустой ответ от OpenRouter (нет choices[0].message.content)" },
      { status: 502 },
    );
  }

  const { error: supabaseError, data: saved } = await supabase
    .from("projects")
    .insert([{ brand, occasion, audience, result: resultString }])
    .select()
    .single();

  if (supabaseError) {
    return NextResponse.json(
      { success: false, error: `Ошибка при сохранении в Supabase: ${supabaseError.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    result: resultString,
    project: saved,
    rag: {
      used: ragUsed,
      chunks: ragChunkCount,
      embedding_ok: Boolean(embedding),
    },
  });
}
