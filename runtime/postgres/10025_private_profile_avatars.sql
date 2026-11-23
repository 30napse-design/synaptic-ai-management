-- Private profile photos for the Hostinger PostgreSQL runtime only.
-- Additive schema: no changes to existing members, sessions, or profile fields.
CREATE TABLE IF NOT EXISTS staff_profile_avatars (
  member_id text PRIMARY KEY,
  mime_type text NOT NULL CHECK (mime_type IN ('image/png', 'image/jpeg')),
  image_data bytea NOT NULL CHECK (octet_length(image_data) BETWEEN 1 AND 2097152),
  updated_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON TABLE staff_profile_avatars FROM PUBLIC;
