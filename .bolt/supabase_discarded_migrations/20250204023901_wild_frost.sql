/*
  # Update RLS policies for development

  1. Changes
    - Allow all authenticated users to modify product types and change types
    - Remove admin-only restrictions temporarily
    - Keep basic authentication checks

  Note: These policies should be updated with proper role checks before production
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Only admins can modify product types" ON product_types;
DROP POLICY IF EXISTS "Only admins can modify change types" ON change_types;

-- Create new development policies
CREATE POLICY "Authenticated users can modify product types"
  ON product_types
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can modify change types"
  ON change_types
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);