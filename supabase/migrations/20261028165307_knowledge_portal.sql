create table public.knowledge_sources (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) between 1 and 180),
 kind text not null check(kind in ('text','link','file')),
 url text check(url is null or (length(url)<=4000 and url ~ '^https?://')),
 original_name text check(length(original_name)<=500),
 file_path text unique,
 file_size bigint not null default 0 check(file_size between 0 and 20971520),
 content text not null default '' check(length(content)<=200000),
 notes text not null default '' check(length(notes)<=10000),
 status text not null default 'received' check(status in ('received','readable','failed')),
 approved boolean not null default false,
 archived boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 search_vector tsvector generated always as (to_tsvector('portuguese'::regconfig,title || ' ' || coalesce(url,'') || ' ' || content || ' ' || notes)) stored,
 check(file_path is null or file_path=user_id::text || '/' || id::text || '/original'),
 check(kind<>'link' or url is not null),
 check(status<>'readable' or length(trim(content))>0),
 check(not approved or status='readable')
);
alter table public.knowledge_sources enable row level security;
revoke all on public.knowledge_sources from anon;
grant select,insert,update on public.knowledge_sources to authenticated;
create policy knowledge_read on public.knowledge_sources for select to authenticated using(user_id=(select auth.uid()));
create policy knowledge_insert on public.knowledge_sources for insert to authenticated with check(user_id=(select auth.uid()));
create policy knowledge_update on public.knowledge_sources for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create index knowledge_owner_updated on public.knowledge_sources(user_id,updated_at desc);
create index knowledge_search on public.knowledge_sources using gin(search_vector);
create function public.knowledge_updated() returns trigger language plpgsql set search_path='' as $$ begin
 if TG_OP='UPDATE' then
  if new.id<>old.id or new.user_id<>old.user_id or new.kind<>old.kind or new.file_path is distinct from old.file_path then raise exception 'A origem do material não pode ser alterada'; end if;
  new.created_at=old.created_at;
 end if;
 new.updated_at=clock_timestamp(); return new;
end $$;
create trigger knowledge_timestamp before insert or update on public.knowledge_sources for each row execute function public.knowledge_updated();
insert into storage.buckets(id,name,public,file_size_limit) values('chai-knowledge','chai-knowledge',false,20971520);
create policy knowledge_file_read on storage.objects for select to authenticated using(bucket_id='chai-knowledge' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy knowledge_file_insert on storage.objects for insert to authenticated with check(bucket_id='chai-knowledge' and (storage.foldername(name))[1]=(select auth.uid())::text and exists(select 1 from public.knowledge_sources k where k.file_path=name and k.user_id=(select auth.uid()) and k.kind='file' and k.status='received'));
create policy knowledge_file_cleanup on storage.objects for delete to authenticated using(bucket_id='chai-knowledge' and (storage.foldername(name))[1]=(select auth.uid())::text);
