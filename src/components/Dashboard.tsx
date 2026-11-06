import React from 'react';
import {
  Droplets,
  Sprout,
  ShoppingBag,
  Grid3X3,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  Sun,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { Plot, Planting, Harvest, GardenTask } from '../types/garden';
import { getWateringStatus, getCurrentSeasonFR, formatDateFR, findCatalogPlant } from '../utils/gardenUtils';
import { TabType } from './Navbar';

interface DashboardProps {
  plots: Plot[];
  plantings: Planting[];
  harvests: Harvest[];
  tasks: GardenTask[];
  onNavigate: (tab: TabType) => void;
  onWaterPlanting: (plantingId: string) => void;
  onOpenNewPlanting: () => void;
  onOpenNewHarvest: (planting?: Planting) => void;
  onOpenNewPlot: () => void;
  onOpenNewTask: () => void;
  onToggleTask: (task: GardenTask) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  plots,
  plantings,
  harvests,
  tasks,
  onNavigate,
  onWaterPlanting,
  onOpenNewPlanting,
  onOpenNewHarvest,
  onOpenNewPlot,
  onOpenNewTask,
  onToggleTask
}) => {
  const seasonInfo = getCurrentSeasonFR();

  // Metrics
  const activePlantings = plantings.filter(p => p.status !== 'finished');
  const thirstyPlantings = activePlantings.filter(p => {
    const status = getWateringStatus(p);
    return status.isOverdue || status.isDueToday;
  });

  const totalHarvestKg = harvests.reduce((acc, h) => acc + (h.weightKg || 0), 0);
  const pendingTasks = tasks.filter(t => !t.completed);

  // Harvesting soon (sorted by expectedHarvestDate)
  const upcomingHarvests = activePlantings
    .filter(p => p.expectedHarvestDate && p.status !== 'harvesting')
    .sort((a, b) => (a.expectedHarvestDate || '').localeCompare(b.expectedHarvestDate || ''))
    .slice(0, 4);

  // Currently harvesting
  const inHarvestPlantings = activePlantings.filter(p => p.status === 'harvesting');

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & Season Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 sm:p-8 shadow-md">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-56 h-56 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-semibold backdrop-blur border border-emerald-500/30">
              <Sun className="w-3.5 h-3.5 text-amber-300" />
              <span>Saison actuelle : {seasonInfo.season} ({seasonInfo.monthName})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bienvenue dans votre Potager 🌿
            </h1>
            <p className="text-sm text-emerald-100/90 leading-relaxed">
              {seasonInfo.gardeningTip}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewPlanting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 font-semibold text-xs sm:text-sm hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Planter / Semer</span>
            </button>
            <button
              onClick={() => onOpenNewHarvest()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700/70 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm transition-colors border border-emerald-500/40 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Noter Récolte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Plants */}
        <div
          onClick={() => onNavigate('plantings')}
          className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500">Cultures en terre</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Sprout className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{activePlantings.length}</span>
            <span className="text-xs text-stone-500">variétés</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">
            {inHarvestPlantings.length} en cours de récolte
          </p>
        </div>

        {/* Thirsty Plants */}
        <div
          onClick={() => onNavigate('plantings')}
          className={`p-5 rounded-xl border shadow-xs transition-all cursor-pointer group ${
            thirstyPlantings.length > 0
              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-400'
              : 'bg-white border-stone-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500">Arrosages urgents</span>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                thirstyPlantings.length > 0
                  ? 'bg-rose-100 text-rose-700 group-hover:bg-rose-600 group-hover:text-white'
                  : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Droplets className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${thirstyPlantings.length > 0 ? 'text-rose-700' : 'text-stone-900'}`}>
              {thirstyPlantings.length}
            </span>
            <span className="text-xs text-stone-500">à arroser</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {thirstyPlantings.length > 0 ? 'Action requise au potager' : 'Toutes les plantes sont hydratées'}
          </p>
        </div>

        {/* Harvest Yield */}
        <div
          onClick={() => onNavigate('harvests')}
          className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-amber-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500">Production totale</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{totalHarvestKg.toFixed(1)}</span>
            <span className="text-xs text-stone-500">kg récoltés</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {harvests.length} paniers enregistrés
          </p>
        </div>

        {/* Plots / Spaces */}
        <div
          onClick={() => onNavigate('plots')}
          className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-xs hover:border-emerald-300 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500">Espaces &amp; Parcelles</span>
            <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
              <Grid3X3 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{plots.length}</span>
            <span className="text-xs text-stone-500">zones aménagées</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            {pendingTasks.length} tâches en cours
          </p>
        </div>
      </div>

      {/* Main Grid: Urgent Watering + Upcoming Harvests & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Watering priority list */}
        <div className="lg:col-span-2 space-y-6">
          {/* Watering Alert Card */}
          <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-600" />
                <h2 className="font-bold text-stone-900 text-sm sm:text-base">
                  Suivi des Arrosages Prioritaires
                </h2>
                {thirstyPlantings.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                    {thirstyPlantings.length}
                  </span>
                )}
              </div>
              <button
                onClick={() => onNavigate('plantings')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Toutes les plantations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              {thirstyPlantings.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-stone-800 text-sm">Tout le potager est bien arrosé !</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    Vos plantes ont reçu l'eau nécessaire. Revenez consulter les rappels demain.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stone-100">
                  {thirstyPlantings.map((p) => {
                    const status = getWateringStatus(p);
                    const plot = plots.find(pl => pl.id === p.plotId);
                    const catalog = findCatalogPlant(p.plantName);

                    return (
                      <div key={p.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl">{catalog?.icon || '🌱'}</span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-stone-900 text-sm truncate">{p.plantName}</h4>
                              {p.variety && (
                                <span className="text-xs text-stone-500 truncate">({p.variety})</span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.badgeClass}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 truncate">
                              Parcelle : <strong className="text-stone-700">{plot?.name || 'Non attribuée'}</strong> • Arrosage tous les {p.wateringFrequencyDays} jours
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onWaterPlanting(p.id)}
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <Droplets className="w-3.5 h-3.5" />
                          <span>Arrosé !</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Plot overview */}
          <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-sm sm:text-base">Vos Espaces de Culture</h3>
              </div>
              <button
                onClick={onOpenNewPlot}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un espace</span>
              </button>
            </div>

            {plots.length === 0 ? (
              <div className="py-6 text-center border-2 border-dashed border-stone-200 rounded-xl">
                <p className="text-xs text-stone-500 mb-2">Vous n'avez pas encore configuré de parcelle.</p>
                <button
                  onClick={onOpenNewPlot}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800"
                >
                  Créer ma première parcelle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {plots.slice(0, 3).map((plot) => {
                  const plotPlantings = plantings.filter(p => p.plotId === plot.id && p.status !== 'finished');
                  return (
                    <div
                      key={plot.id}
                      onClick={() => onNavigate('plots')}
                      className="p-3.5 rounded-xl border border-stone-200/80 hover:border-emerald-300 transition-all cursor-pointer bg-stone-50/40 hover:bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-stone-900 text-xs truncate">{plot.name}</span>
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: plot.color || '#15803d' }}
                        />
                      </div>
                      <div className="text-[11px] text-stone-500 space-y-1">
                        <p>{plotPlantings.length} culture{plotPlantings.length > 1 ? 's' : ''} en cours</p>
                        <p className="capitalize">
                          {plot.sunExposure === 'full_sun' ? '☀️ Plein soleil' : plot.sunExposure === 'partial_shade' ? '⛅ Mi-ombre' : '☁️ Ombre'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Tasks & Upcoming harvests */}
        <div className="space-y-6">
          {/* Garden Tasks */}
          <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-sm">Tâches à faire</h3>
              </div>
              <button
                onClick={onOpenNewTask}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter</span>
              </button>
            </div>

            <div className="p-4">
              {pendingTasks.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-stone-500">Aucune tâche en attente ! Profitez de votre jardin.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg border border-stone-100 hover:bg-stone-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => onToggleTask(task)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-stone-800 truncate">{task.title}</p>
                        {task.dueDate && (
                          <p className="text-[10px] text-stone-400 mt-0.5">Échéance : {formatDateFR(task.dueDate)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {pendingTasks.length > 4 && (
                <button
                  onClick={() => onNavigate('tasks')}
                  className="w-full mt-3 py-1.5 text-center text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                >
                  Voir les {pendingTasks.length} tâches
                </button>
              )}
            </div>
          </div>

          {/* Upcoming Harvests */}
          <div className="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-stone-900 text-sm">Bientôt à récolter</h3>
              </div>
              <button
                onClick={() => onNavigate('harvests')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
              >
                Journal
              </button>
            </div>

            <div className="p-4">
              {upcomingHarvests.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-stone-500">Aucune date de récolte imminente enregistrée.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingHarvests.map((plant) => {
                    const catalog = findCatalogPlant(plant.plantName);
                    return (
                      <div key={plant.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{catalog?.icon || '🌱'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-stone-900 truncate">{plant.plantName}</p>
                            <p className="text-[10px] text-stone-500">Prévu vers : {formatDateFR(plant.expectedHarvestDate)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenNewHarvest(plant)}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
                        >
                          Récolter
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Companion Tip Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/70">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Astuce Compagnonnage Bio</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Associez <strong>Tomates + Basilic + Œillets d'Inde</strong> : les œillets assainissent le sol contre les nématodes, et le basilic rehausse la saveur tout en repoussant les mouches !
            </p>
            <button
              onClick={() => onNavigate('companions')}
              className="mt-2 text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
            >
              Consulter le guide des associations <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
