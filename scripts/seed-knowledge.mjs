/**
 * Загрузка строк в public.knowledge с эмбеддингами (OpenRouter).
 *
 * 1. Скопируйте scripts/knowledge-chunks.example.json → scripts/knowledge-chunks.json и отредактируйте тексты.
 * 2. В .env.local должны быть: OPENROUTER_API_KEY, NEXT_PUBLIC_SUPABASE_URL.
 * 3. Для вставки обходя RLS добавьте SUPABASE_SERVICE_ROLE_KEY (Settings → API в Supabase).
 *    Иначе настройте политику INSERT для таблицы knowledge под anon/authenticated.
 *
 * Запуск (Node 20.6+):
 *   npm run seed:knowledge
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CHUNKS_FILE = "knowledge-chunks.json";
const EXAMPLE_FILE = "knowledge-chunks.example.json";

const OPENROUTER_EMBEDDINGS = "https://openrouter.ai/api/v1/embeddings";
const EMBEDDING_MODEL =
  process.env.OPENROUTER_EMBEDDING_MODEL?.trim() || "openai/text-embedding-3-small";
const EXPECTED_DIM = 1536;

function loadChunks() {
  const primary = join(__dirname, CHUNKS_FILE);
  const fallback = join(__dirname, EXAMPLE_FILE);
  const path = existsSync(primary) ? primary : fallback;
  if (!existsSync(primary) && existsSync(fallback)) {
    console.warn(`Файл ${CHUNKS_FILE} не найден — используется ${EXAMPLE_FILE}. Скопируйте example в ${CHUNKS_FILE} и правьте тексты.\n`);
  }
  const raw = readFileSync(path, "utf8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error("JSON должен быть массивом объектов { content, metadata? }");
  }
  return data;
}

async function embed(text, apiKey) {
  const res = await fetch(OPENROUTER_EMBEDDINGS, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });
  const raw = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Embeddings: не JSON (${res.status}): ${raw.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`Embeddings HTTP ${res.status}: ${JSON.stringify(parsed)}`);
  }
  const vec = parsed?.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length !== EXPECTED_DIM) {
    throw new Error(
      `Ожидался вектор длины ${EXPECTED_DIM}, получено: ${vec?.length ?? "нет"}. Проверьте модель эмбеддингов.`,
    );
  }
  return vec;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url?.trim()) {
    throw new Error("Нет NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!openrouterKey?.trim()) {
    throw new Error("Нет OPENROUTER_API_KEY");
  }
  if (!serviceKey?.trim()) {
    throw new Error("Нет ключа Supabase");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    console.warn(
      "Внимание: используется publishable key. Если вставка отклонена (RLS), добавьте SUPABASE_SERVICE_ROLE_KEY в .env.local.\n",
    );
  }

  const chunks = loadChunks();
  const supabase = createClient(url, serviceKey);

  let ok = 0;
  for (let i = 0; i < chunks.length; i++) {
    const row = chunks[i];
    const content = typeof row.content === "string" ? row.content.trim() : "";
    if (!content) {
      console.warn(`Пропуск записи #${i}: пустой content`);
      continue;
    }
    const metadata =
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? row.metadata
        : {};

    console.log(`[${i + 1}/${chunks.length}] Эмбеддинг… (${content.slice(0, 50)}…)`);
    const embedding = await embed(content, openrouterKey);

    const { error } = await supabase.from("knowledge").insert({
      content,
      metadata,
      embedding,
    });

    if (error) {
      console.error(`Ошибка вставки #${i}:`, error.message);
      process.exitCode = 1;
      break;
    }
    ok += 1;
  }

  console.log(`\nГотово: вставлено ${ok} строк в knowledge.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
