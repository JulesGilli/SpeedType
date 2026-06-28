# 🎮 Speed Type

**Speed Type** est un jeu web de rapidité et de précision au clavier, développé en React et TypeScript. Plusieurs modes de jeu, un classement en ligne, des défis mensuels et une interface multilingue. Conçu comme un serious game fun, il évolue constamment !

👉 **Projet en cours de développement**

## 🚀 Démo

Joue directement ici :
🔗 [https://julesgilli.github.io/SpeedType/](https://julesgilli.github.io/SpeedType/)

---

## 🕹️ Fonctionnalités

- ✅ Plusieurs **modes de jeu** : Classique, Inversé, Leet, Mémoire, Blind, Phrase infinie
- 🏆 **Classements** en ligne (hebdomadaire, mensuel, tout temps) via Supabase
- 🎯 **Défis mensuels** : 10 quêtes renouvelées chaque mois, points selon la difficulté et la précocité, classement dédié
- 🔐 **Comptes** avec connexion Google
- 🌍 **Multilingue** : Français, English, Español, Deutsch, Italiano
- ✨ Fond animé (shader Dither), effets de chute des mots, écran d'intro à taper
- ⚡ Combos, scoring dynamique et WPM en direct

---

## 🧰 Stack technique

- [React](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (animations)
- [three.js](https://threejs.org/) / React Three Fiber (fond animé)
- [Supabase](https://supabase.com/) (auth, base de données, classements, défis)

---

## 🛠️ Installation

> ⚠️ Le code de l'application se trouve dans le sous-dossier **`Speed-typo/`**.

```bash
# 1. Clone le dépôt
git clone https://github.com/JulesGilli/SpeedType.git

# 2. Va dans le dossier de l'app
cd SpeedType/Speed-typo

# 3. Installe les dépendances
npm install

# 4. Configure les variables d'environnement
cp .env.example .env.local
# puis renseigne VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY

# 5. Lance le serveur local
npm run dev
```

Le jeu sera accessible sur [http://localhost:5173/SpeedType/](http://localhost:5173/SpeedType/)

---

## 📂 Structure du projet

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

---

## ☁️ Déploiement

Le site est déployé automatiquement sur **GitHub Pages** via **GitHub Actions** à chaque push sur `main` (voir [.github/workflows/deploy.yml](.github/workflows/deploy.yml)). La base de données est gérée par migrations Supabase.

---

## 🙌 Auteur

Développé par **Jules GILLI**
📫 [linkedin.com/in/julesgilli](https://linkedin.com/in/julesgilli)
