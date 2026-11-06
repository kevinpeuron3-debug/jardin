import { Planting, PlantCatalogItem } from '../types/garden';
import { PLANT_CATALOG } from '../data/plantCatalog';

export function getWateringStatus(planting: Planting): {
  isOverdue: boolean;
  isDueToday: boolean;
  daysSinceLastWater: number;
  label: string;
  badgeClass: string;
} {
  if (!planting.lastWatered) {
    return {
      isOverdue: true,
      isDueToday: true,
      daysSinceLastWater: 999,
      label: 'Jamais arrosé',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    };
  }

  const lastWateredDate = new Date(planting.lastWatered);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - lastWateredDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const frequency = planting.wateringFrequencyDays || 2;
  const isOverdue = diffDays > frequency;
  const isDueToday = diffDays === frequency;

  if (isOverdue) {
    const lateDays = diffDays - frequency;
    return {
      isOverdue: true,
      isDueToday: false,
      daysSinceLastWater: diffDays,
      label: `En retard de ${lateDays} j`,
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
    };
  }

  if (isDueToday) {
    return {
      isOverdue: false,
      isDueToday: true,
      daysSinceLastWater: diffDays,
      label: 'À arroser aujourd\'hui',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  }

  const daysLeft = frequency - diffDays;
  return {
    isOverdue: false,
    isDueToday: false,
    daysSinceLastWater: diffDays,
    label: `Arrosé (encore ${daysLeft} j)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };
}

export function findCatalogPlant(name: string): PlantCatalogItem | undefined {
  const clean = name.toLowerCase().trim();
  return PLANT_CATALOG.find(
    (p) => p.name.toLowerCase().includes(clean) || clean.includes(p.name.toLowerCase())
  );
}

export function formatDateFR(dateString?: string): string {
  if (!dateString) return 'Non renseigné';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getCurrentSeasonFR(): {
  season: 'Printemps' | 'Été' | 'Automne' | 'Hiver';
  monthName: string;
  gardeningTip: string;
} {
  const date = new Date();
  const month = date.getMonth(); // 0 to 11

  const tips: Record<string, string> = {
    Printemps: 'Plein boom des semis ! Aérez les serres en journée et surveillez les dernières gelées avant les Saints de Glace.',
    Été: 'Arrosez tôt le matin ou le soir au pied sans mouiller le feuillage. Paillez abondamment pour limiter l\'évaporation.',
    Automne: 'Récolte des courges et légumes racines. Semis d\'engrais verts (moutarde, trèfle) pour nourrir et protéger la terre.',
    Hiver: 'Repos végétatif, planification du plan de jardin, nettoyage et affûtage des outils, enrichissement au compost mûr.'
  };

  let season: 'Printemps' | 'Été' | 'Automne' | 'Hiver' = 'Printemps';
  if (month >= 2 && month <= 4) season = 'Printemps';
  else if (month >= 5 && month <= 7) season = 'Été';
  else if (month >= 8 && month <= 10) season = 'Automne';
  else season = 'Hiver';

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return {
    season,
    monthName: monthNames[month],
    gardeningTip: tips[season]
  };
}
