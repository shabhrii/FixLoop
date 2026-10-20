# `src/app/` — Next.js App Router

Owns route-level rendering, layouts, metadata and API route files. Pages should use server components by default and load data through authorized services. Client components receive minimal DTOs and invoke versioned API commands. Never treat a hidden page, route group or middleware redirect as an authorization control.
