# 🌿 OptiTime - Smart Planning Manager

**OptiTime** est un gestionnaire de planification intelligent conçu pour transformer une simple liste de tâches en un emploi du temps réaliste, optimisé et protecteur de votre temps de concentration.

---

## 🚀 Vision du Projet

De nombreux étudiants et professionnels savent *ce qu'ils doivent faire*, mais peinent à savoir *par quoi commencer* ou comment répartir leur charge de travail de manière réaliste. 

OptiTime agit comme un **moteur d'ordonnancement miniature**. Au lieu de simplement stocker vos tâches, le système :
- Analyse vos échéances et priorités.
- Extrait vos créneaux libres en fonction de vos cours ou réunions fixes.
- Génère automatiquement un planning optimal.
- Détecte les risques de surcharge et les conflits.

---

## ✨ Fonctionnalités Clés

### 🧠 Génération Automatique de Planning
Plus besoin de glisser-déposer manuellement vos blocs de temps. OptiTime calcule un score pour chaque tâche (basé sur l'urgence, l'importance et la difficulté) et les place intelligemment dans vos fenêtres de disponibilité.

### ⚙️ Gestion des Contraintes (Hard & Soft)
- **Contraintes strictes** : Respect des heures de début/fin de journée, des événements fixes et des deadlines.
- **Contraintes souples** : Préférences pour les sessions de travail le matin, insertion automatique de pauses, et équilibrage de la charge sur la semaine.

### 📊 Tableau de Bord et Analytique
Visualisez votre productivité en un coup d'œil :
- Taux de complétion des tâches.
- Volume de "Focus Time" planifié.
- Signal de risque de burnout (surcharge).

### 📄 Export de Rapports PDF
Générez des rapports de performance professionnels nommés `rapport optitime [date].pdf` pour suivre votre progression ou partager votre planning.

### 🌍 Internationalisation (i18n)
L'interface complète est disponible en **Français** et en **Anglais**, configurable directement dans les paramètres.

---

## 🛠️ Stack Technique

OptiTime utilise les technologies les plus modernes pour garantir performance, esthétique et robustesse :

- **Frontend** : [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/)
- **Styling** : [Tailwind CSS 4.0](https://tailwindcss.com/) (pour un design premium et fluide)
- **Base de données & Auth** : [Supabase](https://supabase.com/) (PostgreSQL & GoTrue)
- **Génération PDF** : [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jspdf-autotable)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Typographie** : Polices modernes (Inter / Outfit) pour une lisibilité maximale.

---

## 📂 Structure du Projet

```text
├── app/                # Routes et pages (Dashboard, Planner, Settings, etc.)
├── components/         # Composants UI réutilisables et layout
├── features/           # Logique métier spécifique (Planning algorithm, Analytics)
├── lib/               # Utilitaires (API client, Formatage, Supabase config)
├── public/            # Assets statiques (Logos, images AI)
└── types/             # Définitions TypeScript
```

---

## ⚙️ Installation et Développement

### Pré-requis
- Node.js 20+
- Un compte Supabase (optionnel - l'app possède un mode démo local)

### Lancement en local

1.  **Cloner le dépôt**
    ```bash
    git clone `https://github.com/nuoremac/Pre_Hackverse_Thunderstorm.git`
    cd PRE_HACKVERSE_THUNDERSTORM
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Configurer les variables d'environnement**
    Renommez `.env.example` en `.env.local` et renseignez vos clés Supabase. 
    *Note: L'application détecte automatiquement si les clés sont absentes et bascule en mode démo.*

4.  **Lancer le serveur de développement**
    ```bash
    npm run dev
    ```
    L'application sera disponible sur `http://localhost:3000`.

---

## 🧠 Algorithme de Planification

L'intelligence d'OptiTime réside dans son algorithme "greedy" optimisé :
1. **Extraction** : Le système liste tous les créneaux libres (hors sommeil et événements fixes).
2. **Scoring** : Chaque tâche reçoit un score basé sur :
   - Proximité de la deadline
   - Priorité manuelle
   - Complexité
3. **Placement** : Les tâches sont placées une à une dans les meilleurs créneaux. Si une tâche est trop longue, elle est automatiquement découpée en blocs (splittable).
4. **Rescheduling** : En cas de retard ou d'ajout urgent, un clic suffit pour tout recalculer.

---

## 🎨 Design System

L'application suit une esthétique **Premium SaaS** :
- **Dark Mode compatible** : Palette de couleurs harmonieuse (Encres profondes, Accents verts émeraude).
- **Glassmorphism** : Utilisation de flous d'arrière-plan et de bordures subtiles.
- **Micro-animations** : Transitions fluides et interactions vivantes.

---
### Application web déployé

[https://pre-hackverse-thunderstorm.vercel.app](https://pre-hackverse-thunderstorm.vercel.app)


