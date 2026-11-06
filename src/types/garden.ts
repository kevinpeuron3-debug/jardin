export type SunExposure = 'full_sun' | 'partial_shade' | 'shade';
export type SoilType = 'clay' | 'sandy' | 'loam' | 'compost_rich' | 'potting_soil';
export type PlotShape = 'rectangle' | 'square' | 'row' | 'raised_bed' | 'pot' | 'greenhouse';

export interface Plot {
  id: string;
  userId: string;
  name: string;
  shape: PlotShape;
  widthMeters?: number;
  lengthMeters?: number;
  sunExposure: SunExposure;
  soilType: SoilType;
  color: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PlantStatus = 
  | 'planned' 
  | 'sown' 
  | 'sprouted' 
  | 'transplanted' 
  | 'growing' 
  | 'harvesting' 
  | 'finished';

export type PlantCategory = 
  | 'vegetable' 
  | 'fruit' 
  | 'herb' 
  | 'flower' 
  | 'legume' 
  | 'root';

export interface Planting {
  id: string;
  userId: string;
  plotId: string;
  plantName: string;
  category: PlantCategory;
  variety?: string;
  status: PlantStatus;
  quantity?: number;
  dateSown?: string;
  datePlanted?: string;
  expectedHarvestDate?: string;
  wateringFrequencyDays: number; // e.g. 2 for every 2 days
  lastWatered?: string; // ISO date string
  companionGood?: string;
  companionBad?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Harvest {
  id: string;
  userId: string;
  plantingId: string;
  plantName: string;
  plotId?: string;
  date: string;
  weightKg?: number;
  quantityCount?: number;
  qualityRating?: number; // 1 to 5
  notes?: string;
  createdAt: string;
}

export type TaskCategory = 
  | 'watering' 
  | 'pruning' 
  | 'sowing' 
  | 'transplanting' 
  | 'weeding' 
  | 'fertilizing' 
  | 'treatment' 
  | 'harvest' 
  | 'mulching';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface GardenTask {
  id: string;
  userId: string;
  title: string;
  category: TaskCategory;
  dueDate?: string;
  plotId?: string;
  plantingId?: string;
  completed: boolean;
  completedAt?: string;
  priority: TaskPriority;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  gardenName?: string;
  region?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PlantCatalogItem {
  id: string;
  name: string;
  latinName: string;
  category: PlantCategory;
  icon: string;
  defaultWateringDays: number;
  waterNeed: 'faible' | 'moyen' | 'élevé';
  sunNeed: SunExposure;
  daysToHarvest: number;
  sowIndoorsMonths: number[]; // 1 to 12
  sowOutdoorsMonths: number[]; // 1 to 12
  harvestMonths: number[]; // 1 to 12
  goodCompanions: string[];
  badCompanions: string[];
  advice: string;
}
