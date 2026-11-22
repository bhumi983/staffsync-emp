create table public.employees (
  id bigint primary key,
  name text not null,
  email text not null,
  dept text not null,
  role text not null,
  salary numeric not null,
  status text not null default 'Active',
  created_at timestamptz default now()
);

alter table public.employees enable row level security;

create policy "Allow all access for demo"
on public.employees
for all
using (true)
with check (true);