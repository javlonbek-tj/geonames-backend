// 9 step workflow chart
// For each status: which action, who can do it, next status

import { APP_STATUS } from '../../constants/app-status';

type ActionType = 'submit' | 'approve' | 'return' | 'reject';

type Transition = {
  allowedRole: string;
  nextStatus: string;
  actionType: ActionType;
  label: string;
};

type TransitionMap = Record<string, Record<string, Transition>>;

export const WORKFLOW: TransitionMap = {
  // Step 1: DKP filial - uploads geojson => DKP regional
  [APP_STATUS.STEP_1_GEOMETRY_UPLOADED]: {
    submit: {
      allowedRole: 'dkp_filial',
      nextStatus: APP_STATUS.STEP_1_1_DKP_REGIONAL,
      actionType: 'submit',
      label: 'GeoJSON yuklandi, Viloyat DKP kelishishiga yuborish',
    },
  },

  // STEP 1.1: DKP regional — reviews → DKP central
  [APP_STATUS.STEP_1_1_DKP_REGIONAL]: {
    submit: {
      allowedRole: 'dkp_regional',
      nextStatus: APP_STATUS.STEP_1_2_DKP_COORDINATION,
      actionType: 'submit',
      label: "Ko'rib chiqildi, Respublika DKP kelishishiga yuborish",
    },
    return: {
      allowedRole: 'dkp_regional',
      nextStatus: APP_STATUS.STEP_1_GEOMETRY_UPLOADED,
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun DKP filialga qaytarish",
    },
  },

  // STEP 1.2: DKP central — approves → district administration
  [APP_STATUS.STEP_1_2_DKP_COORDINATION]: {
    submit: {
      allowedRole: 'dkp_central',
      nextStatus: APP_STATUS.STEP_2_DISTRICT_HOKIMLIK,
      actionType: 'submit',
      label: 'Kelishildi, tuman hokimligiga yuborish',
    },
    return: {
      allowedRole: 'dkp_central',
      nextStatus: APP_STATUS.STEP_1_1_DKP_REGIONAL,
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun Viloyat DKP ga qaytarish",
    },
  },

  // Step 2: District administration - gives a name, public discussion
  [APP_STATUS.STEP_2_DISTRICT_HOKIMLIK]: {
    submit: {
      allowedRole: 'district_hokimlik',
      nextStatus: APP_STATUS.STEP_2_PUBLIC_DISCUSSION,
      actionType: 'submit',
      label: 'Nom berildi, ommaviy muhokamaga yuborish (10 kun)',
    },
  },

  // Step 2.0: Public discussion = district administration sends to commission
  [APP_STATUS.STEP_2_PUBLIC_DISCUSSION]: {
    submit: {
      allowedRole: 'district_hokimlik',
      nextStatus: APP_STATUS.STEP_2_1_DISTRICT_COMMISSION,
      actionType: 'submit',
      label: 'Ommaviy muhokama tugadi, tuman komissiyasiga yuborish',
    },
  },

  // Step 2.1: District commission members vote (via /commission endpoint)
  // If all approved — district hokimlik submits to regional commission
  // If any rejected — district hokimlik presses reject to finalize the application
  [APP_STATUS.STEP_2_1_DISTRICT_COMMISSION]: {
    submit: {
      allowedRole: 'district_hokimlik',
      nextStatus: APP_STATUS.STEP_2_2_REGIONAL_COMMISSION,
      actionType: 'submit',
      label: 'Tuman komissiyasi kelishdi, viloyat komissiyasiga yuborish',
    },
    reject: {
      allowedRole: 'district_hokimlik',
      nextStatus: APP_STATUS.REJECTED,
      actionType: 'reject',
      label: 'Tuman komissiyasi rad etdi — arizani yakunlash',
    },
  },

  // Step 2.2: Regional commission — conclusion → regional administration
  [APP_STATUS.STEP_2_2_REGIONAL_COMMISSION]: {
    submit: {
      allowedRole: 'regional_commission',
      nextStatus: APP_STATUS.STEP_3_REGIONAL_HOKIMLIK,
      actionType: 'submit',
      label: 'Viloyat komissiya xulosasi kiritildi, viloyat hokimligiga yuborish',
    },
  },

  // Step 3: Regional administration → Cadastre agency
  [APP_STATUS.STEP_3_REGIONAL_HOKIMLIK]: {
    submit: {
      allowedRole: 'regional_hokimlik',
      nextStatus: APP_STATUS.STEP_4_KADASTR_AGENCY,
      actionType: 'submit',
      label: 'Kadastr agentligiga davlat ekspertizasi uchun yuborish',
    },
  },

  // Step 4: Cadastre agency → DKP central or return to regional administration
  [APP_STATUS.STEP_4_KADASTR_AGENCY]: {
    approve: {
      allowedRole: 'kadastr_agency',
      nextStatus: APP_STATUS.STEP_5_DKP_CENTRAL,
      actionType: 'approve',
      label: 'DKP markaziy apparatga davlat ekspertizasi uchun yuborish',
    },
    return: {
      allowedRole: 'kadastr_agency',
      nextStatus: APP_STATUS.STEP_3_REGIONAL_HOKIMLIK,
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun viloyat hokimligiga qaytarish",
    },
  },

  // Step 5: DKP central → Cadastre agency
  [APP_STATUS.STEP_5_DKP_CENTRAL]: {
    submit: {
      allowedRole: 'dkp_central',
      nextStatus: APP_STATUS.STEP_6_KADASTR_AGENCY_FINAL,
      actionType: 'submit',
      label: 'Davlat ekspertizasi xulosasi kiritildi, Kadastr agentligiga yuborish',
    },
  },

  // Step 6: Cadastre agency final → approve or return to DKP central
  [APP_STATUS.STEP_6_KADASTR_AGENCY_FINAL]: {
    approve: {
      allowedRole: 'kadastr_agency',
      nextStatus: APP_STATUS.STEP_7_REGIONAL_HOKIMLIK,
      actionType: 'approve',
      label: 'Tasdiqlandi, viloyat hokimligiga rasmiy xat bilan yuborish',
    },
    return: {
      allowedRole: 'kadastr_agency',
      nextStatus: APP_STATUS.STEP_5_DKP_CENTRAL,
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun DKP markaziy apparatga qaytarish",
    },
  },

  // Step 7: Regional administration — draft decision → district administration
  [APP_STATUS.STEP_7_REGIONAL_HOKIMLIK]: {
    submit: {
      allowedRole: 'regional_hokimlik',
      nextStatus: APP_STATUS.STEP_8_DISTRICT_HOKIMLIK,
      actionType: 'submit',
      label: 'Tuman hokimligiga muhokama uchun yuborish',
    },
  },

  // Step 8: District administration — uploads council decision PDF and finalizes
  [APP_STATUS.STEP_8_DISTRICT_HOKIMLIK]: {
    approve: {
      allowedRole: 'district_hokimlik',
      nextStatus: APP_STATUS.COMPLETED,
      actionType: 'approve',
      label: 'Yakunlash',
    },
    return: {
      allowedRole: 'district_hokimlik',
      nextStatus: APP_STATUS.STEP_2_1_DISTRICT_COMMISSION,
      actionType: 'return',
      label: "Qayta ko'rib chiqish uchun tuman komissiyasiga qaytarish",
    },
  },
};

export function getAvailableActions(
  status: string,
): Record<string, Transition> {
  return WORKFLOW[status] ?? {};
}

export function resolveTransition(
  status: string,
  action: string,
  userRole: string,
): Transition {
  const transitions = WORKFLOW[status];
  if (!transitions) {
    throw new Error(`"${status}" holati uchun harakat mavjud emas`);
  }
  const transition = transitions[action];
  if (!transition) {
    throw new Error(`"${status}" holatida "${action}" harakati mavjud emas`);
  }
  if (transition.allowedRole !== userRole) {
    throw new Error(`Bu harakatni bajarish uchun ruxsat yo'q`);
  }
  return transition;
}
