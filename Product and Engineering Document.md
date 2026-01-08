# CB Scheduling Tool — Comprehensive Product + Engineering Documentation (Release Candidate 1)

> **Scope:** This document covers the **majority of pages targeted for Release Candidate 1 (RC1)**:
> - Create Appointment
> - Accelerations
> - Admin: Modify Availability
> - Admin: Modify Workflows
> - Admin: Modify Templates
>
> **Tech Stack:**
> - Frontend: **Angular**
> - Backend: **.NET**
> - API approach: **REST (recommended for RC1)** with **UI bundle endpoints** + core resource endpoints  
>   (Optionally evolve to GraphQL-for-reads later; see Section 3.5.)

---

## 0. Document Control
- **Status:** Draft for Review (RC1)
- **Owner:** Josh Strunk
- **Last Updated:** January 8, 2026

---

## 1. System Overview

### 1.1 Product Purpose
CB Scheduling Tool is an internal web application used to:
- Create and track appointments/work items
- Manage and track “Acceleration” requests (expedite/prioritize workflows)
- Provide administrative configuration for scheduling capacity, workflows, and templates
- Support role/user context switching

### 1.2 Global Layout
#### 1.2.1 Top Header
- App title: **CB Scheduling Tool**
- Icon buttons: refresh, back/navigation
- Profile icon/menu on far right

#### 1.2.2 Left Navigation
- Home
- Create Appointment
- Accelerations
- My Schedule
  - Shift Schedule
  - Shift History
- Help & Support
  - Get Help, FAQ or Submit Feedback (Bug or Enhancement Requests)
- Admin Functions
  - Modify Availability
  - Modify Workflows
  - Modify Templates
  - Modify Accelerations

> **RC1 scope in this document** focuses on: Create Appointment, Accelerations, Modify Availability, Modify Workflows, Modify Templates, Modify Accelerations.

---

## 2. RC1 Goals & Non-Goals

### 2.1 RC1 Goals
1. Provide a usable intake flow to create appointments with required metadata.
2. Provide acceleration request intake flow and creation entry point (with list/search/filter capability).
3. Provide admin configuration for:
   - Availability (base schedule, overrides, blocked dates gating)
   - Workflows (team-scoped product types + change types)
   - Templates (variable-driven text templates for standardized notes and email correspondence) that are assignable in Workflows
4. Establish consistent platform behavior:
   - Role Based Access Control (RBAC) enforcement
   - Auditing and Observability for user, and admin changes (including insertion, updates or deletions)
   - Stable UI patterns for loading/empty/error states

### 2.2 Non-Goals (for this document/RC1)
- Advanced scheduling UI (multi event insertion via document upload [.csv or .xlsx])
- External integrations such as to Century, Orion, Landscape, MS Teams, Smartsheets

---

## 3. Cross-Cutting Requirements (Applies to All RC1 Pages)

### 3.1 Security & RBAC
- All access control must be enforced **server-side**.
- UI should adapt to permissions (disable/hide controls) but cannot be relied upon for security.
- Roles should control:
  - What teams a user can view/manage
  - Whether the user can view/manage appointments
  - Whether the user can view/manage acceleration requests
  - Whether the user can view/manage admin configuration

### 3.2 Audit Logging
All state-changing actions in RC1 must produce audit records:
- Create Appointment create/edit/delete
- Template create/edit/delete
- Workflow config create/edit/delete (product/change types)
- Availability config changes (base schedule, overrides, blocks)
- Acceleration request create/edit/delete

Minimum audit fields:
- timestamp
- user network id
- action type (create/update/delete)
- entity type/id
- diff of the changed fields
- optional reason/comment where applicable

### 3.4 UX Standards
- Disabled states should clearly indicate required prerequisite action (e.g., “Select a team…”).
- Loading states should be panel-level when possible.
- Error states should provide retry with escalating backoff and preserve user inputs where feasible.
- Prevent double-submit for create actions (idempotency).

### 3.5 API Strategy (RC1 Recommendation)
**REST-first** with two layers:

1) **Core Resource APIs** (CRUD and domain logic)
- `/teams`, `/appointments`, `/templates`, `/product-types`, `/change-types`, `/availability/*`, `/accelerations`

2) **UI Bundle APIs** (page bootstrap endpoints)
- `/ui/appointments/create`
- `/ui/availability?teamId=...`
- `/ui/workflows?teamId=...`
- `/ui/templates`
- `/ui/accelerations?...`

Bundle responses should include:
- `context` (effective user/role)
- `permissions`
- `data`
- `meta` (options/enums/labels)
- `version tokens` (ETag/rowversion) where relevant

> **Future option:** Add GraphQL for read queries, potentially maitain REST for writes.

## 3.6 Capacity Booking Concurrency & Real-Time Updates (15-Minute Slot Inventory)

### 3.6.1 Key Decisions (RC1)
- **Time model:** Fixed **15-minute boundaries** (slots are end-exclusive).
- **Source of truth:** Backend enforces capacity atomically.
- **Concurrency mechanism:** **SQL Server application locks** (`sp_getapplock`) + DB transaction.
- **Real-time UX:** Use **SignalR** to broadcast slot capacity updates after successful commits.

### 3.6.2 Data Model: Slot Inventory Table
Maintain a slot-level inventory table representing booked capacity per team per 15-minute slot.

**Table:** `TeamSlotInventory`
- `TeamId` (PK part)
- `SlotStartUtc` (PK part; aligned to 15-minute boundaries)
- `Capacity` (int)  
  - may be denormalized for the slot (recommended if capacity varies by date/time due to overrides)
- `BookedCount` (int)
- `LastUpdatedUtc` (datetime2)
- `RowVersion` (rowversion) *(optional; app lock is primary concurrency control)*

**Constraints**
- PK / Unique Index: `(TeamId, SlotStartUtc)`
- `BookedCount >= 0`
- `BookedCount <= Capacity` *(enforced by transactional logic, not a simple constraint)*

### 3.6.3 Slot Computation Rules
- Normalize requested `StartUtc` and `EndUtc` to 15-minute boundaries.
- Slots are **start-inclusive, end-exclusive**.
- A request spanning N blocks will attempt to reserve/increment all those slot rows.

Example:
- 10:00–10:45 => slots: 10:00, 10:15, 10:30 (3 slots)

### 3.6.4 Atomic Booking Algorithm (Single-Step Create)
Appointment creation performs capacity enforcement and persistence in a single backend operation.

**API**
- `POST /appointments` (idempotent)

**Algorithm**
1. Compute the list of required 15-minute slots for `(TeamId, StartUtc, EndUtc)`.
2. Acquire an application lock that represents the team+time range.
3. Within the same DB transaction:
   - Ensure `TeamSlotInventory` rows exist for each required slot (upsert if needed).
   - Validate that for every required slot: `BookedCount < Capacity` and the slot is not blocked (capacity=0).
   - Increment `BookedCount` by 1 for each required slot.
   - Insert the `Appointment` record.
4. Commit transaction.
5. After commit, broadcast real-time capacity updates via SignalR.

**Correctness Guarantee**
Only up to `Capacity` appointments can commit for any slot. Concurrent writers will serialize on the application lock and deterministic validation will reject over-capacity attempts with a conflict response.

### 3.6.5 SQL Server Application Lock Details
Use `sp_getapplock` to serialize writers for overlapping slot ranges.

**Lock resource key (recommended)**
- `capacity:team:{TeamId}:range:{StartUtcISO}-{EndUtcISO}`

**Lock configuration**
- `@LockMode = 'Exclusive'`
- `@LockOwner = 'Transaction'` (lock released automatically on commit/rollback)
- `@LockTimeout` set to a reasonable value (e.g., 5000–15000ms) depending on expected load

**Notes**
- Normalize the range string (same formatting) to avoid accidental key mismatch.
- Always generate slots and lock key deterministically.
- If lock acquisition fails (timeout), return `503` or `409` with a retryable message.

### 3.6.6 Failure Responses (Capacity Exceeded)
If any slot cannot be incremented due to capacity, return:

- HTTP: `409 Conflict`
- Payload includes actionable info:

```json
{
  "error": "CapacityExceeded",
  "message": "This time slot is no longer available.",
  "teamId": "T123",
  "startUtc": "2026-01-08T15:00:00Z",
  "endUtc": "2026-01-08T16:00:00Z",
  "failedSlotsUtc": ["2026-01-08T15:30:00Z"],
  "capacity": 2,
  "remaining": 0
}
```

### 3.6.7 SignalR Real-Time Updates (UX Improvement)
SignalR is used to notify other active clients that slot capacity has changed.

**Why**
- Reduces user confusion when a slot fills between selection and submit.
- Enables live UI counters (remaining capacity) and disables submission when remaining=0.

**Recommended SignalR Events**
- `SlotCapacityUpdated`  
  Payload: `{ teamId, slotStartUtc, capacity, bookedCount, remaining }`
- `AppointmentCreated` *(optional)*  
  Payload: `{ appointmentId, teamId, startUtc, endUtc }`

**Group strategy**
- Clients join:
  - `team:{TeamId}` *(baseline)*
  - optionally `team:{TeamId}:date:{yyyy-mm-dd}` *(reduces traffic for high-volume teams)*

**When to broadcast**
- Only after the DB transaction **commits successfully** (never before commit).

**Client behavior**
- If the user is viewing/targeting the affected team/date:
  - update the slot availability display
  - if `remaining == 0`, disable submission for that slot and show a “Slot just filled” banner
- If a user submits after a slot fills:
  - backend still rejects with `409 CapacityExceeded` (SignalR is additive, not authoritative)

---

### 3.6.8 Notes on Capacity Variability
Capacity can vary per slot due to:
- base weekly schedule
- capacity overrides (date/time specific)
- blocked periods (capacity becomes 0)

**Recommendation**
Resolve and materialize `Capacity` at the slot level so the booking path is fast and deterministic:
- Capacity = `0` for blocked slots
- Capacity = override value for overridden slots (absolute overrides)
- Capacity = base schedule-derived value otherwise

**Where capacity is resolved**
- At slot-row creation/update time (preferred), so booking checks are constant-time.
- Slot generation can be:
  - **on-demand** (ensure rows exist for the requested range during booking)
  - and/or **pre-generated** (daily job that seeds upcoming days/weeks)

**Important**
Even if capacity is computed on-demand, the computation + slot row upserts must occur inside the same application-lock + transaction boundary as the booking operation to avoid inconsistent reads under contention.

---

## 4. Technology Approach (RC1)

### 4.1 Frontend: Angular
- Use **standalone components** (recommended) + feature-folder structure.
- Use **Reactive Forms** for all forms/config editors.
- Use RxJS patterns for lists/search:
  - `debounceTime`, `distinctUntilChanged`, `switchMap` (cancel in-flight requests)

### 4.2 Backend: .NET
- ASP.NET Core APIs
- Use optimistic concurrency via `rowversion` mapped to ETags for editable config entities.
- Use idempotency keys for create endpoints that are user-triggered and can be double-submitted.

## 4.3 Infrastructure & Hosting (RC1)

### 4.3.1 Runtime Hosting
- The application will be hosted as **containers on AWS ECS**.
- Recommended execution model: **ECS on Fargate** (serverless containers) unless there is a requirement for EC2-backed capacity.

### 4.3.2 Database
- The primary database will be **Amazon RDS (SQL)**.
- Recommended engine: **SQL Server** (aligns with the capacity locking strategy using `sp_getapplock`).

### 4.3.3 Networking & Access (Internal)
- The app will be internal and accessed behind company network controls (e.g., VPN).
- ECS services should run in **private subnets**.
- Public exposure (if any) should be via an internal load balancer (org standard).

### 4.3.4 Environment Strategy
- Environments (recommended):
  - `dev`
  - `stage`
  - `prod`
- Each environment has isolated:
  - ECS service(s) and task definitions
  - RDS database (separate instance or separate DB per env)
  - secrets/config scoped per environment

### 4.3.5 Observability (Recommended)
- Centralized logging for ECS tasks via **CloudWatch Logs**.
- Health checks at the load balancer and service level.
- Correlation IDs propagated from API responses into logs for support/debugging.

## 4.4 CI/CD (RC1)

### 4.4.1 Tooling
- CI/CD will be implemented using **GitHub Actions**.

### 4.4.2 Container Registry (Recommended)
- Store built container images in **Amazon ECR**.
- Tagging (recommended):
  - `calendar-tool-api:{git-sha}`
  - `calendar-tool-ui:{git-sha}` *(if UI is separately containerized)*
  - optional release tags: `{version}`

### 4.4.3 Pipeline Stages (Recommended)

#### Pull Request (CI)
- Build Angular frontend
- Build .NET backend
- Run unit tests (FE + BE)
- Lint/format checks
- Build Docker images (optional on PR; required on main)

#### Main Branch (CD)
- Build and tag container images
- Push images to Amazon ECR
- Deploy to ECS (update service to new task definition revision)
- Run post-deploy smoke tests (health endpoint + basic API check)

### 4.4.4 Deployment Strategy (Recommended)
- Rolling deployments via ECS service updates.
- Prefer promoting a previously built image across environments (avoid rebuilding per env).
- Rollback plan: redeploy prior task definition revision/image tag.

### 4.4.5 Secrets & Configuration
- No secrets stored in GitHub.
- Use AWS-native secret management:
  - **AWS Secrets Manager** or **SSM Parameter Store**
- Inject runtime configuration into ECS tasks via:
  - task definition environment variables
  - ECS secrets integration (Secrets Manager / SSM)
****

---

# 5. Page Specifications (RC1)

---

## 5.1 Page: Create Appointment

### 5.1.1 Purpose
Provide an intake form to create a new appointment/work item, capturing required routing and tracking metadata.

### 5.1.2 UI Elements (Observed)
Centered card titled **Create Appointment** with fields:
- **Team*** (dropdown)
- **Product Type*** (dropdown)
- **Customer Name*** (text)
- **SO ID*** (text)
- **SR ID*** (text)
- **Customer Address*** (multi-line)
- **Bridge** (text; “leave blank for Teams automation”)
- **Notes / Description** (multi-line; optional)
- **Needs FSO Dispatch** (checkbox)
- Primary action: **Create Appointment**

### 5.1.3 Functional Requirements
#### Required Fields
- Team, Product Type, Customer Name, SO ID, SR ID, Customer Address

#### Optional Fields
- Bridge (blank implies automation path)
- Notes/Description
- Needs FSO Dispatch (flag routed downstream)

#### Submission Behavior
- Validate client-side and server-side.
- Prevent duplicate submissions via idempotency.
- On success: navigate to next appropriate view (details/confirmation/scheduling step).

### 5.1.4 Validation Rules (Recommended)
- Trim whitespace for all text inputs.
- Required fields non-empty.
- SO ID / SR ID:
  - allow alphanumeric + `-` and `_` (configurable)
- Notes length limit (e.g., 5000), Address length limit (e.g., 1000), Bridge length limit (e.g., 1000).

### 5.1.5 Engineering Notes
#### Proposed Entity: Appointment
- `id`
- `team_id`
- `product_type_id`
- `customer_name`
- `so_id`, `sr_id`
- `customer_address`
- `bridge` (nullable)
- `notes` (nullable)
- `needs_fso_dispatch` (bool)
- `status` (created/scheduled/closed etc., as defined)
- `created_by`, `created_at`

#### Recommended Endpoints
- `GET /ui/appointments/create`
  - returns: requestable teams, product types, permissions, (optional validation rules)
- `POST /appointments` (idempotent)
  - returns appointment id + next URL

---

## 5.2 Page: Accelerations

### 5.2.1 Purpose
Provide a workspace to manage and track acceleration requests.

### 5.2.2 UI Elements (Observed)
- Title: **Accelerations**
- CTA button: **New Request**
- Search input: “Search by customer or service order…”
- Filters: **All Status**, **All Priority**
- Tabs: **All Requests** (selected), **My Tasks**
- Empty state: “No accelerations”

### 5.2.3 Functional Requirements
- Search requests by customer/service order.
- Filter requests by status and priority.
- Toggle between:
  - All Requests (permission-scoped)
  - My Tasks (assigned/actionable items for effective user)
- Provide entry point to create a new request.

### 5.2.4 Engineering Notes
#### List Endpoint Standardization
- Paging: `page`, `pageSize`
- Search: `q`
- Filters: `status`, `priority`
- Tab: `tab=all|myTasks`

Recommended:
- `GET /ui/accelerations?tab=...&q=...&status=...&priority=...&page=...&pageSize=...`
- `POST /accelerations` (create request)

---

## 5.3 Page: Admin → Modify Availability

### 5.3.1 Purpose
Manage team availability inputs:
- weekly base schedule
- capacity overrides
- blocked dates

### 5.3.2 UI Elements (Observed)
- Title: **Modify Availability**
- Subtitle: “Manage weekly schedules, capacity overrides, and blocked dates”
- **Team Selection** dropdown: “Select a team to manage capacity”
- “All Teams Schedule” summary card:
  - columns: Base Schedule / Total Capacity
  - weekdays Monday–Sunday
- “Capacity Overrides” panel (disabled until team selected)
- Blocked dates placeholder text (disabled until team selected)

### 5.3.3 Functional Requirements
- Team selection is required context.
- After selecting team:
  - Show base schedule values
  - Enable override management
  - Enable blocked date management
  - Display derived total capacity

### 5.3.4 Engineering Notes
#### Bundle Endpoint (Recommended)
- `GET /ui/availability?teamId={teamId}`
  - base schedule
  - overrides
  - blocked dates
  - derived totals
  - permissions

#### Derived Capacity Precedence (Recommended)
1. Base schedule for weekday
2. Apply ABSOLUTE overrides (highest precedence)
3. Apply DELTA overrides
4. Apply blocked date → unschedulable / capacity 0

> Define whether “Total Capacity” reflects base-only or a specific week window.

---

## 5.4 Page: Admin → Modify Workflows

### 5.4.1 Purpose
Manage **product types** and their associated **change types**, scoped by team.

### 5.4.2 UI Elements (Observed)
- Title: **Modify Workflows**
- Subtitle: “Manage product types and their associated change types”
- Required **Team** dropdown (top right): “Select a team”
- Empty state (until team selected): “Select a Team”

### 5.4.3 Functional Requirements
- Team selection gates workflow management UI.
- After selecting team:
  - user can manage Product Types
  - user can manage Change Types associated with Product Types
- Enforce uniqueness rules and safe deletion (deactivate preferred).

### 5.4.4 Engineering Notes
#### Domain Model (Recommended)
- `ProductType`: team-scoped
- `ChangeType`: under product type

#### Recommended Endpoints
- `GET /ui/workflows?teamId={teamId}`
  - product types + change types + permissions + meta
- CRUD:
  - `POST /teams/{teamId}/product-types`
  - `PUT /product-types/{id}` (ETag/rowversion)
  - `PATCH /product-types/{id}` (deactivate)
  - `POST /product-types/{id}/change-types`
  - `PUT /change-types/{id}` (ETag/rowversion)
  - `PATCH /change-types/{id}` (deactivate)

---

## 5.5 Page: Admin → Modify Templates

### 5.5.1 Purpose
Create and manage text templates that support runtime variable substitution.

### 5.5.2 UI Elements (Observed)
Two-column layout:
- Left: **Create New Template**
  - Template Name* (text)
  - Template Type* (dropdown; shown “Scope of Work Details”)
  - Template Content* + “Insert Variable…” dropdown
- Right: **Existing Templates**
  - Example template: “Default SOW Template”
  - Badge: “In use by Scope of Work Details”
  - Actions: Edit, Delete icon
  - Preview block showing content and tokens like `{CustomerName}`, `{SOID}`, etc.

### 5.5.3 Variable Tokens (Observed)
- `{Notes}` — Event notes/description
- `{Bridge}` — Conference bridge details
- `{ProductType}` — Product type name
- `{ChangeTypes}` — List of change types
- `{EventDate}` — Event date
- `{EventStartTime}` — Event start time (time only)
- `{EventEndTime}` — Event end time (time only)
- `{CustomerName}` — Customer name
- `{CustomerAddress}` — Customer address
- `{SRID}` — Service Request ID
- `{SOID}` — Service Order ID

### 5.5.4 Functional Requirements
- Create templates with name/type/content.
- Insert variable tokens into content.
- View existing templates with preview and “in use” indicator.
- Edit templates.
- Delete/deactivate templates with guardrails if “in use”.

### 5.5.5 Engineering Notes
#### Template Rendering
- Plain text substitution:
  - tokens formatted as `{TokenName}`
  - replaced by values from an Appointment/WorkOrder context DTO

#### Recommended Endpoints
- `GET /ui/templates`
  - template types, variables, existing templates, permissions
- CRUD:
  - `POST /templates`
  - `PUT /templates/{id}` (ETag/rowversion)
  - `PATCH /templates/{id}` (deactivate)
  - `POST /template-types/{type}/set-default` (if applicable)

---

# 6. Data Model Summary (RC1 Recommended)

## 6.1 Shared
**Team**
- `id`, `name`, `timezone`, `status`

**AuditEvent**
- `id`
- `actor_user_id`
- `impersonated_user_id` (nullable)
- `action`
- `entity_type`
- `entity_id`
- `before` (json)
- `after` (json)
- `timestamp`

## 6.2 Appointment
- `id`, `team_id`, `product_type_id`
- `customer_name`, `so_id`, `sr_id`, `customer_address`
- `bridge`, `notes`, `needs_fso_dispatch`
- `status`, timestamps, created_by

## 6.3 Availability
**BaseWeeklySchedule**
- `team_id`, `weekday`, `enabled`, `capacity`, `row_version`

**CapacityOverride**
- `id`, `team_id`, `start_date`, `end_date`
- `type` (ABSOLUTE/DELTA), `value`, `reason`, timestamps, `row_version`

**BlockedDate**
- `id`, `team_id`, `start`, `end`, `reason`, timestamps, `row_version`

## 6.4 Workflows
**ProductType**
- `id`, `team_id`, `name`, `is_active`, `display_order`, timestamps, `row_version`

**ChangeType**
- `id`, `product_type_id`, `name`, `is_active`, `display_order`, timestamps, `row_version`

## 6.5 Templates
**Template**
- `id`, `name`, `type`, `content`, `is_active`
- `is_default_for_type` or “in use” mapping (as designed)
- timestamps, `row_version`

---

# 7. API Standards (RC1)

## 7.1 REST Endpoint Catalog (Recommended)

### 7.1.1 UI Bundle Endpoints (Page Bootstraps)
These endpoints are intentionally “UI-shaped” to reduce chatty loading and keep Angular screens simple.

- `GET /ui/appointments/create`
  - Returns: requestable teams, product types (or lookup strategy), permissions, meta

- `GET /ui/availability?teamId={teamId}`
  - Returns: base schedule, overrides, blocked dates, derived totals, permissions, meta

- `GET /ui/workflows?teamId={teamId}`
  - Returns: product types, change types (nested or flat), permissions, meta

- `GET /ui/templates`
  - Returns: template types, template variables, existing templates (+ in-use status), permissions, meta

- `GET /ui/accelerations?tab={all|myTasks}&q={q}&status={status?}&priority={priority?}&page={n}&pageSize={n}`
  - Returns: list items + paging + meta (status/priority options) + permissions

> **Standard:** Bundle endpoints should never require the client to call 3–6 other endpoints just to render a screen.

---

### 7.1.2 Core Resource Endpoints (Domain CRUD)

#### Teams
- `GET /teams?requestable=true`
- `GET /teams/{teamId}`

#### Appointments
- `POST /appointments` (idempotent)
- `GET /appointments/{appointmentId}` *(recommended for post-create details, if applicable)*

#### Availability
- `GET /teams/{teamId}/availability/base-schedule`
- `PUT /teams/{teamId}/availability/base-schedule` *(concurrency protected)*
- `POST /teams/{teamId}/availability/overrides`
- `PUT /availability/overrides/{overrideId}` *(concurrency protected)*
- `PATCH /availability/overrides/{overrideId}` *(deactivate/cancel override)*
- `POST /teams/{teamId}/availability/blocked-dates`
- `PUT /availability/blocked-dates/{blockId}` *(concurrency protected)*
- `PATCH /availability/blocked-dates/{blockId}` *(deactivate/cancel block)*

#### Workflows
- `POST /teams/{teamId}/product-types`
- `PUT /product-types/{productTypeId}` *(concurrency protected)*
- `PATCH /product-types/{productTypeId}` *(deactivate)*
- `POST /product-types/{productTypeId}/change-types`
- `PUT /change-types/{changeTypeId}` *(concurrency protected)*
- `PATCH /change-types/{changeTypeId}` *(deactivate)*

#### Templates
- `POST /templates`
- `PUT /templates/{templateId}` *(concurrency protected)*
- `PATCH /templates/{templateId}` *(deactivate)*
- `POST /template-types/{templateType}/set-default` *(only if “in use” is a default mapping)*
- `GET /template-variables` *(optional; can be part of `/ui/templates` meta)*

#### Accelerations
- `POST /accelerations`
- `GET /accelerations/{accelerationId}` *(recommended once details view exists)*

---

## 7.2 Standard Response Shapes

### 7.2.1 Bundle Response Contract
All `/ui/*` endpoints should return:

```json
{
  "context": {
    "effectiveUser": { "id": "u123", "displayName": "..." },
    "role": "Admin",
    "impersonating": false,
    "timezone": "America/New_York"
  },
  "permissions": {
    "canView": true,
    "canCreate": false,
    "canEdit": false,
    "canDelete": false
  },
  "data": { },
  "meta": { }
}
```

### 7.2.2 List Response Contract (Non-bundle or nested in bundle)

```json
{
  "items": [],
  "page": 1,
  "pageSize": 25,
  "total": 0,
  "sort": "updatedAt",
  "sortDir": "desc"
}
```

## 7.3 Filtering, Sorting, and Paging Standards

### 7.3.1 Query Parameters
- `q` = free-text search (single parameter across all list endpoints)
- `page`, `pageSize`
- `sort`, `sortDir`
- Enum filters as direct params unless there’s a reason to generalize:
  - `status=...`
  - `priority=...`
  - `teamId=...`

**Guideline:** Keep the same parameter names across modules (Accelerations, Work Orders, etc.) to reduce UI complexity.

---

## 7.4 Concurrency & Versioning

### 7.4.1 Optimistic Concurrency for Editable Config
For entities like:
- base schedules
- overrides
- blocked dates
- product types
- change types
- templates

Use one of:
- **ETag + If-Match** (preferred)
- `.NET rowversion` mapped to ETag in API responses (recommended internally)

**Requirements**
- `PUT/PATCH` must fail with `409 Conflict` (or `412 Precondition Failed`) if the version token mismatches.
- Error response should indicate a concurrency conflict and provide a path to refresh.
- Success responses should return the new version token.

---

## 7.5 Idempotency

### 7.5.1 Standard
For user-driven creates (especially `POST /appointments`, and likely `POST /accelerations`):
- Accept `Idempotency-Key` header (UUID recommended)
- Store key per actor + endpoint for a TTL (e.g., 24 hours)
- If the same key is replayed, return the original created resource reference (same `appointmentId` / `accelerationId`)

**Why**
- Prevents double submits on slow networks and accidental double-clicks.

---

## 7.6 Error Handling Standards

### 7.6.1 Validation Errors (400)
Return field-level errors in a consistent format:

```json
{
  "error": "ValidationFailed",
  "message": "One or more fields are invalid.",
  "fieldErrors": {
    "customerName": ["Customer Name is required."],
    "soId": ["SO ID must match expected format."]
  }
}
```

### 7.6.2 Authorization Errors
- `401 Unauthorized` if not authenticated
- `403 Forbidden` if authenticated but lacks permission

**Response should include:**
- a stable error code
- a user-friendly message

Example:

```json
{
  "error": "Forbidden",
  "message": "You do not have permission to perform this action."
}
```

### 7.6.3 Not Found (404) Errors
- `404 Not Found` for missing resources

Example: 

```json
{
  "error": "NotFound",
  "message": "The requested resource was not found."
}
```

### 7.6.4 Concurrency Errors (409 / 412)
Use:
- `409 Conflict` or
- `412 Precondition Failed`
When a client attempts to write using a stale version token (ETag/rowversion).

Example: 

```json
{
  "error": "ConcurrencyConflict",
  "message": "This record has been updated by someone else. Refresh and try again."
}
```

### 7.6.5 Server Errors (500)
- `500 Internal Server Error` for unhandled failures
- Include a correlation id for support/debugging

Example:

```json
{
  "error": "ServerError",
  "message": "An unexpected error occurred.",
  "correlationId": "b7a1f2f9-6c8a-4c7d-bd7b-2d6a0c3a8b11"
}
```

