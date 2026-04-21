/**
 * Common deadline presets (Italian focus) — quick-fill titles
 * on the event form when eventType === 'scadenza'.
 */

export interface DeadlinePreset {
  id: string;
  icon: string;
  categoryId?: string; // suggested category id from DEFAULT_CATEGORIES
  /** Suggested recurrence. 'yearly' for things that repeat every year. */
  recurrence?: 'none' | 'yearly' | 'monthly';
  names: { it: string; en: string; es: string; fr: string; de: string };
}

export const DEADLINE_PRESETS: DeadlinePreset[] = [
  {
    id: 'bolletta-luce',
    icon: '💡',
    categoryId: 'cat-bills',
    recurrence: 'monthly',
    names: {
      it: 'Bolletta luce',
      en: 'Electricity bill',
      es: 'Factura de luz',
      fr: "Facture d'électricité",
      de: 'Stromrechnung',
    },
  },
  {
    id: 'bolletta-gas',
    icon: '🔥',
    categoryId: 'cat-bills',
    recurrence: 'monthly',
    names: {
      it: 'Bolletta gas',
      en: 'Gas bill',
      es: 'Factura de gas',
      fr: 'Facture de gaz',
      de: 'Gasrechnung',
    },
  },
  {
    id: 'bolletta-acqua',
    icon: '💧',
    categoryId: 'cat-bills',
    recurrence: 'monthly',
    names: {
      it: 'Bolletta acqua',
      en: 'Water bill',
      es: 'Factura de agua',
      fr: "Facture d'eau",
      de: 'Wasserrechnung',
    },
  },
  {
    id: 'canone-tv',
    icon: '📺',
    categoryId: 'cat-bills',
    recurrence: 'yearly',
    names: {
      it: 'Canone TV',
      en: 'TV licence fee',
      es: 'Tasa de TV',
      fr: 'Redevance TV',
      de: 'Rundfunkbeitrag',
    },
  },
  {
    id: 'rca-auto',
    icon: '🚗',
    recurrence: 'yearly',
    names: {
      it: 'RCA auto',
      en: 'Car insurance',
      es: 'Seguro del coche',
      fr: 'Assurance auto',
      de: 'Kfz-Versicherung',
    },
  },
  {
    id: 'bollo-auto',
    icon: '🧾',
    recurrence: 'yearly',
    names: {
      it: 'Bollo auto',
      en: 'Vehicle tax',
      es: 'Impuesto de circulación',
      fr: 'Taxe véhicule',
      de: 'Kfz-Steuer',
    },
  },
  {
    id: 'revisione-auto',
    icon: '🔧',
    recurrence: 'yearly',
    names: {
      it: 'Revisione auto',
      en: 'Vehicle inspection',
      es: 'ITV / Inspección',
      fr: 'Contrôle technique',
      de: 'TÜV / Inspektion',
    },
  },
  {
    id: 'assicurazione-casa',
    icon: '🏠',
    recurrence: 'yearly',
    names: {
      it: 'Assicurazione casa',
      en: 'Home insurance',
      es: 'Seguro del hogar',
      fr: 'Assurance habitation',
      de: 'Hausratversicherung',
    },
  },
  {
    id: 'imu-tari',
    icon: '🏛️',
    recurrence: 'yearly',
    names: {
      it: 'IMU / TARI',
      en: 'Property tax',
      es: 'Impuestos locales',
      fr: 'Taxe foncière',
      de: 'Grundsteuer',
    },
  },
  {
    id: 'abbonamento',
    icon: '🔁',
    recurrence: 'monthly',
    names: {
      it: 'Abbonamento',
      en: 'Subscription',
      es: 'Suscripción',
      fr: 'Abonnement',
      de: 'Abonnement',
    },
  },
  {
    id: 'visita-medica',
    icon: '🩺',
    names: {
      it: 'Visita medica',
      en: 'Medical appointment',
      es: 'Cita médica',
      fr: 'Rendez-vous médical',
      de: 'Arzttermin',
    },
  },
  {
    id: 'condominio',
    icon: '🏢',
    categoryId: 'cat-bills',
    recurrence: 'monthly',
    names: {
      it: 'Spese condominio',
      en: 'HOA fees',
      es: 'Gastos de comunidad',
      fr: 'Charges copropriété',
      de: 'Hausgeld',
    },
  },
];

export function getPresetName(preset: DeadlinePreset, lang: string): string {
  const key = lang as keyof DeadlinePreset['names'];
  return preset.names[key] ?? preset.names.en ?? preset.names.it;
}
