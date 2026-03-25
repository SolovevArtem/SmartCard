# Code Review: All Sprints

## Tasks

### Sprint 1 — Безопасность

- [x] [S1-1] Fix CSV Injection in export endpoint
  - **File:** backend/server.js ~line 288
  - **AC:** All CSV fields wrapped in quotes and internal quotes escaped: `"${String(val ?? '').replace(/"/g, '""')}"`
  - Apply to: card.id, url, card.status, card.batch_name, card.storage_type, card.created_at

- [x] [S1-2] Add requireAdminKey to /admin HTML endpoint
  - **File:** backend/server.js ~line 590
  - **AC:** GET /admin route has requireAdminKey middleware — unauthorized requests get 401

- [x] [S1-3] Add rate limiting to /api/cards/create and /api/stats
  - **File:** backend/server.js
  - **AC:** Use express-rate-limit (already in package.json or add inline with `require`).
  - createLimiter: 10 req/15min per IP. statsLimiter: 30 req/min per IP.
  - If express-rate-limit not installed, implement simple in-memory rate limiter

- [x] [S1-4] Validate cardId format in all card endpoints
  - **File:** backend/server.js ~line 305 and all other routes with :cardId param
  - **AC:** Validate `/^[A-F0-9]{8}$/i` before using in SQL queries; return 400 if invalid

- [x] [S1-5] Remove error.message from HTTP responses
  - **File:** backend/server.js lines 257, 296, 335, 393 and all other catch blocks
  - **AC:** Client gets generic `"Internal server error"` message; actual error logged via `console.error`

- [x] CHECKPOINT: Test Sprint 1
  - **AC:** Run `cd /Users/artemsolovev/Downloads/videocards-mvp/backend && node -e "const s=require('./server'); setTimeout(()=>process.exit(0),1000)" 2>&1 | head -20` — server starts without errors
  - Verify CSV export code has quotes around all fields
  - Verify /admin has auth middleware
  - PAUSE: Stop here and report results before Sprint 2

### Sprint 2 — Надёжность

- [x] [S2-1] Make migration failures block server startup
  - **File:** backend/server.js ~lines 42–55
  - **AC:** If migration SQL fails, call `process.exit(1)` instead of just logging error

- [x] [S2-2] Replace N+1 DELETE loop with batch DELETE in cleanup
  - **File:** backend/server.js ~lines 648–655
  - **AC:** Collect all card IDs, then single `DELETE FROM cards WHERE id = ANY($1::text[])` query

- [x] [S2-3] Extract API timeout as named constant in backend
  - **File:** backend/server.js
  - **AC:** Add `const API_TIMEOUT_MS = 9000;` near top of file; use wherever timeout appears

- [x] [S2-4] Parallelize photo uploads with Promise.all in frontend
  - **File:** frontend/src/App.js ~lines 838–858 (CardWizard handleSubmit)
  - **AC:** Photo upload loop replaced with `Promise.all(photos.map(...))` for parallel execution

- [x] CHECKPOINT: Test Sprint 2
  - **AC:** Backend syntax check passes
  - Verify cleanup function uses single batch DELETE
  - Verify photo upload uses Promise.all
  - PAUSE: Stop here and report results before Sprint 3

### Sprint 3 — Чистота кода

- [x] [S3-1] Extract CardView component to separate file
  - **File:** frontend/src/App.js → create frontend/src/components/CardView.jsx
  - **AC:** CardView component (scroll parallax envelope) extracted to its own file with all its dependencies (imports, SVG constants). App.js imports CardView from ./components/CardView

- [x] [S3-2] Extract CardWizard component to separate file
  - **File:** frontend/src/App.js → create frontend/src/components/CardWizard.jsx
  - **AC:** CardWizard component (multi-step form) extracted to its own file. App.js imports CardWizard from ./components/CardWizard

- [x] [S3-3] Extract HomePage component to separate file
  - **File:** frontend/src/App.js → create frontend/src/components/HomePage.jsx
  - **AC:** HomePage component (landing page) extracted. App.js imports HomePage from ./components/HomePage. App.js shrinks to ~100 lines with just routing + CardPage

- [x] [S3-4] Add useCallback to prevPhoto/nextPhoto in CardView
  - **File:** frontend/src/components/CardView.jsx (after S3-1)
  - **AC:** prevPhoto and nextPhoto wrapped in useCallback with correct dependency arrays

- [ ] [S3-5] Create src/constants.js and centralize API_TIMEOUT_MS
  - **File:** create frontend/src/constants.js
  - **AC:** File exports `API_TIMEOUT_MS = 9000`; all usages in App.js components updated to import from constants

- [ ] [S3-6] Create centralized API client src/api.js
  - **File:** create frontend/src/api.js
  - **AC:** All 7 fetch() calls wrapped in named functions (getCard, createCard, uploadCard, confirmUpload, getPresignedUrls, getStats). Components use api.js functions instead of raw fetch

- [ ] [S3-7] Remove dead CSS classes from App.css
  - **File:** frontend/src/App.css
  - **AC:** Remove class blocks for: .hero-section, .card-view (old), .card-header, .form-group, .form-header, .reveal, .reveal-right, .reveal-left — but ONLY after confirming they don't appear in any .jsx/.js file with grep

- [ ] [S3-8] Extract magic numbers to constants in backend
  - **File:** backend/server.js
  - **AC:** Add named constants near top: RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS, MAX_CARDS_PER_BATCH, EXPORT_LIMIT, PRESIGNED_TTL_SECONDS, MAX_PHOTOS, CLEANUP_DAYS. Replace all magic number usages.

- [ ] [S3-9] Extract validateCardStatus helper in backend
  - **File:** backend/server.js
  - **AC:** Function `function validateCardStatus(card, requiredStatus, res)` extracted; used in the 4 endpoints that duplicate this check (lines 317, 349, 409, 465)

- [ ] CHECKPOINT: Test Sprint 3
  - **AC:** Backend syntax check passes. Frontend files exist: src/components/CardView.jsx, CardWizard.jsx, HomePage.jsx, src/api.js, src/constants.js
  - Verify App.js is now ~100 lines (routing only)
  - PAUSE: Stop here and report results before Sprint 4

### Sprint 4 — Производительность

- [ ] [S4-1] Add time-window filter to stats query
  - **File:** backend/server.js ~lines 513–523
  - **AC:** Stats endpoint accepts optional `?days=N` param (default 30). Query filters `WHERE created_at > NOW() - INTERVAL '$1 days'` using parameterized query

- [ ] [S4-2] Add composite index idx_cards_batch_status in migrations
  - **File:** backend/server.js ~lines 42–55 (migration block)
  - **AC:** Add `CREATE INDEX IF NOT EXISTS idx_cards_batch_status ON cards(batch_id, status);` to migration SQL

- [ ] [S4-3] Add lazy loading for CardPage route
  - **File:** frontend/src/App.js
  - **AC:** CardPage wrapped in React.lazy() + Suspense with fallback spinner. Import changed from static to dynamic.

- [ ] [S4-4] Remove backend dependencies from frontend/package.json
  - **File:** frontend/package.json
  - **AC:** Remove from dependencies: aws-sdk, express, multer, multer-s3, pg, cors. These are backend-only packages with no usage in frontend src/

- [ ] CHECKPOINT: Final Test — All Sprints
  - **AC:**
    1. `cd /Users/artemsolovev/Downloads/videocards-mvp/backend && node -e "const s=require('./server'); setTimeout(()=>process.exit(0),1000)" 2>&1 | head -30`
    2. `cd /Users/artemsolovev/Downloads/videocards-mvp/frontend && npm run build 2>&1 | tail -30`
    3. Both pass without errors
  - PAUSE: Report final results to user
