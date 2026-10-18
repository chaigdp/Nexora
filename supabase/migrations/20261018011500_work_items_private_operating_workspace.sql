create table public.work_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 project_id uuid references public.projects(id) on delete restrict,
 kind text not null check(kind in ('handoff','incident','meeting','growth','learning')),
 title text not null check(length(trim(title)) between 1 and 180),
 status text not null default 'Aberto' check(status in ('Aberto','Em andamento','Aguardando','Concluído')),
 priority text not null default 'P2' check(priority in ('P0','P1','P2','P3')),
 due_date date,
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object' and octet_length(data::text)<=40000),
 revision integer not null default 1,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.work_items enable row level security;
revoke all on public.work_items from anon;
grant select,insert,update on public.work_items to authenticated;
create policy work_items_read on public.work_items for select to authenticated using(user_id=(select auth.uid()));
create policy work_items_insert on public.work_items for insert to authenticated with check(user_id=(select auth.uid()) and (project_id is null or exists(select 1 from public.projects p where p.id=project_id and p.user_id=(select auth.uid()))));
create policy work_items_update on public.work_items for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()) and (project_id is null or exists(select 1 from public.projects p where p.id=project_id and p.user_id=(select auth.uid()))));
create index work_items_owner_updated on public.work_items(user_id,updated_at desc);
create index work_items_project on public.work_items(project_id);
create function public.work_items_revision() returns trigger language plpgsql set search_path='' as $$ begin
 if TG_OP='INSERT' then new.revision=1; new.created_at=now(); else new.revision=old.revision+1; new.created_at=old.created_at; end if;
 new.updated_at=now(); return new; end $$;
create trigger work_items_revision before insert or update on public.work_items for each row execute function public.work_items_revision();

