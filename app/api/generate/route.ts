import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

function missingEnvKeys(keys: string[]) {
  return keys.filter((k) => !process.env[k] || process.env[k]?.trim() === "");
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

  const prompt = `Ты — дерзкий и гениальный Креативный Директор топового PR-агентства. 
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
    model: MODEL,
    messages: [{ role: "user" as const, content: prompt }],
  };

  let openRouterRes: Response;
  try {
    openRouterRes = await fetch(OPENROUTER_URL, {
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

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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

  return NextResponse.json({ success: true, result: resultString, project: saved });
}
