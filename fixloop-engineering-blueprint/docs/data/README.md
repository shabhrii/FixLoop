# Data module

`prisma/schema.prisma` is the candidate relational contract; `data-dictionary.md` explains each entity; `schema-design.md` defines tenant consistency, indexes and migrations. Schema is a draft and must pass Prisma validation and migration tests before application. Any status/foreign-key/tenant-column change needs tests.
