# PRD — Calendar Tool

## 1. Overview
**Product:** Calendar Tool  
**Feature/Page:** **Admin → Modify Availability**  
**Purpose:** Provide authorized users a centralized UI to manage team availability inputs used by scheduling and capacity planning:
- Base weekly schedule
- Capacity overrides
- Blocked dates (blackouts)

### Screen Reference (Observed)
The provided screen shows:
- Global header with: app title, refresh/back icons, **Impersonation Mode**, **Role** dropdown, **User** dropdown, profile menu.
- Left nav with modules and an **Admin Functions** section where **Modify Availability** is selected.
- Main content: **Team Selection** dropdown, “All Teams Schedule” card (Base Schedule vs Total Capacity by weekday), and disabled panels for capacity overrides and blocked dates until a team is selected.

> **Note:** This PRD is grounded in visible UI + common scheduling semantics. Items marked **Assumption** should be validated once additional screens/data flows are provided.

---

## 2. Goals
1. Allow admins/schedulers to select a team and view its base schedule and effective capacity.
2. Enable controlled editing of:
   - Base weekly schedule
   - Capacity overrides (temporary adjustments)
   - Blocked dates (blackout windows)
3. Ensure changes are permissioned, validated, and auditable.
4. Provide clear UX states (disabled until team selected, consistent loading/error states).

## 3. Non-Goals
- Defining appointment creation workflows (covered by **Create Appointment**).
- Defining work queue behavior (e.g., TIV Status / MACDs / Work Orders).
- Timekeeping/payroll system integration (unless already part of the existing platform).

---

## 4. Personas & Roles (Conceptual)
- **Admin:** full access to all teams; may impersonate users.
- **Scheduler Admin / Team Manager:** can manage schedules for assigned teams.
- **Auditor (read-only):** can view configuration and history without editing.

**Assumption:** Role and User context are controlled by the header dropdowns and affect permissions/visibility.

---

## 5. Key User Stories
1. **As an Admin**, I can select a team and view the base schedule and total capacity by weekday.
2. **As a Scheduler Admin**, I can create a capacity override for a specific date range with a reason.
3. **As an Admin**, I can add blocked dates that prevent scheduling during blackout windows.
4. **As an Auditor**, I can view configuration and see a record of changes (via History or auditing views).

---

## 6. Functional Requirements

### 6.1 Team Selection (Required Context)
**Requirement:**
- The page must provide a **Team Selection** dropdown: “Select a team to manage capacity”.
- Until a team is selected:
  - Capacity Overrides panel is disabled with message
  - Blocked Dates area is disabled with message
  - Schedule card may show placeholder weekday rows without numeric values

**Acceptance Criteria:**
- Selecting a team triggers data load for:
  - base weekly schedule
  - overrides
  - blocked dates
  - derived “total capacity” output
- If the user lacks access to a team, it is not visible/selectable.

---

### 6.2 Base Weekly Schedule
**Requirement:**
- Display the base weekly schedule by weekday.
- Editing must be permitted only for users with appropriate roles.
- Minimum expected data per day (choose based on actual model):
  - enabled/disabled day
  - capacity value per day (integer)
  - **Optional (Assumption):** time ranges per day if scheduling is time-granular

**Acceptance Criteria:**
- User can view base weekly schedule for the selected team.
- If permitted, user can edit and save changes.
- After save, “Total Capacity” updates to reflect changes.

---

### 6.3 Total Capacity (Derived)
**Requirement:**
- Display “Total Capacity” by weekday.
- Total capacity reflects applied rules:
  - base schedule
  - overrides
  - blocked dates

**Assumption:** The current UI lists weekdays only (not specific dates). Decide whether totals represent:
- “generic weekly totals” (base-only), plus indicators of active overrides/blocks  
**OR**
- totals computed for a specific week/date context (e.g., current week)

**Acceptance Criteria:**
- Totals are consistent with backend computation rules (single source of truth).
- Any overrides/blocks that affect totals are visible or discoverable via UI.

---

### 6.4 Capacity Overrides (Team-Scoped Temporary Adjustments)
**Requirement:**
- Allow creation and management of capacity overrides scoped to a selected team.
- Override definition should include:
  - date or date range
  - capacity adjustment type: absolute set vs delta
  - capacity value
  - optional weekday restriction
  - reason/notes

**Acceptance Criteria:**
- Cannot create override without required fields (dates + value).
- Prevent invalid capacity (negative effective totals).
- Overrides appear in list and affect derived totals.

---

### 6.5 Blocked Dates (Blackout Windows)
**Requirement:**
- Allow creation and management of blocked dates scoped to the selected team.
- Block definition should include:
  - date or date range (or datetime range if time-granular)
  - reason/category

**Acceptance Criteria:**
- Blocked dates prevent appointment creation during the blocked window (enforced downstream).
- Blocks appear in list/calendar UI and affect capacity computation (typically sets to 0 / unschedulable).

---

### 6.6 Role / User Context + Impersonation
**Requirement:**
- Changing role/user context in the header updates accessible data and permissions.
- Impersonation must be explicit in UI (visible indicator) and must be audited.

**Acceptance Criteria:**
- When impersonating, audit log contains both:
  - actor user (real)
  - impersonated user (effective)
- Permissions are enforced server-side regardless of client state.

---

## 7. UX Requirements
- Disabled states must clearly instruct (“Please select a team…”).
- Panel-level loading and error messaging.
- Unsaved changes guard when navigating away or switching team.
- Clear confirmation for destructive actions (delete override/block).

---

## 8. Reporting & Audit Requirements
- All changes to base schedule/overrides/blocks must be logged with:
  - who, when
  - what changed (before/after)
  - team affected
  - reason (if provided)

---

## 9. Non-Functional Requirements
- **Performance:** team selection and availability bundle load should feel fast (target < 2 seconds typical).
- **Security:** strict RBAC; no cross-team edits without permission.
- **Reliability:** transactional writes; no partial updates.
- **Time zones:** date computations respect team timezone.

---

## 10. Open Questions / To Validate on Next Screens
1. Does base schedule include time windows per day or capacity-only?
2. Are overrides and blocks date-only or time-granular?
3. Precedence rules: block vs override; override vs base; overlapping overrides.
4. What does “All Teams Schedule” mean—does it show aggregated or default until team selected?
5. Where is audit/history surfaced in the UI (History nav exists)?
