-- Add member integration fields to act_registration table
ALTER TABLE act_registration ADD COLUMN member_id BIGINT;
ALTER TABLE act_registration ADD COLUMN is_member_registration BOOLEAN DEFAULT FALSE;

-- Create index for member_id lookup
CREATE INDEX idx_act_registration_member_id ON act_registration(member_id);

-- Add comment for clarity
COMMENT ON COLUMN act_registration.member_id IS 'Reference to mbr_member.id if registrant is a member';
COMMENT ON COLUMN act_registration.is_member_registration IS 'Whether this registration was made by a member';
