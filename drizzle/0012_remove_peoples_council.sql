-- Remove step_9_peoples_council from application_status enum
-- and peoples_council from user_role enum

-- Agar step_9 da turgan arizalar bo'lsa, completed ga o'tkazamiz
UPDATE applications SET current_status = 'completed' WHERE current_status = 'step_9_peoples_council';
UPDATE application_history SET from_status = 'completed' WHERE from_status = 'step_9_peoples_council';
UPDATE application_history SET to_status = 'completed' WHERE to_status = 'step_9_peoples_council';

-- peoples_council rolini admin ga o'tkazamiz
UPDATE users SET role = 'admin' WHERE role = 'peoples_council';

-- application_status enum yangilash
ALTER TYPE application_status RENAME TO application_status_old;
CREATE TYPE application_status AS ENUM (
  'step_1_geometry_uploaded',
  'step_1_1_dkp_regional',
  'step_1_2_dkp_coordination',
  'step_2_district_hokimlik',
  'step_2_public_discussion',
  'step_2_1_district_commission',
  'step_2_2_regional_commission',
  'step_3_regional_hokimlik',
  'step_4_kadastr_agency',
  'step_5_dkp_central',
  'step_6_kadastr_agency_final',
  'step_7_regional_hokimlik',
  'step_8_district_hokimlik',
  'completed',
  'rejected'
);
ALTER TABLE applications
  ALTER COLUMN current_status TYPE application_status
  USING current_status::text::application_status;
ALTER TABLE application_history
  ALTER COLUMN from_status TYPE application_status
  USING from_status::text::application_status;
ALTER TABLE application_history
  ALTER COLUMN to_status TYPE application_status
  USING to_status::text::application_status;
DROP TYPE application_status_old;

-- user_role enum yangilash
ALTER TYPE user_role RENAME TO user_role_old;
CREATE TYPE user_role AS ENUM (
  'admin',
  'dkp_filial',
  'dkp_regional',
  'dkp_central',
  'district_commission',
  'district_hokimlik',
  'regional_commission',
  'regional_hokimlik',
  'kadastr_agency'
);
ALTER TABLE users
  ALTER COLUMN role TYPE user_role
  USING role::text::user_role;
DROP TYPE user_role_old;
