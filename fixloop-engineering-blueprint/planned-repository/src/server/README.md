# `src/server/` — use cases and business rules

Server-only modules own business commands. All commands require trusted actor+tenant context, re-load records under tenant scope, check capability and object relations, validate expected version, perform mutations transactionally and append audit events. Do not import server modules from client components. AI/network calls happen outside long-running database transactions.
