/*
  # Add Row Level Security Policies
  
  This migration adds RLS policies to control access to tables based on user roles.
  
  1. Teams Policies
     - Admins have full access
     - Managers can view their team
     - Users can view their own team
  
  2. Users Policies
     - Admins have full access
     - Managers can view team members
     - Users can view own profile
  
  3. Events Policies
     - Admins have full access
     - Users can manage own events
     - Users can view team events
  
  4. Product Types Policies
     - Admins have full access
     - Users can view product types
  
  5. Change Types Policies
     - Admins have full access
     - Users can view change types
  
  6. Templates Policies
     - Admins have full access
     - Users can view templates
  
  7. Time Off Requests Policies
     - Users can manage own requests
     - Managers can approve team requests
  
  8. Blocked Dates Policies
     - Admins have full access
     - Users can view blocked dates
  
  9. Standard Slots Policies
     - Admins have full access
     - Users can view slots
*/

-- Teams Policies
CREATE POLICY "Admins have full access to teams"
ON teams
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Managers can view their team"
ON teams
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.user_id = auth.uid()
    AND team_members.role IN ('CPM_MANAGER', 'ENGINEER_MANAGER')
  )
);

CREATE POLICY "Users can view their own team"
ON teams
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.user_id = auth.uid()
  )
);

-- Users Policies
CREATE POLICY "Admins have full access to users"
ON users
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Managers can view team members"
ON users
FOR SELECT
TO authenticated
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.user_id = auth.uid()
    AND team_members.role IN ('CPM_MANAGER', 'ENGINEER_MANAGER')
  )
);

CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Team Members Policies
CREATE POLICY "Admins have full access to team members"
ON team_members
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view own team membership"
ON team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Events Policies
CREATE POLICY "Admins have full access to events"
ON events
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can manage own events"
ON events
FOR ALL
TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can view team events"
ON events
FOR SELECT
TO authenticated
USING (
  team_id IN (
    SELECT team_members.team_id
    FROM team_members
    WHERE team_members.user_id = auth.uid()
  )
);

-- Product Types Policies
CREATE POLICY "Admins have full access to product types"
ON product_types
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view product types"
ON product_types
FOR SELECT
TO authenticated
USING (true);

-- Change Types Policies
CREATE POLICY "Admins have full access to change types"
ON change_types
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view change types"
ON change_types
FOR SELECT
TO authenticated
USING (true);

-- Templates Policies
CREATE POLICY "Admins have full access to templates"
ON templates
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view templates"
ON templates
FOR SELECT
TO authenticated
USING (true);

-- Time Off Requests Policies
CREATE POLICY "Users can manage own time off requests"
ON time_off_requests
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Managers can view and approve team requests"
ON time_off_requests
FOR ALL
TO authenticated
USING (
  user_id IN (
    SELECT u.id
    FROM users u
    INNER JOIN team_members tm ON tm.team_id = u.team_id
    WHERE tm.user_id = auth.uid()
    AND tm.role IN ('CPM_MANAGER', 'ENGINEER_MANAGER')
  )
);

-- Blocked Dates Policies
CREATE POLICY "Admins have full access to blocked dates"
ON blocked_dates
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view blocked dates"
ON blocked_dates
FOR SELECT
TO authenticated
USING (true);

-- Standard Slots Policies
CREATE POLICY "Admins have full access to standard slots"
ON standard_slots
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view standard slots"
ON standard_slots
FOR SELECT
TO authenticated
USING (true);

-- Access Audit Logs Policies
CREATE POLICY "Admins have full access to audit logs"
ON access_audit_logs
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text)
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'ADMIN'::text);

CREATE POLICY "Users can view own audit logs"
ON access_audit_logs
FOR SELECT
TO authenticated
USING (performed_by = auth.uid());