-- Выполните в Supabase SQL Editor (после создания таблицы knowledge с vector(1536)).

create or replace function public.match_documents (
  query_embedding vector(1536),
  match_count int default 3
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select
    k.id,
    k.content,
    k.metadata,
    (1 - (k.embedding <=> query_embedding))::double precision as similarity
  from public.knowledge k
  where k.embedding is not null
  order by k.embedding <=> query_embedding
  limit least(coalesce(match_count, 3), 20);
$$;

grant execute on function public.match_documents(vector(1536), int) to authenticated;
grant execute on function public.match_documents(vector(1536), int) to service_role;
grant execute on function public.match_documents(vector(1536), int) to anon;
