import React, { useState, useEffect } from 'react';
import {
  Navbar,
  TabType
} from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PlotsView } from './components/PlotsView';
import { PlantingsView } from './components/PlantingsView';
import { HarvestLogView } from './components/HarvestLogView';
import { TasksCalendarView } from './components/TasksCalendarView';
import { CompanionGuideView } from './components/CompanionGuideView';
import { VercelDeployView } from './components/VercelDeployView';
import {
  auth,
  onAuthStateChanged,
  loginWithGoogle,
  logoutUser,
  FirebaseUser,
  subscribePlots,
  subscribePlantings,
  subscribeHarvests,
  subscribeGardenTasks,
  savePlot,
  removePlot,
  savePlanting,
  removePlanting,
  updatePlantingStatus,
  recordWatering,
  saveHarvest,
  removeHarvest,
  saveGardenTask,
  toggleGardenTask,
  removeGardenTask
} from './services/firebase';
import { Plot, Planting, Harvest, GardenTask, PlantStatus } from './types/garden';
import { getStarterGarden } from './data/seedData';
import { getWateringStatus } from './utils/gardenUtils';
import { Cloud, Sprout, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Core Data
  const [plots, setPlots] = useState<Plot[]>([]);
  const [plantings, setPlantings] = useState<Planting[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [tasks, setTasks] = useState<GardenTask[]>([]);

  // Navigation / Action states
  const [targetPlotIdForPlanting, setTargetPlotIdForPlanting] = useState<string | null>(null);
  const [targetPlantingForHarvest, setTargetPlantingForHarvest] = useState<Planting | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Load starter/demo data in local state if not logged in
        const demo = getStarterGarden('local_guest');
        setPlots(demo.plots);
        setPlantings(demo.plantings);
        setHarvests(demo.harvests);
        setTasks(demo.tasks);
      }
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore when logged in
  useEffect(() => {
    if (!user) return;

    setIsSyncing(true);

    const unsubPlots = subscribePlots(user.uid, (data) => {
      setPlots(data);
      setIsSyncing(false);
    });

    const unsubPlantings = subscribePlantings(user.uid, (data) => {
      setPlantings(data);
      setIsSyncing(false);
    });

    const unsubHarvests = subscribeHarvests(user.uid, (data) => {
      setHarvests(data);
      setIsSyncing(false);
    });

    const unsubTasks = subscribeGardenTasks(user.uid, (data) => {
      setTasks(data);
      setIsSyncing(false);
    });

    return () => {
      unsubPlots();
      unsubPlantings();
      unsubHarvests();
      unsubTasks();
    };
  }, [user]);

  // Handle Login / Logout
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Populate Demo data for user if requested
  const handleSeedUserData = async () => {
    if (!user) return;
    setIsSyncing(true);
    const starter = getStarterGarden(user.uid);
    try {
      for (const p of starter.plots) await savePlot(p);
      for (const pl of starter.plantings) await savePlanting(pl);
      for (const h of starter.harvests) await saveHarvest(h);
      for (const t of starter.tasks) await saveGardenTask(t);
    } catch (err) {
      console.error('Error populating starter garden:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- Actions ---

  // Watering
  const handleWaterPlanting = async (plantingId: string) => {
    if (user) {
      await recordWatering(plantingId);
    } else {
      setPlantings(prev => prev.map(p => {
        if (p.id === plantingId) {
          return { ...p, lastWatered: new Date().toISOString() };
        }
        return p;
      }));
    }
  };

  // Status update
  const handleUpdateStatus = async (plantingId: string, status: PlantStatus) => {
    if (user) {
      await updatePlantingStatus(plantingId, status);
    } else {
      setPlantings(prev => prev.map(p => (p.id === plantingId ? { ...p, status } : p)));
    }
  };

  // Plot operations
  const handleSavePlot = async (plot: Plot) => {
    if (user) {
      await savePlot(plot);
    } else {
      setPlots(prev => {
        const idx = prev.findIndex(p => p.id === plot.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = plot;
          return next;
        }
        return [...prev, plot];
      });
    }
  };

  const handleDeletePlot = async (plotId: string) => {
    if (user) {
      await removePlot(plotId);
    } else {
      setPlots(prev => prev.filter(p => p.id !== plotId));
      setPlantings(prev => prev.filter(p => p.plotId !== plotId));
    }
  };

  // Planting operations
  const handleSavePlanting = async (planting: Planting) => {
    if (user) {
      await savePlanting(planting);
    } else {
      setPlantings(prev => {
        const idx = prev.findIndex(p => p.id === planting.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = planting;
          return next;
        }
        return [planting, ...prev];
      });
    }
  };

  const handleDeletePlanting = async (plantingId: string) => {
    if (user) {
      await removePlanting(plantingId);
    } else {
      setPlantings(prev => prev.filter(p => p.id !== plantingId));
    }
  };

  // Harvest operations
  const handleSaveHarvest = async (harvest: Harvest) => {
    if (user) {
      await saveHarvest(harvest);
    } else {
      setHarvests(prev => [harvest, ...prev]);
    }
  };

  const handleDeleteHarvest = async (harvestId: string) => {
    if (user) {
      await removeHarvest(harvestId);
    } else {
      setHarvests(prev => prev.filter(h => h.id !== harvestId));
    }
  };

  // Task operations
  const handleSaveTask = async (task: GardenTask) => {
    if (user) {
      await saveGardenTask(task);
    } else {
      setTasks(prev => [task, ...prev]);
    }
  };

  const handleToggleTask = async (task: GardenTask) => {
    if (user) {
      await toggleGardenTask(task);
    } else {
      setTasks(prev => prev.map(t => (t.id === task.id ? { ...t, completed: !t.completed } : t)));
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (user) {
      await removeGardenTask(taskId);
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  // Thirsty plants count for badge
  const unwateredCount = plantings.filter(p => {
    if (p.status === 'finished') return false;
    const w = getWateringStatus(p);
    return w.isOverdue || w.isDueToday;
  }).length;

  return (
    <div className="min-h-screen bg-stone-100/60 font-sans text-stone-900 flex flex-col selection:bg-emerald-200">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        unwateredCount={unwateredCount}
      />

      {/* Guest Notice Banner if not logged in */}
      {!user && !authLoading && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white px-4 py-2.5 text-xs shadow-xs border-b border-emerald-800">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Mode Démonstration :</strong> Connectez-vous avec Google pour sauvegarder et synchroniser vos données dans <strong>Firebase Firestore</strong> en temps réel.
              </span>
            </div>
            <button
              onClick={handleLogin}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold transition-colors cursor-pointer shrink-0 text-[11px]"
            >
              Se connecter maintenant
            </button>
          </div>
        </div>
      )}

      {/* Logged in with 0 plots prompt */}
      {user && plots.length === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-xs text-amber-900">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sprout className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Votre compte Firebase est vide. Voulez-vous initialiser votre potager avec des parcelles et cultures d'exemple ?
              </span>
            </div>
            <button
              onClick={handleSeedUserData}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer shrink-0"
            >
              Initialiser un potager d'exemple
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            plots={plots}
            plantings={plantings}
            harvests={harvests}
            tasks={tasks}
            onNavigate={setCurrentTab}
            onWaterPlanting={handleWaterPlanting}
            onOpenNewPlanting={() => {
              setTargetPlotIdForPlanting(null);
              setCurrentTab('plantings');
            }}
            onOpenNewHarvest={(plant) => {
              setTargetPlantingForHarvest(plant || null);
              setCurrentTab('harvests');
            }}
            onOpenNewPlot={() => setCurrentTab('plots')}
            onOpenNewTask={() => setCurrentTab('tasks')}
            onToggleTask={handleToggleTask}
          />
        )}

        {currentTab === 'plots' && (
          <PlotsView
            plots={plots}
            plantings={plantings}
            onSavePlot={handleSavePlot}
            onDeletePlot={handleDeletePlot}
            onOpenNewPlantingInPlot={(plotId) => {
              setTargetPlotIdForPlanting(plotId);
              setCurrentTab('plantings');
            }}
            onWaterPlanting={handleWaterPlanting}
            userId={user ? user.uid : 'local_guest'}
          />
        )}

        {currentTab === 'plantings' && (
          <PlantingsView
            plantings={plantings}
            plots={plots}
            onSavePlanting={handleSavePlanting}
            onDeletePlanting={handleDeletePlanting}
            onWaterPlanting={handleWaterPlanting}
            onUpdateStatus={handleUpdateStatus}
            onOpenNewHarvest={(plant) => {
              setTargetPlantingForHarvest(plant);
              setCurrentTab('harvests');
            }}
            userId={user ? user.uid : 'local_guest'}
            initialSelectedPlotId={targetPlotIdForPlanting}
          />
        )}

        {currentTab === 'harvests' && (
          <HarvestLogView
            harvests={harvests}
            plantings={plantings}
            plots={plots}
            onSaveHarvest={handleSaveHarvest}
            onDeleteHarvest={handleDeleteHarvest}
            userId={user ? user.uid : 'local_guest'}
            initialPlanting={targetPlantingForHarvest}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksCalendarView
            tasks={tasks}
            plots={plots}
            plantings={plantings}
            onSaveTask={handleSaveTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            userId={user ? user.uid : 'local_guest'}
          />
        )}

        {currentTab === 'companions' && (
          <CompanionGuideView />
        )}

        {currentTab === 'vercel' && (
          <VercelDeployView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 text-xs text-stone-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-700">Mon Jardinier</span>
            <span>• Gestion de jardin &amp; potager bio</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentTab('vercel')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              🚀 Guide Vercel
            </button>
            <span>•</span>
            <span>Données hébergées sur Google Firebase Firestore</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
