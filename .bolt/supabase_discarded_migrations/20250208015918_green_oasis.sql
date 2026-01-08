-- Create sequence for event_id
CREATE SEQUENCE IF NOT EXISTS event_id_seq;

-- Create events table
CREATE TABLE events (
  event_id bigint PRIMARY KEY DEFAULT nextval('event_id_seq'),
  id uuid UNIQUE DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id) NOT NULL,
  product_type uuid NOT NULL,
  change_types uuid[] NOT NULL,
  so_id text NOT NULL,
  sr_id text NOT NULL,
  customer_name text NOT NULL,
  customer_address text NOT NULL,
  bridge text,
  notes text,
  needs_fso_dispatch boolean DEFAULT false,
  sow_details text,
  teams_meeting_id text,
  teams_meeting_url text,
  teams_meeting_created_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_so_id CHECK (so_id ~ '^\d{1,10}$')
);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create read policy for authenticated users
CREATE POLICY "events_read_policy"
  ON events
  FOR SELECT
  TO authenticated
  USING (true);

-- Create write policy for authenticated users
CREATE POLICY "events_write_policy"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Grant necessary permissions
GRANT SELECT, INSERT ON events TO authenticated;
GRANT USAGE ON SEQUENCE event_id_seq TO authenticated;

-- Create product_types table
CREATE TABLE product_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create change_types table
CREATE TABLE change_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  product_type_id uuid REFERENCES product_types(id) ON DELETE CASCADE NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  is_exclusive boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT positive_duration CHECK (duration_minutes > 0)
);

-- Enable RLS for product and change types
ALTER TABLE product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_types ENABLE ROW LEVEL SECURITY;

-- Create read policies
CREATE POLICY "product_types_read_policy"
  ON product_types
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "change_types_read_policy"
  ON change_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Create write policies for admin users
CREATE POLICY "product_types_write_policy"
  ON product_types
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN'
  )
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN'
  );

CREATE POLICY "change_types_write_policy"
  ON change_types
  FOR ALL
  TO authenticated
  USING (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN'
  )
  WITH CHECK (
    auth.jwt() -> 'user_metadata' ->> 'role' = 'ADMIN'
  );

-- Grant permissions
GRANT SELECT ON product_types TO authenticated;
GRANT SELECT ON change_types TO authenticated;

-- Insert sample product type
INSERT INTO product_types (name) VALUES ('Standard Service');

-- Insert sample change types
INSERT INTO change_types (name, product_type_id, duration_minutes, is_exclusive)
SELECT 
  name,
  (SELECT id FROM product_types WHERE name = 'Standard Service'),
  duration_minutes,
  is_exclusive
FROM (
  VALUES 
    ('Installation', 60, false),
    ('Configuration', 30, false),
    ('Emergency Maintenance', 120, true),
    ('Software Update', 60, false)
) as changes(name, duration_minutes, is_exclusive);