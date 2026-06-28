# SpeedType

SpeedType est un jeu web de rapidité et de précision au clavier, développé en React et TypeScript. Il propose plusieurs modes de jeu, un classement en ligne, des défis mensuels et une interface multilingue. Projet personnel en développement continu.

## Démo

Jouer en ligne : [julesgilli.github.io/SpeedType](https://julesgilli.github.io/SpeedType/)

## Fonctionnalités

- **Modes de jeu** : Classique, Inversé, Leet, Mémoire, Blind, Phrase infinie
- **Classements en ligne** : hebdomadaire, mensuel et tout temps, gérés via Supabase
- **Défis mensuels** : 10 quêtes renouvelées chaque mois, points attribués selon la difficulté et la précocité, avec un classement dédié
- **Comptes utilisateurs** : connexion via Google (OAuth)
- **Multilingue** : Français, English, Español, Deutsch, Italiano
- **Interface animée** : fond shader (Dither), chute des mots validés, écran d'introduction interactif
- **Scoring temps réel** : combos, score dynamique et WPM en direct

## Stack technique

- [React](https://reactjs.org/) et [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) pour le build et le serveur de développement
- [TailwindCSS](https://tailwindcss.com/) pour le style
- [Framer Motion](https://www.framer.com/motion/) pour les animations
- [three.js](https://threejs.org/) et React Three Fiber pour le fond animé
- [Supabase](https://supabase.com/) pour l'authentification, la base de données, les classements et les défis

## Installation

Le code de l'application se trouve dans le sous-dossier `Speed-typo/`.

```bash
# 1. Cloner le dépôt
git clone https://github.com/JulesGilli/SpeedType.git

# 2. Se placer dans le dossier de l'application
cd SpeedType/Speed-typo

# 3. Installer les dépendances
npm install

# 4. Configurer les variables d'environnement
cp .env.example .env.local
# puis renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 5. Lancer le serveur de développement
npm run dev
```

L'application est accessible sur [http://localhost:5173/SpeedType/](http://localhost:5173/SpeedType/).

## Structure du projet

```
.
├── .github/workflows/    # CI/CD : déploiement GitHub Pages
└── Speed-typo/           # Application
    ├── src/
    │   ├── components/    # Composants React
    │   ├── lib/           # Supabase, auth, i18n, accès données
    │   ├── types/         # Types partagés
    │   └── utils/         # Logique de jeu
    └── supabase/
        └── migrations/    # Schéma de la base (tables, RLS, fonctions)
```

## Déploiement

Le site est déployé automatiquement sur GitHub Pages via GitHub Actions à chaque push sur `main` (voir [.github/workflows/deploy.yml](.github/workflows/deploy.yml)). La base de données est gérée par migrations Supabase.

## Auteur

Développé par Jules GILLI — [linkedin.com/in/julesgilli](https://linkedin.com/in/julesgilli)
