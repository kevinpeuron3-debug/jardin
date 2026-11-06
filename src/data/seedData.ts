import { Plot, Planting, GardenTask, Harvest } from '../types/garden';

export function getStarterGarden(userId: string): {
  plots: Plot[];
  plantings: Planting[];
  tasks: GardenTask[];
  harvests: Harvest[];
} {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const twoDaysAgo = new Date(now.getTime() - 2 * 86400000).toISOString();
  const fiveDaysAgo = new Date(now.getTime() - 5 * 86400000).toISOString();

  const plot1Id = `plot_potager_sud_${Date.now()}`;
  const plot2Id = `plot_aromatiques_${Date.now() + 1}`;
  const plot3Id = `plot_carre_salades_${Date.now() + 2}`;

  const plots: Plot[] = [
    {
      id: plot1Id,
      userId,
      name: 'Grand Potager Soleil (Planche 1)',
      shape: 'rectangle',
      widthMeters: 1.2,
      lengthMeters: 3.5,
      sunExposure: 'full_sun',
      soilType: 'compost_rich',
      color: '#15803d',
      notes: 'Terre enrichie au compost mûr à l\'automne, paillée avec du foin.',
      createdAt: new Date().toISOString()
    },
    {
      id: plot2Id,
      userId,
      name: 'Carré Aromatiques & Fleurs',
      shape: 'square',
      widthMeters: 1.2,
      lengthMeters: 1.2,
      sunExposure: 'full_sun',
      soilType: 'loam',
      color: '#0284c7',
      notes: 'À proximité de la cuisine pour cueillette minute et accueil des pollinisateurs.',
      createdAt: new Date().toISOString()
    },
    {
      id: plot3Id,
      userId,
      name: 'Bac Mi-Ombre (Légumes feuilles)',
      shape: 'raised_bed',
      widthMeters: 0.8,
      lengthMeters: 2.0,
      sunExposure: 'partial_shade',
      soilType: 'potting_soil',
      color: '#d97706',
      notes: 'Protégé des fortes chaleurs de l\'après-midi.',
      createdAt: new Date().toISOString()
    }
  ];

  const plant1Id = `plant_tomate_${Date.now()}`;
  const plant2Id = `plant_basilic_${Date.now() + 1}`;
  const plant3Id = `plant_courgette_${Date.now() + 2}`;
  const plant4Id = `plant_radis_${Date.now() + 3}`;
  const plant5Id = `plant_fraisier_${Date.now() + 4}`;

  const plantings: Planting[] = [
    {
      id: plant1Id,
      userId,
      plotId: plot1Id,
      plantName: 'Tomate',
      category: 'vegetable',
      variety: 'Cœur de Bœuf & Marmande',
      status: 'growing',
      quantity: 6,
      dateSown: '2026-03-15',
      datePlanted: '2026-05-12',
      expectedHarvestDate: '2026-07-20',
      wateringFrequencyDays: 2,
      lastWatered: fiveDaysAgo, // overdue for watering!
      companionGood: 'Basilic, Œillet d\'Inde, Carotte',
      companionBad: 'Fenouil, Pomme de terre',
      notes: 'Boutons floraux bien formés. Arrosage au pied sans toucher le feuillage.',
      createdAt: new Date().toISOString()
    },
    {
      id: plant2Id,
      userId,
      plotId: plot1Id,
      plantName: 'Basilic',
      category: 'herb',
      variety: 'Grand Vert de Gênes',
      status: 'growing',
      quantity: 4,
      dateSown: '2026-04-05',
      datePlanted: '2026-05-14',
      expectedHarvestDate: '2026-06-15',
      wateringFrequencyDays: 2,
      lastWatered: twoDaysAgo,
      companionGood: 'Tomate, Poivron',
      companionBad: 'Rue officinale',
      notes: 'Planté au pied des tomates pour stimuler leur parfum et éloigner les mouches.',
      createdAt: new Date().toISOString()
    },
    {
      id: plant3Id,
      userId,
      plotId: plot1Id,
      plantName: 'Courgette',
      category: 'vegetable',
      variety: 'Black Beauty non coureuse',
      status: 'harvesting',
      quantity: 2,
      dateSown: '2026-04-10',
      datePlanted: '2026-05-10',
      expectedHarvestDate: '2026-06-25',
      wateringFrequencyDays: 2,
      lastWatered: twoDaysAgo,
      companionGood: 'Haricot vert, Maïs, Capucine',
      companionBad: 'Concombre',
      notes: 'Déjà 2 courgettes récoltées, très vigoureuse.',
      createdAt: new Date().toISOString()
    },
    {
      id: plant4Id,
      userId,
      plotId: plot3Id,
      plantName: 'Radis',
      category: 'root',
      variety: 'Rond écarlate à bout blanc',
      status: 'growing',
      quantity: 40,
      dateSown: '2026-05-20',
      datePlanted: '2026-05-20',
      expectedHarvestDate: '2026-06-15',
      wateringFrequencyDays: 2,
      lastWatered: fiveDaysAgo, // overdue!
      companionGood: 'Carotte, Laitue, Épinard',
      companionBad: 'Cerfeuil',
      notes: 'Bien arrosé pour garder une texture croquante sans piquant.',
      createdAt: new Date().toISOString()
    },
    {
      id: plant5Id,
      userId,
      plotId: plot2Id,
      plantName: 'Fraisier',
      category: 'fruit',
      variety: 'Mara des Bois (remontant)',
      status: 'harvesting',
      quantity: 8,
      datePlanted: '2026-03-20',
      expectedHarvestDate: '2026-06-01',
      wateringFrequencyDays: 3,
      lastWatered: twoDaysAgo,
      companionGood: 'Bourrache, Ail, Thym',
      companionBad: 'Chou',
      notes: 'Fraises parfumées, paillées avec aiguilles de pin et chanvre.',
      createdAt: new Date().toISOString()
    }
  ];

  const tasks: GardenTask[] = [
    {
      id: `task_water_tomatoes_${Date.now()}`,
      userId,
      title: 'Arroser généreusement les tomates et courgettes',
      category: 'watering',
      dueDate: todayStr,
      plotId: plot1Id,
      completed: false,
      priority: 'high',
      notes: 'Attention au feuillage, arroser en fin d\'après-midi.',
      createdAt: new Date().toISOString()
    },
    {
      id: `task_mulch_${Date.now() + 1}`,
      userId,
      title: 'Pailler le bac à salades contre l\'évaporation',
      category: 'mulching',
      dueDate: todayStr,
      plotId: plot3Id,
      completed: false,
      priority: 'medium',
      notes: 'Utiliser du paillis de lin ou de la tonte séchée.',
      createdAt: new Date().toISOString()
    },
    {
      id: `task_cut_basil_${Date.now() + 2}`,
      userId,
      title: 'Pincer le sommet du basilic',
      category: 'pruning',
      dueDate: todayStr,
      completed: true,
      completedAt: twoDaysAgo,
      priority: 'low',
      notes: 'Pour l\'inciter à buissonner au lieu de monter en fleurs.',
      createdAt: new Date().toISOString()
    }
  ];

  const harvests: Harvest[] = [
    {
      id: `harvest_courgette_1_${Date.now()}`,
      userId,
      plantingId: plant3Id,
      plantName: 'Courgette',
      plotId: plot1Id,
      date: '2026-06-02',
      weightKg: 0.85,
      quantityCount: 2,
      qualityRating: 5,
      notes: 'Excellentes, très fermes avec une peau fine et tendre.',
      createdAt: new Date().toISOString()
    },
    {
      id: `harvest_fraises_1_${Date.now() + 1}`,
      userId,
      plantingId: plant5Id,
      plantName: 'Fraisier',
      plotId: plot2Id,
      date: '2026-05-28',
      weightKg: 0.42,
      quantityCount: 18,
      qualityRating: 5,
      notes: 'Goût exquis de fraise des bois !',
      createdAt: new Date().toISOString()
    }
  ];

  return { plots, plantings, tasks, harvests };
}
