import React from 'react';
import {
  Sprout,
  LayoutDashboard,
  Grid3X3,
  Wheat,
  ShoppingBag,
  CalendarCheck,
  Sparkles,
  Rocket,
  LogIn,
  LogOut,
  User as UserIcon,
  CloudCheck,
  CloudOff
} from 'lucide-react';
import { FirebaseUser } from '../services/firebase';

export type TabType = 
  | 'dashboard' 
  | 'plots' 
  | 'plantings' 
  | 'harvests' 
  | 'tasks' 
  | 'companions' 
  | 'vercel';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isSyncing?: boolean;
  unwateredCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  user,
  onLogin,
  onLogout,
  isSyncing,
  unwateredCount
}) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'plots',
      label: 'Parcelles',
      icon: <Grid3X3 className="w-4 h-4" />
    },
    {
      id: 'plantings',
      label: 'Plantations',
      icon: <Wheat className="w-4 h-4" />,
      badge: unwateredCount > 0 ? unwateredCount : undefined
    },
    {
      id: 'harvests',
      label: 'Récoltes',
      icon: <ShoppingBag className="w-4 h-4" />
    },
    {
      id: 'tasks',
      label: 'Calendrier & Tâches',
      icon: <CalendarCheck className="w-4 h-4" />
    },
    {
      id: 'companions',
      label: 'Compagnonnage',
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      id: 'vercel',
      label: 'Déployer sur Vercel',
      icon: <Rocket className="w-4 h-4 text-emerald-400" />
    }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-stone-900 tracking-tight">Mon Jardinier</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Potager Bio
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">Suivi de cultures &amp; récoltes Firestore</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all relative ${
                    active
                      ? 'bg-emerald-50 text-emerald-900 shadow-xs border border-emerald-200/80 font-semibold'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500 text-white font-bold animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth & Sync Indicator */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync status */}
            <div
              title={user ? 'Connecté à Firebase Firestore' : 'Mode local / Démo'}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-stone-50 text-stone-600 border-stone-200"
            >
              {user ? (
                <>
                  <CloudCheck className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-500 animate-spin' : 'text-emerald-600'}`} />
                  <span className="hidden sm:inline text-emerald-800 font-medium">Cloud Firestore</span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden sm:inline">Local</span>
                </>
              )}
            </div>

            {/* Auth actions */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Utilisateur'}
                      className="w-8 h-8 rounded-full border border-stone-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                      <UserIcon className="w-4 h-4" />
                    </div>
                  )}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-stone-800 truncate max-w-[120px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Déconnexion"
                  className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Connexion Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-stone-100 scrollbar-none">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                  active
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-stone-600 bg-stone-50 border border-stone-200/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 text-[9px] rounded-full bg-rose-500 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
