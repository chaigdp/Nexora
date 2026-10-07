-- Completa o histórico 360 da demonstração com a data de atualização dos planos.
-- Mantém o RPC anônimo restrito à base fictícia e aos campos mínimos necessários.

create or replace function public.get_demo_portfolio()
returns jsonb
language sql
security definer
set search_path = ''
as $$
  with demo_projects as (
    select
      p.id,p.client,p.owner,p.phase,p.due_date,p.manual_risk_level,p.segment,
      jsonb_build_object('cs_portfolio', p.metadata->>'cs_portfolio') as metadata
    from public.projects p
    where coalesce(p.metadata->>'test_data','false')='true'
      and p.metadata->>'test_batch'='teste-35-empresas-2026-10-05'
  )
  select jsonb_build_object(
    'projects', coalesce((select jsonb_agg(to_jsonb(p) order by p.client) from demo_projects p),'[]'::jsonb),
    'tasks', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',t.id,'project_id',t.project_id,'title',t.title,'done',t.done,
        'critical',t.critical,'blocked',t.blocked,'due_date',t.due_date
      ) order by t.due_date nulls last,t.title)
      from public.tasks t where t.project_id in (select id from demo_projects)
    ),'[]'::jsonb),
    'operations', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',o.id,'project_id',o.project_id,'kind',o.kind,'title',o.title,'owner',o.owner,
        'due_date',o.due_date,'status',o.status,'priority',o.priority,'detail',o.detail,
        'evidence',o.evidence,'strategy',o.strategy,'progress',o.progress,
        'dependency',o.dependency,'updated_at',o.updated_at
      ) order by o.updated_at desc nulls last,o.due_date nulls last,o.title)
      from public.operations o where o.project_id in (select id from demo_projects)
    ),'[]'::jsonb),
    'feedbacks', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id',f.id,'project_id',f.project_id,'csat',f.csat,'nps',f.nps,'ces',f.ces,
        'comment',f.comment,'created_at',f.created_at
      ) order by f.created_at desc)
      from public.feedbacks f where f.project_id in (select id from demo_projects)
    ),'[]'::jsonb)
  );
$$;

revoke execute on function public.get_demo_portfolio() from public;
revoke execute on function public.get_demo_portfolio() from authenticated;
grant execute on function public.get_demo_portfolio() to anon;
