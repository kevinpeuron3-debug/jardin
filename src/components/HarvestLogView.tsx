import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Star,
  Scale,
  Calendar,
  Award,
  Trash2,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Harvest, Planting, Plot } from '../types/garden';
import { formatDateFR, findCatalogPlant } from '../utils/gardenUtils';

interface HarvestLogViewProps {
  harvests: Harvest[];
  plantings: Planting[];
  plots: Plot[];
  onSaveHarvest: (harvest: Harvest) => Promise<void>;
  onDeleteHarvest: (harvestId: string) => Promise<void>;
  userId: string;
  initialPlanting?: Planting | null;
}

export const HarvestLogView: React.FC<HarvestLogViewProps> = ({
  harvests,
  plantings,
  plots,
  onSaveHarvest,
  onDeleteHarvest,
  userId,
  initialPlanting
}) => {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialPlanting));
  const [selectedPlantingId, setSelectedPlantingId] = useState<string>(
    initialPlanting?.id || plantings[0]?.id || ''
  );
  const [customPlantName, setCustomPlantName] = useState('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [quantityCount, setQuantityCount] = useState<number>(1);
  const [qualityRating, setQualityRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats calculation
  const totalWeight = harvests.reduce((acc, h) => acc + (h.weightKg || 0), 0);
  const totalBaskets = harvests.length;

  // Breakdown by plant name
  const yieldByPlant: Record<string, { weight: number; count: number }> = {};
  harvests.forEach(h => {
    if (!yieldByPlant[h.plantName]) {
      yieldByPlant[h.plantName] = { weight: 0, count: 0 };
    }
    yieldByPlant[h.plantName].weight += (h.weightKg || 0);
    yieldByPlant[h.plantName].count += (h.quantityCount || 1);
  });

  const sortedTopYields = Object.entries(yieldByPlant).sort(
    ([, a], [, b]) => b.weight - a.weight
  );

  const openModalWithPlanting = (plant?: Planting) => {
    if (plant) {
      setSelectedPlantingId(plant.id);
      setCustomPlantName(plant.plantName);
    } else {
      setSelectedPlantingId(plantings[0]?.id || 'custom');
      setCustomPlantName(plantings[0]?.plantName || '');
    }
    setDate(new Date().toISOString().slice(0, 10));
    setWeightKg(0.5);
    setQuantityCount(1);
    setQualityRating(5);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let resolvedPlantName = customPlantName;
      let resolvedPlotId = '';

      if (selectedPlantingId !== 'custom') {
        const found = plantings.find(p => p.id === selectedPlantingId);
        if (found) {
          resolvedPlantName = found.plantName + (found.variety ? ` (${found.variety})` : '');
          resolvedPlotId = found.plotId;
        }
      }

      if (!resolvedPlantName.trim()) {
        resolvedPlantName = 'Légume du potager';
      }

      const harvestToSave: Harvest = {
        id: `harvest_${Date.now()}`,
        userId,
        plantingId: selectedPlantingId,
        plantName: resolvedPlantName,
        plotId: resolvedPlotId,
        date,
        weightKg: Number(weightKg) || 0,
        quantityCount: Number(quantityCount) || 1,
        qualityRating: Number(qualityRating) || 5,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await onSaveHarvest(harvestToSave);

      // Trigger celebratory confetti burst!
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.65 }
        });
      } catch {
        // Ignore if confetti not supported
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving harvest:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (harvestId: string, plantName: string) => {
    if (window.confirm(`Supprimer cette récolte de "${plantName}" ?`)) {
      await onDeleteHarvest(harvestId);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Journal des Récoltes &amp; Rendements
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Pesez vos cueillettes, notez la qualité gustative et admirez les fruits de votre labeur au potager.
          </p>
        </div>
        <button
          onClick={() => openModalWithPlanting()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer une Récolte</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Récolté</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-amber-600">{totalWeight.toFixed(2)}</span>
              <span className="text-sm font-bold text-stone-600">kg</span>
            </div>
            <p className="text-xs text-stone-400 mt-1">Sur l'ensemble des saisons</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Paniers cueillis</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-emerald-700">{totalBaskets}</span>
              <span className="text-sm font-bold text-stone-600">récoltes</span>
            </div>
            <p className="text-xs text-stone-400 mt-1">Sessions de cueillette</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Variété vedette</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl font-extrabold text-stone-900 truncate max-w-[150px]">
                {sortedTopYields[0] ? sortedTopYields[0][0] : 'Aucune'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              {sortedTopYields[0] ? `${sortedTopYields[0][1].weight.toFixed(1)} kg récoltés` : 'En attente de récolte'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Top crops breakdown */}
      {sortedTopYields.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-sm">Rendement par culture</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sortedTopYields.slice(0, 4).map(([name, data]) => {
              const catalog = findCatalogPlant(name);
              return (
                <div key={name} className="p-3 rounded-xl bg-stone-50 border border-stone-100 flex items-center gap-3">
                  <span className="text-2xl">{catalog?.icon || '🧺'}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{name}</p>
                    <p className="text-xs text-amber-700 font-semibold">{data.weight.toFixed(2)} kg</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Harvests List */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
            Historique détaillé des récoltes
          </h3>
          <span className="text-xs text-stone-400">{harvests.length} enregistrements</span>
        </div>

        {harvests.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-stone-800 text-sm">Votre panier est encore vide !</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4">
              Dès que vos premiers légumes, fruits ou bouquets aromatiques sont cueillis, notez-les ici pour garder un souvenir précis de votre saison.
            </p>
            <button
              onClick={() => openModalWithPlanting()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Ajouter une première récolte
            </button>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {harvests.map((h) => {
              const catalog = findCatalogPlant(h.plantName);
              const plot = plots.find(pl => pl.id === h.plotId);

              return (
                <div key={h.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-xl shrink-0">
                      {catalog?.icon || '🧺'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-stone-900 text-sm truncate">{h.plantName}</h4>
                        {plot && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                            {plot.name}
                          </span>
                        )}
                        <span className="text-xs text-stone-400">• {formatDateFR(h.date)}</span>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3 h-3 ${
                              star <= (h.qualityRating || 5)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-stone-200'
                            }`}
                          />
                        ))}
                        {h.notes && (
                          <span className="text-xs text-stone-500 ml-2 italic truncate max-w-md">
                            "{h.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      {h.weightKg !== undefined && h.weightKg > 0 && (
                        <div className="font-extrabold text-amber-700 text-sm sm:text-base">
                          {h.weightKg >= 1 ? `${h.weightKg.toFixed(2)} kg` : `${Math.round(h.weightKg * 1000)} g`}
                        </div>
                      )}
                      {h.quantityCount && (
                        <div className="text-[11px] text-stone-500 font-medium">
                          {h.quantityCount} unité{h.quantityCount > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete(h.id, h.plantName)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Harvest */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-stone-900 text-base">Enregistrer une Récolte</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Plante récoltée *
                </label>
                {plantings.length > 0 ? (
                  <select
                    value={selectedPlantingId}
                    onChange={(e) => {
                      setSelectedPlantingId(e.target.value);
                      if (e.target.value === 'custom') {
                        setCustomPlantName('');
                      }
                    }}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
                  >
                    {plantings.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.plantName} {p.variety ? `(${p.variety})` : ''} - {plots.find(pl => pl.id === p.plotId)?.name || 'Potager'}
                      </option>
                    ))}
                    <option value="custom">Autre culture (saisie libre)...</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tomate, Fraise, Basilic..."
                    value={customPlantName}
                    onChange={(e) => setCustomPlantName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                )}
              </div>

              {selectedPlantingId === 'custom' && plantings.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom de la variété
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fraisier Gariguette..."
                    value={customPlantName}
                    onChange={(e) => setCustomPlantName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Poids récolté (kg)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre d'unités
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantityCount}
                    onChange={(e) => setQuantityCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Date de la cueillette
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              {/* Quality Rating */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Qualité &amp; Goût (1 à 5 étoiles)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setQualityRating(star)}
                      className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= qualityRating ? 'text-amber-400 fill-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-stone-500 ml-2 font-medium">
                    {qualityRating === 5 ? 'Exquis !' : qualityRating === 4 ? 'Très bon' : qualityRating === 3 ? 'Correct' : 'Moyen'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Remarques gustatives ou conservation
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Chair sucrée et fondante, peau très fine..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : 'Valider la récolte 🎉'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
