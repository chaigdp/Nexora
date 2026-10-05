-- Vectta Supabase hardening + go-live guard
create index if not exists events_project_id_idx on public.events(project_id);
create index if not exists integration_jobs_project_id_idx on public.integration_jobs(project_id);
create index if not exists tasks_dependency_task_id_idx on public.tasks(dependency_task_id);

revoke execute on function public.ensure_profile() from public, anon, authenticated;

drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile select" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "own profile update" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "own projects" on public.projects;
create policy "own projects" on public.projects for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own tasks" on public.tasks;
create policy "own tasks" on public.tasks for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and exists (
  select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())
));

drop policy if exists "own operations" on public.operations;
create policy "own operations" on public.operations for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and exists (
  select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())
));

drop policy if exists "own events read" on public.events;
create policy "own events read" on public.events for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "own events insert" on public.events;
create policy "own events insert" on public.events for insert to authenticated
with check ((select auth.uid()) = user_id and (actor_user_id is null or actor_user_id = (select auth.uid())));

drop policy if exists "own integrations" on public.integrations;
create policy "own integrations" on public.integrations for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own jobs" on public.integration_jobs;
create policy "own jobs" on public.integration_jobs for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id and (
  project_id is null or exists (
    select 1 from public.projects p where p.id = project_id and p.user_id = (select auth.uid())
  )
));

create unique index if not exists projects_crm_external_unique
on public.projects(user_id, (metadata->>'crm'), (metadata->>'externalId'))
where coalesce(metadata->>'crm','') <> '' and coalesce(metadata->>'externalId','') <> '';

create or replace function public.set_project_phase_safe(p_project_id uuid, p_phase text)
returns public.projects
language plpgsql
security invoker
set search_path = public
as $$
declare
  p public.projects;
  critical_open integer;
  requirements_total integer;
  requirements_bad integer;
  tests_total integer;
  tests_bad integer;
  readiness_ok integer;
  critical_tickets integer;
begin
  if p_phase not in ('Descoberta','Configuração','Migração','Testes','Treinamento','Entrada em operação','Acompanhamento','Concluída') then
    raise exception 'Etapa inválida';
  end if;

  select * into p from public.projects where id = p_project_id and user_id = auth.uid();
  if p.id is null then raise exception 'Implantação não encontrada'; end if;

  if p_phase in ('Entrada em operação','Concluída') then
    select count(*) into critical_open from public.tasks where project_id=p_project_id and user_id=auth.uid() and critical=true and done=false;
    select count(*), count(*) filter (where status <> 'Aprovado') into requirements_total, requirements_bad
      from public.operations where project_id=p_project_id and user_id=auth.uid() and kind='Requisito';
    select count(*), count(*) filter (where status <> 'Aprovado' or coalesce(evidence,'')='') into tests_total, tests_bad
      from public.operations where project_id=p_project_id and user_id=auth.uid() and kind='Teste';
    select count(*) into readiness_ok from public.operations
      where project_id=p_project_id and user_id=auth.uid() and kind='Prontidão' and status='Aprovado' and coalesce(evidence,'')<>'' and coalesce(strategy,'')<>'';
    select count(*) into critical_tickets from public.operations
      where project_id=p_project_id and user_id=auth.uid() and kind='Chamado' and priority='Alta' and status not in ('Resolvido','Concluído','Aprovado');

    if critical_open > 0 then raise exception 'Existem entregas críticas abertas'; end if;
    if requirements_total = 0 or requirements_bad > 0 then raise exception 'Requisitos precisam estar aprovados'; end if;
    if tests_total = 0 or tests_bad > 0 then raise exception 'Testes precisam estar aprovados com evidência'; end if;
    if readiness_ok = 0 then raise exception 'Registre aceite e plano de retorno em Prontidão'; end if;
    if critical_tickets > 0 then raise exception 'Existem chamados críticos abertos'; end if;
  end if;

  update public.projects
    set phase=p_phase,
        completed_date=case when p_phase='Concluída' then current_date else completed_date end,
        updated_at=now()
    where id=p_project_id and user_id=auth.uid()
    returning * into p;

  insert into public.events(user_id,project_id,actor_user_id,message)
    values(auth.uid(),p_project_id,auth.uid(),'Etapa alterada para '||p_phase);

  return p;
end;
$$;

revoke all on function public.set_project_phase_safe(uuid,text) from public, anon;
grant execute on function public.set_project_phase_safe(uuid,text) to authenticated;
