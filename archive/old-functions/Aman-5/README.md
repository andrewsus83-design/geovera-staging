# 📁 AMAN-5 - Root Folder Audited Files

**Created**: 12 Februari 2026
**Purpose**: Files dari root folder yang sudah di-audit dan di-review
**Total**: 9 TypeScript files + 3 documentation files

---

## 📊 FILE INVENTORY

### 📄 Documentation (3 files):
1. **ROOT_FOLDER_AUDIT.md** (15 KB) - Full technical audit report
2. **DELETED_CRAWLER_FILES.md** (4 KB) - Log of deleted crawler files
3. **ROOT_FOLDER_SUMMARY.md** (1.7 KB) - Summary after cleanup

### 📝 TypeScript Files (9 files):

| # | Filename | Size | Status | Production Ready? |
|---|----------|------|--------|-------------------|
| 1 | learning-note.ts | 11 KB | ✅ Ready | YES |
| 2 | llm-dashboard-api.ts | 37 KB | ✅ Ready | YES |
| 3 | insight-approval-api.ts | 29 KB | ⚠️ Fix API Key | NO - needs SERVICE_ROLE_KEY |
| 4 | github-pusher.ts | 16 KB | ⚠️ Security Review | NO - needs audit |
| 5 | google-signin-test.ts | 25 KB | 🔴 Credentials | NO - hardcoded credentials |
| 6 | login-page.ts | 9.1 KB | 🔴 Credentials | NO - hardcoded credentials |
| 7 | llm-visibility-orchestrator.ts | 28 KB | ⚠️ Mock | NO - template questions |
| 8 | multi-ai-answers.ts | 14 KB | ⚠️ Mock | NO - mock LLM calls |
| 9 | job-orchestrator-v2.ts | 3.3 KB | 🔴 Stub | NO - placeholder only |

---

## ✅ PRODUCTION READY (2 files)

### 1. learning-note.ts
**Purpose**: Finalize learning notes from drafts
**Dependencies**:
- gv_authority_drafts
- gv_tasks
- gv_learning_notes
- gv_jobs
**Status**: ✅ Ready to deploy
**Issues**: None

### 2. llm-dashboard-api.ts
**Purpose**: Multi-endpoint dashboard API for LLM visibility
**Endpoints**:
- /rankings - Latest test results
- /trends - Historical performance
- /questions - Active test questions
- /responses - Test responses
- /test-status - Batch status check
**Status**: ✅ Ready to deploy
**Issues**: None (could benefit from caching)

---

## ⚠️ NEEDS WORK (7 files)

### Priority 1: Quick Fixes (5-15 minutes)

#### insight-approval-api.ts
**Issue**: Uses ANON_KEY instead of SERVICE_ROLE_KEY
**Fix**: Change line ~15
```typescript
// BEFORE
Deno.env.get('SUPABASE_ANON_KEY')

// AFTER
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
```
**Time**: 5 minutes

---

### Priority 2: Security Review (1-2 hours)

#### google-signin-test.ts
**Issue**: Hardcoded Supabase credentials in HTML
**Impact**: Credentials visible in browser (acceptable IF RLS enabled)
**Action Required**:
1. Verify Row Level Security enabled on all tables
2. Verify anon key permissions are properly scoped
3. Consider environment variable injection
**Time**: 1 hour

#### login-page.ts
**Issue**: Same as google-signin-test.ts
**Action Required**: Same security verification
**Time**: Included in above

#### github-pusher.ts
**Issue**: Token can come from env OR request body
**Security Concerns**:
- Weak token validation
- Logs token preview
- No rate limiting
**Action Required**: Full security audit
**Time**: 1 hour

---

### Priority 3: Replace Mock Data (5-6 hours)

#### llm-visibility-orchestrator.ts
**Issue**: Template-based questions, not AI-generated
**Current**:
```typescript
function generateSimpleQuestions(brand_name) {
  return [
    { text: `Tell me about ${brand_name}`, type: 'awareness' }
  ];
}
```
**Should Be**: Real Claude API call
**Time**: 2 hours

#### multi-ai-answers.ts
**Issue**: Mock LLM answers, no real API calls
**Current**:
```typescript
answer_text: `[Claude answer to: ${question.text}]` // FAKE!
```
**Should Be**: Real API calls to Perplexity, Claude, Gemini
**Time**: 3-4 hours

---

### Priority 4: Implement or Remove

#### job-orchestrator-v2.ts
**Status**: Stub only (placeholder)
**Current**: Only returns version 2.0.0
**Action Required**:
- Implement full orchestration logic OR
- Remove file if not needed
**Time**: Unknown (depends on spec)

---

## 🔍 AUDIT DETAILS

**All files audited on**: 12 Februari 2026
**Audit report**: `ROOT_FOLDER_AUDIT.md`
**Issues found**:
- 🔴 CRITICAL: RTF format (all files) - ⚠️ Not converted yet
- 🔴 CRITICAL: Hardcoded credentials (2 files)
- 🟠 HIGH: Mock implementations (2 files)
- 🟡 MEDIUM: Security issues (3 files)
- 🟡 MEDIUM: Stub implementation (1 file)

---

## 📊 ARCHITECTURE NOTES

### Database Tables Used:
- gv_authority_drafts - Learning note drafts
- gv_tasks - Task management
- gv_learning_notes - Final learning notes
- gv_jobs - Job queue
- gv_geo_rankings - LLM visibility scores
- gv_llm_test_questions - Test questions
- gv_llm_responses - LLM answers
- gv_multi_ai_answers - Multi-AI comparison
- gv_insights - AI-generated insights
- brands - Brand validation

### External APIs:
- GitHub REST API (github-pusher.ts)
- Supabase Auth (google-signin-test, login-page)
- Perplexity API (multi-ai-answers - mock)
- Claude API (multi-ai-answers - mock)
- Gemini API (multi-ai-answers - mock)

---

## 🗑️ DELETED FILES

**11 crawler files deleted** - See `DELETED_CRAWLER_FILES.md`

**Reason**: Architecture decision to use Apify service instead of custom crawler

---

## 🚀 DEPLOYMENT READINESS

**Ready to deploy**: 2/9 files (22%)
**Needs quick fix**: 1/9 files (11%)
**Needs work**: 6/9 files (67%)

**Estimated time to production**:
- Quick fixes: 5 minutes
- Security review: 2 hours
- Mock replacements: 5-6 hours
- **Total**: ~7-8 hours of work

---

## 📞 NEXT STEPS

1. ✅ Convert RTF to plain text (use FIX_RTF_FILES.sh in Aman-4)
2. Fix insight-approval-api.ts API key (5 min)
3. Security review for auth pages (2 hours)
4. Replace mock implementations (5-6 hours)
5. Deploy production-ready files (learning-note, llm-dashboard-api)
6. Decide on job-orchestrator-v2.ts (implement or remove)

---

**Status**: ✅ All root folder files organized in Aman-5
**Architecture**: Using Apify for crawling (no custom crawler)
