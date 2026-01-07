-- Add registration time fields to activity table
ALTER TABLE act_activity ADD COLUMN registration_start_date DATE;
ALTER TABLE act_activity ADD COLUMN registration_start_time TIME;
ALTER TABLE act_activity ADD COLUMN registration_end_date DATE;
ALTER TABLE act_activity ADD COLUMN registration_end_time TIME;

-- Add indexes for registration time queries
CREATE INDEX idx_activity_reg_end_date ON act_activity(registration_end_date);
