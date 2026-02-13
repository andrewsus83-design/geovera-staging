# 🔐 APPLY RLS POLICIES NOW - PRODUCTION SECURITY

## ⚡ CRITICAL: Execute This Immediately

**Open Supabase SQL Editor:**
```
https://supabase.com/dashboard/project/vozjwptzutolvkvfpknk/sql/new
```

**Copy & Paste this entire SQL script:**

Location: `/Users/drew83/Desktop/untitled folder/enable_rls_all_tables.sql`

Or copy from migration file:
```
/Users/drew83/Desktop/untitled folder/supabase/migrations/20260212160914_enable_production_rls.sql
```

**Click "RUN"** ▶️

---

## ✅ What This Does

1. **Enables RLS** on 26+ tables
2. **Creates policies** so users can only see their own data:
   - Users can only see their own brands
   - Users can only see their own subscriptions
   - Users can only see their own invoices
   - Users can only see data for their brands

3. **Prevents data leaks**:
   - User A cannot see User B's brands
   - User A cannot modify User B's data
   - Public cannot access any data without authentication

---

## 🧪 Verify RLS is Working

After running the script, test:

**Test 1: Check RLS Status**
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'gv_%' OR tablename IN ('brands', 'customers', 'user_brands')
ORDER BY tablename;
```

All should show `rowsecurity = true` ✅

**Test 2: Check Policies**
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

Should show multiple policies for brands, customers, etc. ✅

---

## 🚀 After RLS is Applied

You can safely:
1. ✅ Sign up with REAL email
2. ✅ Create REAL brand data
3. ✅ Test payment with Xendit (test mode)
4. ✅ Deploy to production

Your data is now **SECURE** - no fake data, no public access! 🔒
