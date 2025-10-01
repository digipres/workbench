---
sql:
  formats: https://www.digipres.org/_data/formats/index/formats.parquet
  exts: https://www.digipres.org/_data/formats/index/extensions.parquet
---
# Parquet Test

First...

```sql
SELECT * FROM exts WHERE id == 'r' LIMIT 10
```

Second...

```sql
SELECT * FROM formats WHERE 'r' in extensions LIMIT 10
```
