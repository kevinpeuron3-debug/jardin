import React, { useState } from 'react';
import {
  Grid3X3,
  Plus,
  Sun,
  Layers,
  Edit2,
  Trash2,
  Droplets,
  Sprout,
  Sparkles,
  AlertTriangle,
  Compass
} from 'lucide-react';
import { Plot, Planting, PlotShape, SunExposure, SoilType } from '../types/garden';
import { findCatalogPlant, getWateringStatus } from '../utils/gardenUtils';
import { STATUS_LABELS } from '../data/plantCatalog';

interface PlotsViewProps {
  plots: Plot[];
  plantings: Planting[];
  onSavePlot: (plot: Plot) => Promise<void>;
  onDeletePlot: (plotId: string) => Promise<void>;
  onOpenNewPlantingInPlot: (plotId: string) => void;
  onWaterPlanting: (plantingId: string) => void;
  userId: string;
}

export const PlotsView: React.FC<PlotsViewProps> = ({
  plots,
  plantings,
  onSavePlot,
  onDeletePlot,
  onOpenNewPlantingInPlot,
  onWaterPlanting,
  userId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [shape, setShape] = useState<PlotShape>('rectangle');
  const [widthMeters, setWidthMeters] = useState<number>(1.2);
  const [lengthMeters, setLengthMeters] = useState<number>(2.5);
  const [sunExposure, setSunExposure] = useState<SunExposure>('full_sun');
  const [soilType, setSoilType] = useState<SoilType>('compost_rich');
  const [color, setColor] = useState('#15803d');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setEditingPlot(null);
    setName('');
    setShape('rectangle');
    setWidthMeters(1.2);
    setLengthMeters(2.5);
    setSunExposure('full_sun');
    setSoilType('compost_rich');
    setColor('#15803d');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (plot: Plot) => {
    setEditingPlot(plot);
    setName(plot.name);
    setShape(plot.shape);
    setWidthMeters(plot.widthMeters || 1.2);
    setLengthMeters(plot.lengthMeters || 2.5);
    setSunExposure(plot.sunExposure);
    setSoilType(plot.soilType);
    setColor(plot.color || '#15803d');
    setNotes(plot.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const plotToSave: Plot = {
        id: editingPlot ? editingPlot.id : `plot_${Date.now()}`,
        userId,
        name: name.trim(),
        shape,
        widthMeters: Number(widthMeters),
        lengthMeters: Number(lengthMeters),
        sunExposure,
        soilType,
        color,
        notes: notes.trim(),
        createdAt: editingPlot ? editingPlot.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSavePlot(plotToSave);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving plot:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (plotId: string, plotName: string) => {
    const cropsCount = plantings.filter(p => p.plotId === plotId).length;
    const msg = cropsCount > 0
      ? `Supprimer "${plotName}" ? Cette parcelle contient ${cropsCount} culture(s).`
      : `Supprimer la parcelle "${plotName}" ?`;
    if (window.confirm(msg)) {
      await onDeletePlot(plotId);
    }
  };

  const colorOptions = [
    { label: 'Vert Forêt', value: '#15803d' },
    { label: 'Bleu Eau', value: '#0284c7' },
    { label: 'Terre Cuite', value: '#c2410c' },
    { label: 'Ambre Miel', value: '#d97706' },
    { label: 'Violet Lavande', value: '#7c3aed' },
    { label: 'Sauge', value: '#059669' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Parcelles &amp; Espaces du Jardin
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Organisez vos carrés de potager, planches paillées, bacs et serres pour optimiser l'ensoleillement et les rotations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Parcelle</span>
        </button>
      </div>

      {/* Plots List */}
      {plots.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-stone-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Grid3X3 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-800">Aucune parcelle configurée</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-6">
            Créez votre première planche de culture ou bac surélevé pour commencer à y assigner vos plants et suivre vos récoltes.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Créer ma première parcelle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plots.map((plot) => {
            const plotPlantings = plantings.filter(p => p.plotId === plot.id && p.status !== 'finished');

            // Detect companion synergy inside this plot
            const plantNames = plotPlantings.map(p => p.plantName);
            const synergyFound: string[] = [];
            const conflictFound: string[] = [];

            plotPlantings.forEach(planting => {
              const catalog = findCatalogPlant(planting.plantName);
              if (catalog) {
                catalog.goodCompanions.forEach(c => {
                  if (plantNames.includes(c) && !synergyFound.includes(`${planting.plantName} + ${c}`)) {
                    synergyFound.push(`${planting.plantName} + ${c}`);
                  }
                });
                catalog.badCompanions.forEach(bad => {
                  if (plantNames.includes(bad) && !conflictFound.includes(`${planting.plantName} & ${bad}`)) {
                    conflictFound.push(`${planting.plantName} & ${bad}`);
                  }
                });
              }
            });

            return (
              <div
                key={plot.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div>
                  {/* Top Bar with Color Indicator */}
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: plot.color || '#15803d' }}
                  />

                  <div className="p-5">
                    {/* Header of card */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-stone-900">{plot.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                          <span className="capitalize font-medium">
                            {plot.shape === 'raised_bed' ? 'Bac surélevé' : plot.shape === 'greenhouse' ? 'Serre' : plot.shape === 'pot' ? 'Pots / Bacs' : plot.shape === 'row' ? 'Ligne / Rang' : 'Planche / Carré'}
                          </span>
                          {plot.widthMeters && plot.lengthMeters && (
                            <span>• {plot.widthMeters}m × {plot.lengthMeters}m ({(plot.widthMeters * plot.lengthMeters).toFixed(1)} m²)</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(plot)}
                          title="Modifier la parcelle"
                          className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(plot.id, plot.name)}
                          title="Supprimer la parcelle"
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60 font-medium inline-flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-600" />
                        <span>
                          {plot.sunExposure === 'full_sun' ? 'Plein soleil' : plot.sunExposure === 'partial_shade' ? 'Mi-ombre' : 'Ombragé'}
                        </span>
                      </span>

                      <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-medium inline-flex items-center gap-1">
                        <Layers className="w-3 h-3 text-stone-500" />
                        <span>
                          {plot.soilType === 'compost_rich' ? 'Riche en compost' : plot.soilType === 'clay' ? 'Argileux' : plot.soilType === 'sandy' ? 'Sablonneux' : plot.soilType === 'potting_soil' ? 'Terreau' : 'Limoneux'}
                        </span>
                      </span>
                    </div>

                    {/* Notes if any */}
                    {plot.notes && (
                      <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-lg mb-4 border border-stone-100">
                        "{plot.notes}"
                      </p>
                    )}

                    {/* Companion synergies / warnings */}
                    {synergyFound.length > 0 && (
                      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">Alliance bénéfique :</span>
                        <span className="truncate">{synergyFound.slice(0, 2).join(', ')}</span>
                      </div>
                    )}

                    {conflictFound.length > 0 && (
                      <div className="mb-3 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200/70 text-rose-800 text-[11px] flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold">Voisinage déconseillé :</span>
                        <span className="truncate">{conflictFound.slice(0, 1).join(', ')}</span>
                      </div>
                    )}

                    {/* Plantings list inside plot */}
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                        <span>Cultures présentes ({plotPlantings.length})</span>
                      </div>

                      {plotPlantings.length === 0 ? (
                        <p className="text-xs text-stone-400 italic py-2">
                          Parcelle vide pour le moment.
                        </p>
                      ) : (
                        <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden bg-stone-50/30">
                          {plotPlantings.map((planting) => {
                            const catalog = findCatalogPlant(planting.plantName);
                            const water = getWateringStatus(planting);
                            const statusConfig = STATUS_LABELS[planting.status] || STATUS_LABELS.growing;

                            return (
                              <div
                                key={planting.id}
                                className="p-2.5 flex items-center justify-between gap-2 hover:bg-stone-50 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-lg">{catalog?.icon || '🌱'}</span>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-stone-900 truncate">
                                      {planting.plantName}
                                      {planting.quantity && (
                                        <span className="font-normal text-stone-500 ml-1">×{planting.quantity}</span>
                                      )}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-semibold border ${statusConfig.bg} ${statusConfig.color}`}>
                                        {statusConfig.label}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => onWaterPlanting(planting.id)}
                                  title={`Arroser (${water.label})`}
                                  className={`shrink-0 p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                                    water.isOverdue || water.isDueToday
                                      ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-600 hover:text-white'
                                      : 'bg-white text-stone-400 border-stone-200 hover:text-blue-600 hover:border-blue-300'
                                  }`}
                                >
                                  <Droplets className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="p-4 border-t border-stone-100 bg-stone-50/50">
                  <button
                    onClick={() => onOpenNewPlantingInPlot(plot.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-stone-200 hover:border-emerald-400 text-stone-700 hover:text-emerald-800 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Planter dans cet espace</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Plot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  {editingPlot ? 'Modifier la Parcelle' : 'Créer une Nouvelle Parcelle'}
                </h3>
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
                  Nom de l'espace / parcelle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carré Potager 1, Planche Tomates, Serre Nord..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Type d'aménagement
                  </label>
                  <select
                    value={shape}
                    onChange={(e) => setShape(e.target.value as PlotShape)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="rectangle">Planche / Rectangle</option>
                    <option value="square">Carré potager (1.2m)</option>
                    <option value="raised_bed">Bac surélevé</option>
                    <option value="row">Rangée en pleine terre</option>
                    <option value="pot">Pots / Jardinières</option>
                    <option value="greenhouse">Serre / Tunnel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Exposition au soleil
                  </label>
                  <select
                    value={sunExposure}
                    onChange={(e) => setSunExposure(e.target.value as SunExposure)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="full_sun">☀️ Plein soleil (&gt;6h)</option>
                    <option value="partial_shade">⛅ Mi-ombre (3-6h)</option>
                    <option value="shade">☁️ Ombre (&lt;3h)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Largeur (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={widthMeters}
                    onChange={(e) => setWidthMeters(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Longueur (m)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.2"
                    value={lengthMeters}
                    onChange={(e) => setLengthMeters(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Type de sol
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value as SoilType)}
                    className="w-full px-2.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="compost_rich">Riche en compost</option>
                    <option value="loam">Terre franche / équilibrée</option>
                    <option value="clay">Argileux / Lourd</option>
                    <option value="sandy">Sablonneux / Drainant</option>
                    <option value="potting_soil">Terreau pour bac</option>
                  </select>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Couleur d'identification
                </label>
                <div className="flex items-center gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setColor(opt.value)}
                      title={opt.label}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer border-2 ${
                        color === opt.value ? 'scale-115 border-stone-800 shadow-sm' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: opt.value }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes &amp; Particularités (optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Terre paillée au foin, proche du point d'eau..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Enregistrement...' : editingPlot ? 'Mettre à jour' : 'Créer la parcelle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
