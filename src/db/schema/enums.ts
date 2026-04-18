import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'admin', // System administrator
  'dkp_filial', // DKP district branch — step 1
  'dkp_regional', // DKP regional branch — step 1.1
  'dkp_central', // DKP central (republic level) — steps 1.2, 5
  'district_commission', // District commission — step 2.1
  'district_hokimlik', // District administration — steps 2, 8
  'regional_commission', // Regional commission — step 2.2
  'regional_hokimlik', // Regional administration — steps 3, 7
  'kadastr_agency', // Cadastre agency — steps 4, 6
]);

// Apllication status workflow steps (9 steps)
export const applicationStatusEnum = pgEnum('application_status', [
  // 1.0: DKP district branch geometry upload
  'step_1_geometry_uploaded',
  // 1.1: DKP regional branch — approval
  'step_1_1_dkp_regional',
  // 1.2: DKP central (republic) — approval
  'step_1_2_dkp_coordination',
  // 2: District administration (send to commission for approval)
  'step_2_district_hokimlik',
  // 2.0: Public discussion — 10 days for citizens to vote
  'step_2_public_discussion',
  // 2.1: District commission — approval, send to regional commission
  'step_2_1_district_commission',
  // 2.2: Regional commission — approval, send to regional administration
  'step_2_2_regional_commission',
  // 3: Regional administration — approval, send to cadastral agency
  'step_3_regional_hokimlik',
  // 4: Cadastral agency — approval, send to DKP central or return back to regional administration
  'step_4_kadastr_agency',
  // 5: DKP central — approval, send to cadastral agency
  'step_5_dkp_central',
  // 6: Cadastral agency — approval, and send back to regional administration or return back to DKP central
  'step_6_kadastr_agency_final',
  // 7: Regional administration — send to district administration
  'step_7_regional_hokimlik',
  // 8: District administration — upload docs and finish
  'step_8_district_hokimlik',
  'completed',
  'rejected',
]);

export const actionTypeEnum = pgEnum('action_type', [
  'submit',
  'approve',
  'reject',
  'return',
]);

export const documentTypeEnum = pgEnum('document_type', [
  'geometry_file',
  'attachment',
]);

export const commissionPositionEnum = pgEnum('commission_position', [
  'hokim',
  'hokim_deputy',
  'economics_head',
  'construction_head',
  'poverty_head',
  'ecology_head',
  'culture_head',
  'spirituality_head',
  'newspaper_head',
  'dkp_head',
  'historian',
  'linguist',
  'geographer',
]);
