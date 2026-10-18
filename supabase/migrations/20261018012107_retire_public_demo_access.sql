revoke execute on function public.get_demo_portfolio() from public,anon,authenticated; revoke all on public.demo_portfolio_snapshots from anon,authenticated;
-- Remove the previously published fictitious portfolio.
delete from public.demo_portfolio_snapshots where id='default';

