
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

function missingEnvKeys(keys: string[]) {
  return keys.filter((k) => !process.env[k] || process.env[k]?.trim() === "");
}

export async function POST(req: Request) {
  const missing = missingEnvKeys(["GOOGLE_GEMINI_API_KEY"]);
  if (missing.length) {
    return NextResponse.json(
      { success: false, error: `Missing required env vars: ${missing.join(", ")}` },
      { status: 500 },
    );
  }

  let data: any;
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

  const prompt = `Ты PR-стратег. Придумай 3 идеи для бренда ${brand} к событию ${occasion} для ${audience}.`;

  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY ?? "");
  let resultString = "";
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    const generation = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    resultString = (await generation.response).text();
  } catch (e: any) {
    return NextResponse.json(
      {
        success: false,
        error: e?.message ? `Ошибка генерации идей Gemini: ${e.message}` : "Ошибка генерации идей Gemini",
      },
      { status: 500 },
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

