
# 📋 TaskFlow - Plateforme de Gestion de Projets Collaboratifs

Une application web moderne et complète pour gérer des projets collaboratifs avec **Next.js 15**, **Prisma**, **TypeScript**, **Tailwind CSS** et **Clerk**.

## 🎯 Objectif

TaskFlow est un **MVP (Minimum Viable Product)** conçu pour permettre aux équipes de gérer efficacement leurs projets et tâches en temps réel. La plateforme offre une expérience collaborative intuitive avec authentification sécurisée et gestion d'état complète.

---

## ✨ Fonctionnalités Principales

### 🔐 Authentification & Profil
- ✅ Inscription/Connexion sécurisée via **Clerk**
- ✅ Gestion des rôles (Admin / Membre)
- ✅ Profil utilisateur avec avatar
- ✅ Sessions persistantes

### 📁 Gestion des Projets (CRUD Complet)
- ✅ Créer/Lister/Modifier/Supprimer des projets
- ✅ Code d'invitation unique pour partager les projets
- ✅ Gestion des collaborateurs
- ✅ Pagination des projets
- ✅ Statistiques en temps réel

### 📝 Gestion des Tâches
- ✅ Créer/Assigner des tâches
- ✅ Changer les statuts (À faire, En cours, Terminé)
- ✅ Définir la priorité (Basse, Moyenne, Haute)
- ✅ Fixer des échéances
- ✅ Filtrer par statut/priorité/assignation

### 🎨 Interface Utilisateur Dynamique
- ✅ Design responsive (Mobile, Tablet, Desktop)
- ✅ Carte visuelle avec barres de progression
- ✅ Notifications Toast (succès/erreur)
- ✅ Mode clair/sombre
- ✅ Accessibilité ARIA

### 💬 Collaboration (Bonus)
- ✅ Commentaires sur les tâches
- ✅ Historique des modifications
- ✅ Notifications visuelles

---

## 🛠️ Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Framework Frontend** | Next.js | 15.5.15 |
| **Langage** | TypeScript | 5.x |
| **ORM Base de Données** | Prisma | 5.22.0 |
| **Base de Données** | SQLite | Latest |
| **UI Framework** | Tailwind CSS + DaisyUI | Latest |
| **Authentification** | Clerk | 6.3.4 |
| **Icons** | Lucide React | 0.460.0 |
| **Notifications** | React Toastify | 10.0.6 |
| **Node Version** | Node.js | 18+ |

---

## 📦 Installation

### 1️⃣ Prérequis
```bash
# Assurez-vous d'avoir Node.js 18+ installé
node --version  # Doit afficher v18.0.0 ou plus
npm --version   # Doit afficher 9.0.0 ou plus
```

### 2️⃣ Cloner et Installer
```bash
# Cloner le projet
git clone https://github.com/sadikou-faiz/taskflow.git
cd taskflow

# Installer les dépendances
npm install
```

### 3️⃣ Configuration des Variables d'Environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer .env.local et remplir les valeurs
```

**Variables d'environnement requises** (`.env.local`):

```env
# ======================================
# BASE DE DONNÉES
# ======================================
# Utilise SQLite pour le développement
DATABASE_URL="file:./prisma/dev.db"

# ======================================
# CLERK AUTHENTIFICATION
# Créer un compte sur https://dashboard.clerk.com
# ======================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# URLs de redirection après authentification
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ======================================
# APPLICATION
# ======================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4️⃣ Configuration de la Base de Données
```bash
# Générer le client Prisma
npx prisma generate

# Créer et migrer la base de données
npx prisma migrate dev --name init

# (Optionnel) Peupler avec des données de test
npx prisma db seed
```

### 5️⃣ Lancer l'Application
```bash
# Développement
npm run dev

# Production
npm run build && npm run start
```

L'application sera accessible à: **http://localhost:3000**

---

## 📁 Structure du Projet

```
taskflow/
├── app/                          # Application Next.js
│   ├── api/                      # Routes API RESTful
│   │   ├── projects/            # Endpoints projets
│   │   ├── tasks/               # Endpoints tâches
│   │   ├── comments/            # Endpoints commentaires
│   │   └── users/               # Endpoints utilisateurs
│   ├── components/              # Composants React réutilisables
│   │   ├── ProjectComponent.tsx # Carte de projet
│   │   ├── TaskComponent.tsx    # Carte de tâche
│   │   ├── Navbar.tsx           # Barre de navigation
│   │   ├── AuthWrapper.tsx      # Wrapper d'authentification
│   │   └── ...
│   ├── project/                 # Pages de projet
│   │   └── [projectId]/page.tsx # Détails du projet
│   ├── task-details/            # Pages de tâche
│   │   └── [taskId]/page.tsx    # Détails de la tâche
│   ├── sign-in/                 # Page de connexion (Clerk)
│   ├── sign-up/                 # Page d'inscription (Clerk)
│   ├── actions.ts               # Server actions (CRUD)
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Page d'accueil
│   └── globals.css              # Styles globaux
│
├── lib/
│   └── prisma.ts                # Instance Prisma client
│
├── prisma/
│   ├── schema.prisma            # Schéma de base de données
│   ├── dev.db                   # Base de données SQLite
│   └── migrations/              # Historique des migrations
│
├── public/                       # Fichiers statiques
│   └── profile.avif             # Image d'exemple
│
├── middleware.ts                # Middleware Clerk
├── next.config.ts               # Configuration Next.js
├── tailwind.config.ts           # Configuration Tailwind CSS
├── tsconfig.json                # Configuration TypeScript
├── package.json                 # Dépendances du projet
├── .env.example                 # Template variables d'environnement
└── README.md                    # Ce fichier
```

---

## 🌐 API RESTful - Endpoints

### 📊 Projets

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/projects` | Récupérer tous les projets |
| `POST` | `/api/projects` | Créer un nouveau projet |
| `GET` | `/api/projects/[projectId]` | Récupérer détails d'un projet |
| `PUT` | `/api/projects/[projectId]` | Modifier un projet |
| `DELETE` | `/api/projects/[projectId]` | Supprimer un projet |

**Exemple - Créer un projet:**
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon Projet",
    "description": "Description du projet"
  }'
```

### ✅ Tâches

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/tasks` | Récupérer les tâches (avec filtres) |
| `POST` | `/api/tasks` | Créer une nouvelle tâche |
| `GET` | `/api/tasks/[taskId]` | Récupérer détails d'une tâche |
| `PUT` | `/api/tasks/[taskId]` | Modifier une tâche |
| `DELETE` | `/api/tasks/[taskId]` | Supprimer une tâche |

### 💬 Commentaires

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/comments` | Ajouter un commentaire |
| `DELETE` | `/api/comments/[commentId]` | Supprimer un commentaire |

---

## 🔒 Sécurité

### ✅ Implémentée

- 🔐 **Authentification JWT** via Clerk
- 🛡️ **Middleware d'authentification** pour les routes protégées
- 🔍 **Validation des entrées** côté serveur
- 📌 **Protection CORS** configurée
- 🔑 **Variables d'environnement** pour les secrets
- 🧹 **Sanitisation des données** en base de données
- 🚫 **Contrôle d'accès** (utilisateur ne peut modifier que ses projets)

---

## 📱 Responsive Design

L'application est optimisée pour tous les appareils :
- ✅ iPhone/Android
- ✅ iPad/Tablettes
- ✅ Écrans larges (1920px+)

---

## ♿ Accessibilité

- ✅ ARIA labels sur les boutons/inputs
- ✅ Contraste des couleurs conforme WCAG
- ✅ Navigation au clavier fonctionnelle
- ✅ Alt text sur les images
- ✅ Structure sémantique HTML

---

## 🚀 Déploiement

### Déployer sur Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Variables d'environnement à configurer sur Vercel
```

---

## 🐛 Dépannage

### La base de données ne se crée pas
```bash
chmod 755 prisma/
rm -rf prisma/dev.db
npx prisma migrate dev --name init
```

### Problème de Clerk
- Vérifier que les clés Clerk sont correctes dans `.env.local`
- Configurer l'URL de callback sur le dashboard Clerk

### Port 3000 déjà utilisé
```bash
npm run dev -- -p 3001
```

---

## 📊 Schéma de Base de Données

```
User 1:N Project (créateur)
User M:N Project (collaborateurs)
Project 1:N Task
User 1:N Task (assigné)
Task 1:N Comment
User 1:N Comment
```

---

## 🤝 Contribution

Les contributions sont bienvenues ! Consulter les issues ouvertes.

---

## 👨‍💻 Auteur

**Sadikou Faiz**
- GitHub: [@sadikou-faiz](https://github.com/sadikou-faiz)

---

**Dernière mise à jour:** 20 Avril 2024  
**Version:** 1.0.0  
**Statut:** ✅ Production Ready


