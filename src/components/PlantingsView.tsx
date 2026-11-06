import React, { useState } from 'react';
import {
  Wheat,
  Plus,
  Droplets,
  ShoppingBag,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Calendar,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Grid3X3
} from 'lucide-react';
import { Planting, Plot, PlantStatus, PlantCategory } from '../types/garden';
import { PLANT_CATALOG, STATUS_LABELS } from '../data/plantCatalog';
import { findCatalogPlant, getWateringStatus, formatDateFR } from '../utils/gardenUtils';

interface PlantingsViewProps {
  plantings: Planting[];
  plots: Plot[];
  onSavePlanting: (planting: Planting) => Promise<void>;
  onDeletePlanting: (plantingId: string) => Promise<void>;
  onWaterPlanting: (plantingId: string) => void;
  onUpdateStatus: (plantingId: string, status: PlantStatus) => Promise<void>;
  onOpenNewHarvest: (planting: Planting) => void;
  userId: string;
  initialSelectedPlotId?: string | null;
}

export const PlantingsView: React.FC<PlantingsViewProps> = ({
  plantings,
  plots,
  onSavePlanting,
  onDeletePlanting,
  onWaterPlanting,
  onUpdateStatus,
  onOpenNewHarvest,
  userId,
  initialSelectedPlotId
}) => {
  const [filterPlotId, setFilterPlotId] = useState<string>(initialSelectedPlotId || 'all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlanting, setEditingPlanting] = useState<Planting | null>(null);

  // Form Fields
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('tomate');
  const [plantName, setPlantName] = useState('Tomate');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<PlantCategory>('vegetable');
  const [plotId, setPlotId] = useState<string>(plots[0]?.id || '');
  const [status, setStatus] = useState<PlantStatus>('growing');
  const [quantity, setQuantity] = useState<number>(1);
  const [dateSown, setDateSown] = useState<string>('');
  const [datePlanted, setDatePlanted] = useState<string>(new Date().toISOString().slice(0, 10));
  const [expectedHarvestDate, setExpectedHarvestDate] = useState<string>('');
  const [wateringFrequencyDays, setWateringFrequencyDays] = useState<number>(2);
  const [companionGood, setCompanionGood] = useState('');
  const [companionBad, setCompanionBad] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCatalogSelect = (catalogId: string) => {
    setSelectedCatalogId(catalogId);
    const item = PLANT_CATALOG.find(c => c.id === catalogId);
    if (item) {
      setPlantName(item.name);
      setCategory(item.category);
      setWateringFrequencyDays(item.defaultWateringDays);
      setCompanionGood(item.goodCompanions.join(', '));
      setCompanionBad(item.badCompanions.join(', '));

      // Calculate approximate expected harvest date
      const harvestDate = new Date();
      harvestDate.setDate(harvestDate.getDate() + (item.daysToHarvest || 60));
      setExpectedHarvestDate(harvestDate.toISOString().slice(0, 10));
    }
  };

  const openCreateModal = (defaultPlotId?: string) => {
    setEditingPlanting(null);
    const defaultCatalog = PLANT_CATALOG[0];
    setSelectedCatalogId(defaultCatalog.id);
    setPlantName(defaultCatalog.name);
    setCategory(defaultCatalog.category);
    setVariety('');
    setPlotId(defaultPlotId || plots[0]?.id || '');
    setStatus('growing');
    setQuantity(2);
    setDateSown('');
    setDatePlanted(new Date().toISOString().slice(0, 10));
    const harvestDate = new Date();
    harvestDate.setDate(harvestDate.getDate() + defaultCatalog.daysToHarvest);
    setExpectedHarvestDate(harvestDate.toISOString().slice(0, 10));
    setWateringFrequencyDays(defaultCatalog.defaultWateringDays);
    setCompanionGood(defaultCatalog.goodCompanions.join(', '));
    setCompanionBad(defaultCatalog.badCompanions.join(', '));
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (planting: Planting) => {
    setEditingPlanting(planting);
    setPlantName(planting.plantName);
    setVariety(planting.variety || '');
    setCategory(planting.category);
    setPlotId(planting.plotId);
    setStatus(planting.status);
    setQuantity(planting.quantity || 1);
    setDateSown(planting.dateSown || '');
    setDatePlanted(planting.datePlanted || '');
    setExpectedHarvestDate(planting.expectedHarvestDate || '');
    setWateringFrequencyDays(planting.wateringFrequencyDays || 2);
    setCompanionGood(planting.companionGood || '');
    setCompanionBad(planting.companionBad || '');
    setNotes(planting.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantName.trim() || !plotId) return;

    setIsSubmitting(true);
    try {
      const plantingToSave: Planting = {
        id: editingPlanting ? editingPlanting.id : `plant_${Date.now()}`,
        userId,
        plotId,
        plantName: plantName.trim(),
        variety: variety.trim(),
        category,
        status,
        quantity: Number(quantity) || 1,
        dateSown,
        datePlanted,
        expectedHarvestDate,
        wateringFrequencyDays: Number(wateringFrequencyDays) || 2,
        lastWatered: editingPlanting ? editingPlanting.lastWatered : new Date().toISOString(),
        companionGood,
        companionBad,
        notes: notes.trim(),
        createdAt: editingPlanting ? editingPlanting.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onSavePlanting(plantingToSave);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving planting:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (plantingId: string, name: string) => {
    if (window.confirm(`Supprimer le suivi de "${name}" ?`)) {
      await onDeletePlanting(plantingId);
    }
  };

  // Filtered List
  const filteredPlantings = plantings.filter(p => {
    if (filterPlotId !== 'all' && p.plotId !== filterPlotId) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterCategory !== 'all' && p.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = p.plantName.toLowerCase().includes(query);
      const matchVariety = (p.variety || '').toLowerCase().includes(query);
      if (!matchName && !matchVariety) return false;
    }
    return true;
  });

  const stages: { key: PlantStatus; label: string }[] = [
    { key: 'sown', label: 'Semis' },
    { key: 'sprouted', label: 'Levée' },
    { key: 'transplanted', label: 'Repiqué' },
    { key: 'growing', label: 'Croissance' },
    { key: 'harvesting', label: 'Récolte' },
    { key: 'finished', label: 'Terminé' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Suivi des Plantations &amp; Cultures
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Surveillez le stade de croissance, les arrosages et les prévisions de récolte de chaque variété.
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          disabled={plots.length === 0}
          title={plots.length === 0 ? 'Créez d\'abord une parcelle' : ''}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Culture</span>
        </button>
      </div>

      {plots.length === 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Veuillez d'abord créer au moins une parcelle dans l'onglet <strong>Parcelles</strong> pour pouvoir y installer vos plantations.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher une plante ou variété (ex: Tomate Marmande, Basilic...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {/* Plot filter */}
            <select
              value={filterPlotId}
              onChange={(e) => setFilterPlotId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Toutes les parcelles</option>
              {plots.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Tous les statuts</option>
              <option value="growing">En croissance</option>
              <option value="harvesting">Récolte en cours</option>
              <option value="transplanted">Repiqué</option>
              <option value="sprouted">Levée</option>
              <option value="sown">Semé</option>
              <option value="finished">Terminé</option>
            </select>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
            >
              <option value="all">Toutes catégories</option>
              <option value="vegetable">Légumes</option>
              <option value="root">Légumes racines</option>
              <option value="fruit">Fruits</option>
              <option value="herb">Aromatiques</option>
              <option value="flower">Fleurs amies</option>
              <option value="legume">Légumineuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plantings List */}
      {filteredPlantings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border-2 border-dashed border-stone-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Wheat className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-stone-800">Aucune plantation trouvée</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-6">
            Ajoutez vos premiers semis ou plants en terre pour commencer votre carnet de culture.
          </p>
          <button
            onClick={() => openCreateModal()}
            disabled={plots.length === 0}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            Ajouter une culture
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlantings.map((p) => {
            const plot = plots.find(pl => pl.id === p.plotId);
            const catalog = findCatalogPlant(p.plantName);
            const water = getWateringStatus(p);
            const statusConfig = STATUS_LABELS[p.status] || STATUS_LABELS.growing;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div className="p-5">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shadow-2xs">
                        {catalog?.icon || '🌱'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-base text-stone-900">{p.plantName}</h3>
                          {p.quantity && p.quantity > 1 && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                              ×{p.quantity} plants
                            </span>
                          )}
                        </div>
                        {p.variety && (
                          <p className="text-xs font-medium text-emerald-800 italic">{p.variety}</p>
                        )}
                        <p className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-1">
                          <Grid3X3 className="w-3 h-3 text-stone-400" />
                          <span>{plot?.name || 'Parcelle non définie'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        title="Modifier la culture"
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.plantName)}
                        title="Supprimer la culture"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Stage pill & Water Pill */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${statusConfig.bg} ${statusConfig.color}`}>
                      {statusConfig.label}
                    </span>

                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border flex items-center gap-1 ${water.badgeClass}`}>
                      <Droplets className="w-3 h-3" />
                      <span>{water.label}</span>
                    </span>
                  </div>

                  {/* Growth Stage Stepper */}
                  <div className="mb-4 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <div className="text-[10px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                      Stade de culture
                    </div>
                    <div className="flex items-center justify-between gap-1 overflow-x-auto">
                      {stages.map((st) => {
                        const isActive = p.status === st.key;
                        return (
                          <button
                            key={st.key}
                            onClick={() => onUpdateStatus(p.id, st.key)}
                            className={`px-1.5 py-1 text-[10px] rounded font-medium transition-all cursor-pointer whitespace-nowrap ${
                              isActive
                                ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                                : 'text-stone-500 hover:bg-stone-200/70'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dates & Timeline */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3 text-stone-600">
                    {p.datePlanted && (
                      <div className="p-2 rounded-lg bg-stone-50 border border-stone-100">
                        <span className="text-[10px] text-stone-400 block font-medium">Planté le</span>
                        <span className="font-semibold">{formatDateFR(p.datePlanted)}</span>
                      </div>
                    )}
                    {p.expectedHarvestDate && (
                      <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 block font-medium">Récolte estimée</span>
                        <span className="font-semibold text-emerald-900">{formatDateFR(p.expectedHarvestDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Companion suggestions if available */}
                  {p.companionGood && (
                    <div className="text-[11px] text-stone-600 bg-emerald-50/40 border border-emerald-100/60 p-2 rounded-lg mb-2 flex items-start gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-emerald-800">Amis du potager :</strong> {p.companionGood}
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {p.notes && (
                    <p className="text-xs text-stone-500 italic mt-2">
                      "{p.notes}"
                    </p>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 border-t border-stone-100 bg-stone-50/50 flex items-center gap-2">
                  <button
                    onClick={() => onWaterPlanting(p.id)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>Arroser</span>
                  </button>
                  <button
                    onClick={() => onOpenNewHarvest(p)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border border-amber-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Récolter</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Planting */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Wheat className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-base">
                  {editingPlanting ? 'Modifier la Culture' : 'Ajouter une Culture au Potager'}
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
              {/* Preset selection from Catalog */}
              {!editingPlanting && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Sélectionner dans le catalogue des plantes
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto p-1 border border-stone-200 rounded-xl">
                    {PLANT_CATALOG.map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => handleCatalogSelect(item.id)}
                        className={`p-2 rounded-lg text-left text-xs flex items-center gap-2 transition-all cursor-pointer ${
                          selectedCatalogId === item.id
                            ? 'bg-emerald-100 border border-emerald-400 font-bold text-emerald-900'
                            : 'hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="text-base">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nom de la plante *
                  </label>
                  <input
                    type="text"
                    required
                    value={plantName}
                    onChange={(e) => setPlantName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Variété (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Cœur de bœuf, Black Beauty..."
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Parcelle d'accueil *
                  </label>
                  <select
                    required
                    value={plotId}
                    onChange={(e) => setPlotId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    {plots.map((pl) => (
                      <option key={pl.id} value={pl.id}>{pl.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Stade de culture
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PlantStatus)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="sown">Semé</option>
                    <option value="sprouted">Levée</option>
                    <option value="transplanted">Repiqué</option>
                    <option value="growing">En croissance</option>
                    <option value="harvesting">Récolte en cours</option>
                    <option value="finished">Terminé</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nombre de plants
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Arrosage tous les
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={wateringFrequencyDays}
                      onChange={(e) => setWateringFrequencyDays(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <span className="text-xs text-stone-500 font-medium">jours</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PlantCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="vegetable">Légume</option>
                    <option value="root">Racine</option>
                    <option value="fruit">Fruit</option>
                    <option value="herb">Aromatique</option>
                    <option value="flower">Fleur</option>
                    <option value="legume">Légumineuse</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Date de mise en terre / semis
                  </label>
                  <input
                    type="date"
                    value={datePlanted}
                    onChange={(e) => setDatePlanted(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Date de récolte estimée
                  </label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes de culture &amp; observations
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Tuteurage fait, paillé avec chanvre..."
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
                  {isSubmitting ? 'Enregistrement...' : editingPlanting ? 'Mettre à jour' : 'Ajouter la culture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
