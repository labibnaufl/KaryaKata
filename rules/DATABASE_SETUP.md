# Database Setup Guide - Karya Kata.

## Step 1: Create Neon PostgreSQL Account

1. Go to **https://neon.tech**
2. Sign up with GitHub or email
3. Create a new project (free tier includes 500 MB)
4. Choose **PostgreSQL 16** or latest

## Step 2: Get Connection String

1. In Neon Dashboard, click on your project
2. Go to **Connection Details**
3. Copy the connection string (looks like):
   ```
   postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

## Step 3: Update .env.local

Open `.env.local` and replace:

```env
DATABASE_URL="postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Step 4: Run SQL Migration

### Option A: Using Neon's SQL Editor

1. In Neon Dashboard, click **"SQL Editor"**
2. Open the file `db/migrations/001_init.sql` from this project
3. Copy ALL the SQL content
4. Paste into Neon's SQL Editor
5. Click **"Run"**

### Option B: Using psql CLI

```bash
# Install PostgreSQL client if not already installed
# Then run:
psql "postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require" -f db/migrations/001_init.sql
```

## Step 5: Verify Tables Created

Run this query in Neon SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected output:**

```
article_tags
articles
bookmarks
categories
comments
reactions
tags
users
admin_logs
```

## Step 6: Run Seed Data

### Option A: Neon SQL Editor

1. Open `db/seed.sql`
2. Copy ALL content
3. Paste into Neon SQL Editor
4. Click **"Run"**

### Option B: psql CLI

```bash
psql "$DATABASE_URL" -f db/seed.sql
```

## Step 7: Verify Seed Data

Run this query:

```sql
SELECT id, name, email, role, status FROM users;
```

**Expected output:**

```
admin-001 | Super Administrator | admin@Karya Kata..id | SUPER_ADMIN | VERIFIED
```

## Step 8: Test Connection

Run this in your terminal:

```bash
cd "D:\School\Semester 6\Prak Sistem Basis Data\Karya Kata."
bun run dev
```

If the database is connected correctly, the app should start without errors.

## Troubleshooting

### Error: "DATABASE_URL is not defined"

- Make sure `.env.local` exists (not `.env.local.txt`)
- Restart the dev server after creating `.env.local`

### Error: "connection refused"

- Check your connection string is correct
- Make sure you're using the full connection string with sslmode=require

### Error: "relation does not exist"

- Tables haven't been created yet
- Run the migration SQL again

### Error: "permission denied"

- Your Neon user might not have createdb privilege
- Check Neon dashboard for user permissions

## Quick Reference

### Reset Database (Caution: Deletes all data!)

```sql
-- Run in Neon SQL Editor
DROP TABLE IF EXISTS admin_logs CASCADE;
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS content_status CASCADE;
DROP TYPE IF EXISTS reaction_type CASCADE;
```

Then re-run `001_init.sql` and `seed.sql`

## Need Help?

- Neon Docs: https://neon.tech/docs
- PostgreSQL Tutorial: https://www.postgresqltutorial.com/
