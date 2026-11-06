import React, { useState } from 'react';
import {
  CalendarCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Tag,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { GardenTask, TaskCategory, TaskPriority, Plot, Planting } from '../types/garden';
import { PLANT_CATALOG, MONTH_NAMES_FR } from '../data/plantCatalog';
import { formatDateFR } from '../utils/gardenUtils';

interface TasksCalendarViewProps {
  tasks: GardenTask[];
  plots: Plot[];
  plantings: Planting[];
  onSaveTask: (task: GardenTask) => Promise<void>;
  onToggleTask: (task: GardenTask) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  userId: string;
}

export const TasksCalendarView: React.FC<TasksCalendarViewProps> = ({
  tasks,
  plots,
  plantings,
  onSaveTask,
  onToggleTask,
  onDeleteTask,
  userId
}) => {
  const currentMonthIdx = new Date().getMonth(); // 0 to 11
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonthIdx);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tasks' | 'calendar'>('tasks');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('watering');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [plotId, setPlotId] = useState<string>(plots[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreateModal = () => {
    setTitle('');
    setCategory('watering');
    setDueDate(new Date().toISOString().slice(0, 10));
    setPriority('medium');
    setPlotId(plots[0]?.id || '');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const taskToSave: GardenTask = {
        id: `task_${Date.now()}`,
        userId,
        title: title.trim(),
        category,
        dueDate,
        plotId: plotId || undefined,
        completed: false,
        priority,
        notes: notes.trim(),
        createdAt: new Date().toISOString()
      };

      await onSaveTask(taskToSave);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<TaskCategory, { label: string; icon: string }> = {
    watering: { label: 'Arrosage', icon: '💧' },
    sowing: { label: 'Semis', icon: '🌱' },
    transplanting: { label: 'Repiquage', icon: '🪴' },
    pruning: { label: 'Taille & Éclaircissage', icon: '✂️' },
    weeding: { label: 'Désherbage', icon: '🧤' },
    mulching: { label: 'Paillage', icon: '🌾' },
    fertilizing: { label: 'Compost & Purin', icon: '🧪' },
    treatment: { label: 'Traitement naturel', icon: '🪲' },
    harvest: { label: 'Récolte', icon: '🧺' },
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  // Month specific calendar suggestions
  const monthNum = selectedMonth + 1; // 1 to 12
  const sowIndoorsThisMonth = PLANT_CATALOG.filter(p => p.sowIndoorsMonths.includes(monthNum));
  const sowOutdoorsThisMonth = PLANT_CATALOG.filter(p => p.sowOutdoorsMonths.includes(monthNum));
  const harvestThisMonth = PLANT_CATALOG.filter(p => p.harvestMonths.includes(monthNum));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Calendrier &amp; Tâches du Potager
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Planifiez vos interventions au fil des saisons et consultez le calendrier lunaire et maraîcher.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center p-1 rounded-xl bg-stone-200/60 border border-stone-200">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'tasks' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Mes Tâches ({pendingTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'calendar' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Calendrier des Semis
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Tâche</span>
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="space-y-6">
          {/* Pending Tasks */}
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-sm sm:text-base">
                  Tâches à réaliser ({pendingTasks.length})
                </h3>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              {pendingTasks.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-stone-800 text-sm">Toutes vos tâches sont à jour !</h4>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                    Ajoutez vos rappels pour les prochains arrosages, apports de compost ou paillages.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.map((t) => {
                    const cat = categoryLabels[t.category] || { label: t.category, icon: '📌' };
                    const plot = plots.find(p => p.id === t.plotId);

                    return (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-stone-200/70 hover:border-emerald-300 hover:bg-stone-50/50 flex items-start justify-between gap-3 transition-all"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => onToggleTask(t)}
                            className="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-base">{cat.icon}</span>
                              <h4 className="font-bold text-stone-900 text-sm">{t.title}</h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-medium">
                                {cat.label}
                              </span>
                              {t.priority === 'high' && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
                                  Urgent
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                              {t.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-stone-400" />
                                  <span>{formatDateFR(t.dueDate)}</span>
                                </span>
                              )}
                              {plot && (
                                <span>• Espace : <strong>{plot.name}</strong></span>
                              )}
                            </div>

                            {t.notes && (
                              <p className="text-xs text-stone-600 italic mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">
                                "{t.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => onDeleteTask(t.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600">
                  Tâches terminées récemment ({completedTasks.length})
                </span>
              </div>
              <div className="p-4 divide-y divide-stone-100">
                {completedTasks.slice(0, 5).map((t) => (
                  <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-xs opacity-70">
                    <div className="flex items-center gap-2 line-through text-stone-500">
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => onToggleTask(t)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span>{t.title}</span>
                    </div>
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Calendar View */
        <div className="space-y-6">
          {/* Month selector tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {MONTH_NAMES_FR.map((name, idx) => {
              const isCurrent = idx === currentMonthIdx;
              const isSelected = idx === selectedMonth;

              return (
                <button
                  key={name}
                  onClick={() => setSelectedMonth(idx)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs font-bold'
                      : isCurrent
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/70'
                  }`}
                >
                  {name}
                  {isCurrent && <span className="ml-1 text-[9px] font-normal">• actuel</span>}
                </button>
              );
            })}
          </div>

          {/* Month summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sow Indoors */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-indigo-800 font-bold text-sm">
                <span>🏡</span>
                <h3>Semis sous abri / terrine ({sowIndoorsThisMonth.length})</h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Plantes à semer au chaud ou sous serre en {MONTH_NAMES_FR[selectedMonth]}.
              </p>

              {sowIndoorsThisMonth.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">
                  Aucun semis sous abri préconisé ce mois-ci.
                </p>
              ) : (
                <div className="space-y-2">
                  {sowIndoorsThisMonth.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-indigo-50/50 border border-indigo-100 flex items-center gap-2.5">
                      <span className="text-xl">{p.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-500">Levée : {p.daysToHarvest}j jusqu'à récolte</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sow Outdoors */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
                <span>🌱</span>
                <h3>Semis en pleine terre ({sowOutdoorsThisMonth.length})</h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Légumes et fleurs à semer directement au potager en {MONTH_NAMES_FR[selectedMonth]}.
              </p>

              {sowOutdoorsThisMonth.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">
                  Terre trop froide ou repos végétatif ce mois-ci.
                </p>
              ) : (
                <div className="space-y-2">
                  {sowOutdoorsThisMonth.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-2.5">
                      <span className="text-xl">{p.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-500">Besoin eau : {p.waterNeed}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Harvests */}
            <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-3 text-amber-800 font-bold text-sm">
                <span>🧺</span>
                <h3>Récoltes du mois ({harvestThisMonth.length})</h3>
              </div>
              <p className="text-xs text-stone-500 mb-4">
                Paniers de saison à cueillir en {MONTH_NAMES_FR[selectedMonth]}.
              </p>

              {harvestThisMonth.length === 0 ? (
                <p className="text-xs text-stone-400 italic py-4 text-center">
                  Période creuse de récolte ce mois-ci.
                </p>
              ) : (
                <div className="space-y-2">
                  {harvestThisMonth.map((p) => (
                    <div key={p.id} className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center gap-2.5">
                      <span className="text-xl">{p.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-stone-500">Plein rendement</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Task */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-extrabold text-stone-900 text-base">Ajouter une Tâche au Jardin</h3>
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
                  Intitulé de l'intervention *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Arroser tomates, Pailler les courgettes, Tailler le basilic..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="watering">💧 Arrosage</option>
                    <option value="sowing">🌱 Semis</option>
                    <option value="transplanting">🪴 Repiquage</option>
                    <option value="pruning">✂️ Taille</option>
                    <option value="weeding">🧤 Désherbage</option>
                    <option value="mulching">🌾 Paillage</option>
                    <option value="fertilizing">🧪 Compost / Purin</option>
                    <option value="treatment">🪲 Traitement bio</option>
                    <option value="harvest">🧺 Récolte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Priorité
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="low">Basse (quand on a le temps)</option>
                    <option value="medium">Moyenne (cette semaine)</option>
                    <option value="high">Haute (urgent !)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Date prévue
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Parcelle concernée
                  </label>
                  <select
                    value={plotId}
                    onChange={(e) => setPlotId(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  >
                    <option value="">Tout le jardin</option>
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes ou consignes
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Utiliser le purin d'ortie dilué à 10%..."
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
                  {isSubmitting ? 'Enregistrement...' : 'Créer la tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
