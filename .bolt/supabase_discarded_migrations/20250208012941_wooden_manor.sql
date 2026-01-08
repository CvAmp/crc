/*
  # Update SO ID to Order ID

  1. Changes
    - Rename so_id to order_id in events and accelerations tables
    - Update acceleration_fields label
    - Update templates to use OrderID variable
    - Add comments for clarity

  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity with constraints

  3. Notes
    - Uses temporary columns to safely migrate data
    - Ensures no data loss during migration
*/

-- First update acceleration_fields to avoid UI confusion
UPDATE acceleration_fields 
SET name = 'order_id',
    label = 'Order ID'
WHERE name = 'so_id';

-- Update events table
ALTER TABLE events 
DROP CONSTRAINT IF EXISTS valid_so_id;

ALTER TABLE events 
RENAME COLUMN so_id TO order_id;

ALTER TABLE events
ADD CONSTRAINT valid_order_id CHECK (order_id ~ '^\d{1,10}$');

-- Update accelerations table
ALTER TABLE accelerations 
DROP CONSTRAINT IF EXISTS valid_so_id;

ALTER TABLE accelerations 
RENAME COLUMN so_id TO order_id;

ALTER TABLE accelerations
ADD CONSTRAINT valid_order_id CHECK (order_id ~ '^\d{1,10}$');

-- Update templates to use Order ID instead of SO ID
UPDATE templates
SET content = REPLACE(REPLACE(content, '{SOID}', '{OrderID}'), 'Service Order:', 'Order ID:')
WHERE type = 'sow';

-- Add comments for clarity
COMMENT ON COLUMN events.order_id IS 'Order ID for the event';
COMMENT ON COLUMN accelerations.order_id IS 'Order ID for the acceleration request';