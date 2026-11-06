import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Cloud,
  ShieldCheck,
  Terminal,
  FileCode,
  AlertCircle
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

export const VercelDeployView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const gitSnippet = `git init
git add .
git commit -m "Mon Jardinier - Potager & Firebase"
git branch -M main
git remote add origin https://github.com/VOTRE_PSEUDO/mon-jardin-potager.git
git push -u origin main`;

  const vercelJsonContent = `{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

  const envSnippet = `VITE_FIREBASE_PROJECT_ID="${firebaseConfig.projectId}"
VITE_FIREBASE_APP_ID="${firebaseConfig.appId}"
VITE_FIREBASE_API_KEY="${firebaseConfig.apiKey}"
VITE_FIREBASE_AUTH_DOMAIN="${firebaseConfig.authDomain}"
VITE_FIREBASE_DATABASE_ID="${firebaseConfig.firestoreDatabaseId}"
VITE_FIREBASE_STORAGE_BUCKET="${firebaseConfig.storageBucket}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${firebaseConfig.messagingSenderId}"`;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 to-emerald-950 text-white p-6 sm:p-8 rounded-2xl shadow-md space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
          <Rocket className="w-3.5 h-3.5" />
          <span>Guide de Déploiement Vercel</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Publiez votre Potager sur Vercel 🚀
        </h1>
        <p className="text-sm text-stone-300 leading-relaxed max-w-2xl">
          Votre application est 100% prête pour Vercel : le fichier <code className="text-emerald-300 font-mono">vercel.json</code> est généré, Vite est configuré pour le build de production, et Firebase Firestore est provisionné.
        </p>
      </div>

      {/* Step by Step Accordion/Cards */}
      <div className="space-y-4">
        {/* Step 1: GitHub */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
                <Github className="w-4 h-4 text-stone-700" />
                <span>Pousser le code sur votre compte GitHub</span>
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(gitSnippet, 'git')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              {copiedSection === 'git' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier les commandes</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-stone-600">
            Ouvrez un terminal dans le dossier du projet ou téléchargez l'archive, puis exécutez ces commandes :
          </p>

          <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
            {gitSnippet}
          </pre>
        </div>

        {/* Step 2: Vercel Import */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <Cloud className="w-4 h-4 text-emerald-700" />
              <span>Connecter le dépôt dans Vercel</span>
            </h3>
          </div>

          <ol className="text-xs text-stone-700 space-y-2.5 list-decimal list-inside pl-1">
            <li>Rendez-vous sur <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">vercel.com <ExternalLink className="w-3 h-3" /></a> et connectez-vous avec GitHub.</li>
            <li>Cliquez sur <strong>"Add New..."</strong> puis <strong>"Project"</strong>.</li>
            <li>Importez votre dépôt <strong>mon-jardin-potager</strong>.</li>
            <li>Le Framework Preset sera détecté comme <strong>Vite</strong>.</li>
            <li>Commande de build : <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">npm run build</code></li>
            <li>Répertoire de sortie (Output directory) : <code className="bg-stone-100 px-1.5 py-0.5 rounded text-stone-800">dist</code></li>
          </ol>
        </div>

        {/* Step 3: Firebase Authorized Domains */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Autoriser le domaine Vercel dans Firebase (Crucial pour la connexion)</span>
            </h3>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              Pour que Google Sign-In fonctionne sur votre site déployé, vous devez autoriser l'URL de votre application Vercel dans la console Firebase.
            </span>
          </div>

          <ol className="text-xs text-stone-700 space-y-2 list-decimal list-inside pl-1">
            <li>Accédez à la console Firebase : <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`} target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline inline-flex items-center gap-1">Console Firebase du projet <ExternalLink className="w-3 h-3" /></a></li>
            <li>Allez dans <strong>Authentication</strong> &gt; Onglet <strong>Paramètres (Settings)</strong> &gt; <strong>Domaines autorisés (Authorized domains)</strong>.</li>
            <li>Cliquez sur <strong>Ajouter un domaine</strong>.</li>
            <li>Entrez votre domaine Vercel (ex: <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-emerald-800">mon-jardin.vercel.app</code>) ou simplement <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono">vercel.app</code>.</li>
            <li>Enregistrez : votre authentification et la base de données Firestore sont 100% opérationnelles en ligne !</li>
          </ol>
        </div>

        {/* Configuration Reference File */}
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-stone-900 text-sm">
              <FileCode className="w-4 h-4 text-emerald-700" />
              <span>Fichier vercel.json (Déjà présent dans le projet)</span>
            </div>
            <button
              onClick={() => copyToClipboard(vercelJsonContent, 'vercelJson')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
            >
              {copiedSection === 'vercelJson' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-stone-900 text-stone-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            {vercelJsonContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
