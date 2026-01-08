# Engineering Design Doc — Calendar Tool: Modify Availability

## 1. Summary
This document describes the technical design for the **Admin → Modify Availability** feature. It covers:
- UI component structure and state management
- Data model and API contracts
- Derived “Total Capacity” computation rules
- RBAC and auditing requirements
- Testing strategy

> **Note:** This design is based on the provided screenshot plus reasonable assumptions for a scheduling/capacity tool. Items flagged **Assumption** should be verified against actual CRC behavior and APIs once additional screens are available.

---

## 2. Architecture (Assumed)
- **Frontend:** SPA (React/Angular) with client routing
- **Backend:** API service (REST or GraphQL)
- **Auth:** SSO (e.g., Azure AD) providing identity + role claims
- **Data store:** Relational database (recommended) + audit event log

---

## 3. UI / Component Design

### 3.1 Page Component: `ModifyAvailabilityPage`
**Responsibilities:**
- Manage team selection context
- Fetch and render availability configuration
- Provide CRUD entry points for overrides and blocked dates
- Render base schedule and derived totals

**State (example):**
- `selectedTeamId: string | null`
- `roleContext: string`
- `userContext: string`
- `isImpersonating: boolean`
- `data: { baseSchedule, overrides, blocks }`
- `derivedTotalsByWeekday`
- `loading: { teams, bundle, saveBase, saveOverride, saveBlock }`
- `errors: { teams, bundle, base, overrides, blocks }`
- `dirtyFlags: { baseScheduleDirty }`

**Child Components:**
- `TeamSelectionDropdown`
- `AllTeamsScheduleCard`
- `CapacityOverridesCard`
- `BlockedDatesPanel`

---

### 3.2 Team Selection Dropdown
**Behavior:**
- Fetch manageable teams for the current role/user context.
- On change:
  - cancel any in-flight bundle fetch
  - reset errors/dirty state
  - fetch availability bundle for selected team

**Empty/Disabled States:**
- If no team selected: show default placeholder; keep right-side panels disabled.

---

### 3.3 All Teams Schedule Card
**Displays:**
- Weekday list (Mon–Sun)
- Base Schedule column
- Total Capacity column

**Assumption:** totals and base values populate only after selecting a team.

**Editing (if supported):**
- Inline per-day editing or modal editor
- Save/Cancel actions
- Unsaved changes guard

---

### 3.4 Capacity Overrides Card
**Disabled until team selected.**  
When enabled:
- List existing overrides (active and future; optionally past)
- Create/edit/delete actions via modal/drawer

---

### 3.5 Blocked Dates Panel
**Disabled until team selected.**  
When enabled:
- Show blocked periods in list or calendar-like UI
- Create/edit/delete actions via modal/drawer

---

## 4. Data Model (Proposed)

### 4.1 Team
- `id: string`
- `name: string`
- `timezone: string` (IANA, e.g., `America/New_York`)
- `status: enum(active|inactive)`

### 4.2 BaseWeeklySchedule
- `team_id: string`
- `weekday: int` (0–6)
- `enabled: boolean`
- `capacity: int`
- `version: string|int` (optimistic concurrency)

**Assumption:** capacity is numeric per day. If time-granular, add:
- `start_time`, `end_time` (local time)
- multiple segments per day (requires separate table)

### 4.3 CapacityOverride
- `id: string`
- `team_id: string`
- `start_date: date`
- `end_date: date`
- `weekday_mask: int|null` (bitmask optional)
- `type: enum(ABSOLUTE|DELTA)`
- `value: int`
- `reason: string|null`
- `created_by: string`
- `created_at: datetime`
- `updated_by: string`
- `updated_at: datetime`

### 4.4 BlockedDate
- `id: string`
- `team_id: string`
- `start: date|datetime`
- `end: date|datetime`
- `reason: string|null`
- `created_by, created_at, updated_by, updated_at`

### 4.5 AuditEvent
- `id: string`
- `actor_user_id: string`
- `impersonated_user_id: string|null`
- `action: enum(CREATE|UPDATE|DELETE)`
- `entity_type: enum(BASE_SCHEDULE|CAPACITY_OVERRIDE|BLOCKED_DATE)`
- `entity_id: string`
- `before: json`
- `after: json`
- `reason: string|null`
- `timestamp: datetime`

---

## 5. API Design (Example)

### 5.1 Fetch Teams
`GET /api/teams?manageable=true`

Returns: list of teams visible to current context.

---

### 5.2 Fetch Availability Bundle (Preferred)
`GET /api/availability?teamId={teamId}`

Returns:
- `baseWeeklySchedule[]`
- `capacityOverrides[]`
- `blockedDates[]`
- `derivedTotalsByWeekday` (optional server-side)

Rationale:
- One round trip after team selection
- Single cache key for the page

---

### 5.3 Update Base Schedule
`PUT /api/availability/base-schedule`

Payload:
```json
{
  "teamId": "T123",
  "version": "17",
  "entries": [
    { "weekday": 1, "enabled": true, "capacity": 8 },
    { "weekday": 2, "enabled": true, "capacity": 8 }
  ]
}
