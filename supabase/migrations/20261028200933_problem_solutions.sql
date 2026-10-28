alter table public.knowledge_sources add column problem_case jsonb;
alter table public.knowledge_sources add constraint problem_case_shape check(problem_case is null or (kind='text' and jsonb_typeof(problem_case)='object' and octet_length(problem_case::text)<=100000 and problem_case->>'state' in ('investigating','resolved','validated') and length(trim(coalesce(problem_case->>'problem','')))>0));
create function public.knowledge_case_sync() returns trigger language plpgsql set search_path='' as $$
declare field text; label text; output text:=''; value text;
begin
 if TG_OP='UPDATE' and old.problem_case is not null and new.problem_case is null then raise exception 'Um caso não pode perder sua estrutura'; end if;
 if new.problem_case is null then return new; end if;
 if new.problem_case->>'state' is null or new.problem_case->>'state' not in ('investigating','resolved','validated') then raise exception 'Situação inválida'; end if;
 for field,label in select * from (values ('problem','Problema e sintomas'),('context','Contexto e condições'),('cause','Causa confirmada'),('attempts','Tentativas anteriores'),('solution','Como foi resolvido'),('result','Resultado observado'),('evidence','Evidência e origem'),('limits','Quando não aplicar / quando escalar'),('verifiedBy','Validado por'),('verifiedAt','Data da validação')) as f(k,v) loop
  if jsonb_typeof(new.problem_case->field) is distinct from 'string' or length(new.problem_case->>field)>3000 then raise exception 'Campo inválido'; end if;
  value:=new.problem_case->>field;
  if length(trim(value))>0 then output:=output || label || E':\n' || value || E'\n\n'; end if;
 end loop;
 if new.problem_case->>'state' in ('resolved','validated') and (length(trim(new.problem_case->>'solution'))=0 or length(trim(new.problem_case->>'result'))=0) then raise exception 'Solução e resultado obrigatórios'; end if;
 if new.problem_case->>'state'='validated' then
  foreach field in array array['context','evidence','limits','verifiedBy','verifiedAt'] loop
   if length(trim(new.problem_case->>field))=0 then raise exception 'Validação incompleta'; end if;
  end loop;
  if (new.problem_case->>'verifiedAt')::date > (current_timestamp at time zone 'America/Sao_Paulo')::date then raise exception 'Validação futura'; end if;
 end if;
 new.content:=trim(output); new.status:='readable'; new.approved:=(new.problem_case->>'state'='validated'); return new;
end $$;
create trigger knowledge_case_sync before insert or update on public.knowledge_sources for each row execute function public.knowledge_case_sync();
