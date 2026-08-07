# Schema migrations

Apply these files **in filename order** against a fresh Supabase project (SQL editor or `supabase db push`).

| File | Purpose |
|------|---------|
| `20260301000000_baseline_app_schema.sql` | Core app tables (`jobs`, `users`, `profiles`, applications, resumes, cover letters, RLS) |
| `20260301000001_admin_analytics_content.sql` | Admin, analytics, scraper runs, templates, categories |
| `20260808000002_rate_limits.sql` | Durable API rate-limit counters |
| `20260808000003_applications_status_saved.sql` | Ensure `applications.status` check includes `saved` |

The same content is kept as editable references at:

- `supabase/schema.sql`
- `supabase/admin-schema.sql`

Both reference files are **additive** (`create table if not exists` / `create or replace`). They must never `DROP TABLE` production data.
