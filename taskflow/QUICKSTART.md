# 🚀 QUICKSTART - Démarrage Rapide TaskFlow

## ⚡ En 5 minutes

### 1️⃣ Prérequis
```bash
# Vérifier Node.js et npm
node --version  # v18+
npm --version   # 9+
```

### 2️⃣ Cloner & Installer
```bash
# Cloner le projet
git clone https://github.com/sadikou-faiz/taskflow.git
cd taskflow

# Installer les dépendances
npm install
```

### 3️⃣ Configurer Clerk (Authentification)

1. **Créer un compte Clerk:**
   - Aller sur https://dashboard.clerk.com
   - Créer une nouvelle application
   - Copier les clés

2. **Créer le fichier `.env.local`:**
```bash
# Copier depuis le template
cp .env.example .env.local

# Éditer et remplacer les clés Clerk
nano .env.local
```

3. **Variables essentielles:**
```env
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4️⃣ Base de Données
```bash
# Générer le client Prisma
npx prisma generate

# Créer la base de données
npx prisma migrate dev --name init

# (Optionnel) Voir la base de données
npx prisma studio
```

### 5️⃣ Lancer l'App
```bash
npm run dev
```

**L'app démarre sur:** http://localhost:3000

---

## ✅ Fonctionnalités Clés

| Fonctionnalité | Commande | URL |
|---|---|---|
| **Page d'accueil** | `npm run dev` | http://localhost:3000 |
| **Inscription** | Auto | http://localhost:3000/sign-up |
| **Connexion** | Auto | http://localhost:3000/sign-in |
| **Projets** | Auto | http://localhost:3000 |
| **Détails Projet** | Click | http://localhost:3000/project/[id] |
| **API Projets** | Fetch | http://localhost:3000/api/projects |
| **API Tâches** | Fetch | http://localhost:3000/api/tasks |
| **Prisma Studio** | `npx prisma studio` | http://localhost:5555 |

---

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev              # Lancer en dev avec Turbopack
npm run build            # Build pour production
npm start                # Lancer en production

# Base de données
npx prisma migrate dev   # Créer une migration
npx prisma studio       # Interface graphique DB
npx prisma generate     # Générer le client

# Nettoyage
rm -rf .next node_modules  # Nettoyer le cache
npm install              # Réinstaller les dépendances
```

---

## 📝 Premier Test

### 1. S'inscrire
1. Aller sur http://localhost:3000
2. Cliquer sur "Sign Up"
3. Entrer email/mot de passe
4. Créer le compte

### 2. Créer un Projet
1. Cliquer sur "Nouveau Projet"
2. Entrer un titre
3. Cliquer "Créer"

### 3. Créer une Tâche
1. Cliquer sur le projet
2. Cliquer "Créer une nouvelle tâche"
3. Entrer un titre
4. Changer le statut à "En cours"

### 4. Tester l'API
```bash
# Récupérer les projets
curl http://localhost:3000/api/projects

# Créer une tâche
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test API",
    "projectId": "YOUR_PROJECT_ID",
    "priority": "high"
  }'
```

---

## 🐛 Dépannage Rapide

### ❌ "Cannot find module 'prisma'"
```bash
npm install @prisma/client prisma --save-dev
npx prisma generate
```

### ❌ "Port 3000 déjà utilisé"
```bash
npm run dev -- -p 3001
```

### ❌ "Database error"
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
```

### ❌ "Clerk error"
- Vérifier les clés dans `.env.local`
- Vérifier que Clerk a les URLs correctes
- Vérifier que l'app est active sur Clerk

---

## 📚 Documentation Complète

- **README.md** - Vue d'ensemble complète
- **API.md** - Documentation API détaillée
- **TESTING.md** - Guide de tests et validation
- **prisma/schema.prisma** - Schéma de données commenté

---

## 🎯 Prochaines Étapes

### Après le démarrage
1. ✅ Créer plusieurs projets
2. ✅ Inviter des collaborateurs (code d'invitation)
3. ✅ Créer des tâches variées
4. ✅ Tester tous les filtres
5. ✅ Ajouter des commentaires

### Pour aller plus loin
- [ ] Implémenter WebSockets pour notifications temps réel
- [ ] Ajouter les uploads de fichiers
- [ ] Générer des exports PDF
- [ ] Créer un calendrier des tâches
- [ ] Ajouter des tests automatisés

---

## 💡 Tips & Tricks

### Accélérateur de développement
```bash
# Utiliser Prisma Studio pour vérifier les données
npx prisma studio

# Voir les logs Prisma
export DEBUG="*"
npm run dev
```

### Debugging
```javascript
// Dans le code
console.log('🚀 Mon log:', myVariable);

// En Terminal
npm run dev  # Voir tous les logs
```

### Réinitialiser la base
```bash
# Supprimer tout et recommencer
rm prisma/dev.db
npx prisma migrate reset
```

---

## ✨ Stack Recap

```
Frontend:  Next.js 15 + React 19 + TypeScript
Backend:   Next.js API Routes + Node.js
Database:  SQLite + Prisma ORM
Auth:      Clerk
Styling:   Tailwind CSS + DaisyUI
Icons:     Lucide React
```

---

## 📞 Besoin d'aide?

1. **Consulter le README complet** - `README.md`
2. **Vérifier la doc API** - `API.md`
3. **Lire les guides de test** - `TESTING.md`
4. **Consulter la doc Prisma** - https://www.prisma.io/docs
5. **Consulter la doc Next.js** - https://nextjs.org/docs
6. **Consulter la doc Clerk** - https://clerk.com/docs

---

**C'est prêt! 🎉 Bon développement!**

Pour des mises à jour: https://github.com/sadikou-faiz/taskflow