import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  ThumbsUp,
  ThumbsDown,
  Info,
  ShieldCheck,
  Bug,
  HelpCircle
} from 'lucide-react';
import { PLANT_CATALOG } from '../data/plantCatalog';
import { PlantCatalogItem } from '../types/garden';

export const CompanionGuideView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedPlant, setSelectedPlant] = useState<PlantCatalogItem>(PLANT_CATALOG[0]); // Tomate by default

  const filteredPlants = PLANT_CATALOG.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.goodCompanions.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
          Guide des Associations Végétales &amp; Compagnonnage
        </h1>
        <p className="text-sm text-stone-500 mt-0.5">
          Appliquez les principes de la permaculture : associez les plantes qui s'entraident pour stimuler la croissance, repousser naturellement les ravageurs et enrichir le sol sans chimie.
        </p>
      </div>

      {/* Main interactive area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Plant Picker */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Filtrer un légume ou aromate..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
              {filteredPlants.map((plant) => {
                const isSelected = plant.id === selectedPlant.id;
                return (
                  <button
                    key={plant.id}
                    onClick={() => setSelectedPlant(plant)}
                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{plant.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs truncate font-semibold">{plant.name}</p>
                        <p className={`text-[10px] italic truncate ${isSelected ? 'text-emerald-100' : 'text-stone-400'}`}>
                          {plant.latinName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        +{plant.goodCompanions.length}
                      </span>
                      {plant.badCompanions.length > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-md font-bold ${
                          isSelected ? 'bg-rose-900 text-rose-100' : 'bg-rose-50 text-rose-700'
                        }`}>
                          -{plant.badCompanions.length}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column: Companion details for selected plant */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-xs space-y-6">
            {/* Header of selected plant */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-3xl shadow-xs">
                  {selectedPlant.icon}
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-stone-900">{selectedPlant.name}</h2>
                  <p className="text-xs italic text-stone-500 font-serif">{selectedPlant.latinName}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-600 font-medium">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100">Besoin eau : {selectedPlant.waterNeed}</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100">
                      {selectedPlant.sunNeed === 'full_sun' ? '☀️ Plein soleil' : '⛅ Mi-ombre'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100">~{selectedPlant.daysToHarvest} jours de culture</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Advice box */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-stone-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 block mb-0.5">Conseil de culture naturelle :</strong>
                <span>{selectedPlant.advice}</span>
              </div>
            </div>

            {/* Good companions */}
            <div>
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-3">
                <ThumbsUp className="w-4 h-4 text-emerald-600" />
                <span>Plantes amies / Associations très bénéfiques</span>
              </div>

              {selectedPlant.goodCompanions.length === 0 ? (
                <p className="text-xs text-stone-400 italic">Aucune association spécifique documentée.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedPlant.goodCompanions.map((comp) => {
                    const companionData = PLANT_CATALOG.find(p => p.name.toLowerCase().includes(comp.toLowerCase()) || comp.toLowerCase().includes(p.name.toLowerCase()));
                    return (
                      <div
                        key={comp}
                        className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60 flex items-center gap-3"
                      >
                        <span className="text-2xl">{companionData?.icon || '🌿'}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{comp}</h4>
                          <span className="text-[10px] text-emerald-800 font-medium">Synergie protectrice</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bad companions */}
            <div>
              <div className="flex items-center gap-2 text-rose-800 font-extrabold text-sm mb-3">
                <ThumbsDown className="w-4 h-4 text-rose-600" />
                <span>À éloigner / Associations défavorables</span>
              </div>

              {selectedPlant.badCompanions.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  Aucun ennemi majeur connu au potager pour cette plante. Voisinage paisible !
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedPlant.badCompanions.map((comp) => {
                    const badData = PLANT_CATALOG.find(p => p.name.toLowerCase().includes(comp.toLowerCase()) || comp.toLowerCase().includes(p.name.toLowerCase()));
                    return (
                      <div
                        key={comp}
                        className="p-3 rounded-xl bg-rose-50/50 border border-rose-200/60 flex items-center gap-3"
                      >
                        <span className="text-2xl">{badData?.icon || '🚫'}</span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{comp}</h4>
                          <span className="text-[10px] text-rose-700 font-medium">Compétition ou maladies partagées</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Permaculture Golden Rules */}
          <div className="bg-stone-900 text-white p-5 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Les 3 Règles d'Or du Compagnonnage Bio</span>
            </div>
            <ul className="text-xs text-stone-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">1.</span>
                <span><strong>Les Aromatiques font barrière :</strong> Le parfum puissant du basilic, de la menthe ou du thym brouille les capteurs olfactifs des pucerons et des papillons ravageurs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">2.</span>
                <span><strong>Les Légumineuses nourrissent :</strong> Les pois et haricots fixent l'azote de l'air pour enrichir le sol au profit des courgettes et tomates gourmandes.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">3.</span>
                <span><strong>Les Fleurs gardiennes :</strong> L'œillet d'Inde assainit les racines contre les nématodes, et la capucine attire les pucerons à elle pour préserver vos légumes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
