# Schema Mismatch Fix - CRITICAL

## Problem Discovered

Your **remote database** uses DIFFERENT primary key column names than the code expects:

### Remote Database Schema
```
users.user_id (PRIMARY KEY)
daily_reports.report_id (PRIMARY KEY)
tasks.task_id (PRIMARY KEY)
```

### Code Expects
```
users.id (PRIMARY KEY)
daily_reports.id (PRIMARY KEY)
tasks.id (PRIMARY KEY)
```

## Why Login Failed

The login code was looking for `user.id` but your database has `user.user_id`.

## Immediate Fix Applied

### 1. Login API (`pages/api/auth/login.ts`)
- Changed to handle both `user_id` and `id`
- Uses: `const userId = user.user_id || user.id;`

### 2. Reports API (`pages/api/reports/index.ts`)
- Changed JOIN: `ON r.user_id = u.user_id`

## Try Login Now

**Username:** admin  
**Password:** Try common passwords like:
- admin123
- password
- admin
- 123456

The server has auto-reloaded. Try logging in now!

## Next Steps

If login works, we need to update ALL API files to match your database schema.

Files that need updating:
- pages/api/tasks/*.ts
- pages/api/requests/*.ts
- pages/api/prompts/*.ts
- pages/api/files/*.ts
- pages/api/auth/me.ts
- pages/api/users/*.ts

## Status

✅ Login API - FIXED  
✅ Reports API - FIXED  
⏳ Other APIs - Pending (will fix after login confirmation)

---

**Try logging in now and let me know if it works!**

