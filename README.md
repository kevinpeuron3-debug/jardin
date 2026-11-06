# 🌿 Mon Jardinier - Application de Suivi de Jardin & Potager

Application web moderne et réactive pour suivre et optimiser vos cultures, parcelles, récoltes et arrosages, synchronisée en temps réel avec Google Cloud Firebase Firestore et prête à être déployée sur Vercel.

## ✨ Fonctionnalités

- 🏡 **Gestion des Parcelles & Espaces** : Carrés potagers, serres, planches de culture, bacs avec exposition au soleil et type de sol.
- 🌱 **Suivi des Plantations & Semis** : Cycle de vie complet (Semé, Levée, Repiqué, En croissance, En récolte, Terminé).
- 💧 **Rappels d'Arrosage Intelligents** : Calcul automatique des besoins selon la fréquence et bouton d'arrosage rapide en un clic.
- 🧺 **Journal des Récoltes** : Enregistrement des rendements (poids en kg / quantité), évaluation de la qualité et statistiques de production.
- 🐝 **Compagnonnage & Associations Végétales** : Guide des plantes amies (ex: Tomates + Basilic + Œillets d'Inde) et associations à éviter (ex: Haricots + Oignons).
- 📅 **Calendrier & Tâches du Potager** : Planification des travaux au fil des saisons (semis sous abri, repiquage, paillage, taille).
- ☁️ **Synchronisation Firebase Firestore** : Données sauvegardées et synchronisées en temps réel entre vos appareils.

---

## 🚀 Déploiement sur Vercel

Le projet est configuré avec un fichier `vercel.json` optimisé pour Vite SPA.

### Étape 1 : Mettre le code sur GitHub ou GitLab
1. Créez un nouveau dépôt sur GitHub (ex: `mon-jardin-potager`).
2. Poussez votre projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Mon Jardinier"
   git branch -M main
   git remote add origin https://github.com/VOTRE_UTILISATEUR/mon-jardin-potager.git
   git push -u origin main
   ```

### Étape 2 : Importer le projet sur Vercel
1. Rendez-vous sur [vercel.com](https://vercel.com) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **"Add New..."** > **"Project"**.
3. Sélectionnez le dépôt `mon-jardin-potager`.
4. Framework Preset : **Vite** (automatiquement détecté).
5. Build Command : `npm run build`
6. Output Directory : `dist`

### Étape 3 : Autoriser le domaine Vercel dans Firebase
Pour permettre l'authentification Google sur votre site Vercel :
1. Rendez-vous dans la [Console Firebase](https://console.firebase.google.com/).
2. Sélectionnez votre projet (`dappled-enterprise-bxq1s`).
3. Allez dans **Authentication** > onglet **Paramètres** (Settings) > **Domaines autorisés** (Authorized Domains).
4. Cliquez sur **Ajouter un domaine** et ajoutez l'URL fournie par Vercel (ex: `mon-jardin.vercel.app`).
5. Cliquez sur **Deploy** sur Vercel : votre potager est en ligne et fonctionnel !
