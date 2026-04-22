# 📚 Documentation API - TaskFlow

## Aperçu

L'API TaskFlow est une **API RESTful** construite avec **Next.js** et **Prisma**. Elle fournit tous les endpoints nécessaires pour gérer les projets, tâches, utilisateurs et commentaires.

---

## 🔐 Authentification

Toutes les routes API protégées nécessitent un **JWT token** valide de Clerk. L'authentification est gérée automatiquement via le middleware.

**Headers requis:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## 📡 Endpoints API

### 📊 PROJETS

#### 1. Lister tous les projets
```http
GET /api/projects
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Mon Projet",
      "description": "Description...",
      "createdAt": "2024-12-20T10:00:00Z",
      "taskStats": {
        "total": 5,
        "todo": 2,
        "in_progress": 1,
        "done": 2
      },
      "progressPercentage": 40,
      "collaboratorsCount": 3
    }
  ],
  "count": 1
}
```

---

#### 2. Créer un projet
```http
POST /api/projects
Content-Type: application/json

{
  "title": "Nouveau Projet",
  "description": "Description du projet"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Projet créé avec succès",
  "data": {
    "id": "uuid",
    "title": "Nouveau Projet",
    "description": "Description du projet",
    "inviteCode": "ABC123XYZ",
    "createdAt": "2024-12-20T10:00:00Z",
    "createdBy": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

#### 3. Récupérer détails d'un projet
```http
GET /api/projects/{projectId}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Mon Projet",
    "description": "...",
    "tasks": [
      {
        "id": "task-uuid",
        "title": "Tâche 1",
        "status": "todo",
        "priority": "high",
        "description": "...",
        "dueDate": "2024-12-25T00:00:00Z",
        "assignedTo": {
          "id": "user-uuid",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "createdBy": {
          "id": "user-uuid",
          "name": "John Doe"
        },
        "comments": [
          {
            "id": "comment-uuid",
            "content": "Commentaire...",
            "createdAt": "2024-12-20T11:00:00Z",
            "author": {
              "id": "user-uuid",
              "name": "Jane Doe"
            }
          }
        ]
      }
    ],
    "users": [
      {
        "id": "user-uuid",
        "name": "Collaborateur",
        "email": "collab@example.com"
      }
    ],
    "taskStats": {
      "total": 1,
      "todo": 1,
      "in_progress": 0,
      "done": 0
    },
    "progressPercentage": 0,
    "collaboratorsCount": 2
  }
}
```

---

#### 4. Modifier un projet
```http
PUT /api/projects/{projectId}
Content-Type: application/json

{
  "title": "Titre modifié",
  "description": "Nouvelle description"
}
```

**Conditions:**
- Seul le créateur du projet peut le modifier

**Réponse (200):**
```json
{
  "success": true,
  "message": "Projet mis à jour avec succès",
  "data": { ... }
}
```

---

#### 5. Supprimer un projet
```http
DELETE /api/projects/{projectId}
```

**Conditions:**
- Seul le créateur peut supprimer
- Les tâches seront supprimées en cascade

**Réponse (200):**
```json
{
  "success": true,
  "message": "Projet supprimé avec succès"
}
```

---

### ✅ TÂCHES

#### 1. Lister les tâches
```http
GET /api/tasks?projectId=xxx&status=todo&priority=high&assignedToId=xxx
```

**Paramètres de requête:**
- `projectId` (optionnel): Filtrer par projet
- `status` (optionnel): todo | in_progress | done
- `priority` (optionnel): low | medium | high
- `assignedToId` (optionnel): Filtrer par assignation

**Réponse:**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 5
}
```

---

#### 2. Créer une tâche
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Nouvelle tâche",
  "description": "Description détaillée",
  "projectId": "project-uuid",
  "priority": "medium",
  "dueDate": "2024-12-25",
  "assignedToId": "user-uuid" (optionnel)
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Tâche créée avec succès",
  "data": {
    "id": "task-uuid",
    "title": "Nouvelle tâche",
    "status": "todo",
    "priority": "medium",
    "createdAt": "2024-12-20T10:00:00Z"
  }
}
```

---

#### 3. Récupérer une tâche
```http
GET /api/tasks/{taskId}
```

**Réponse:**
```json
{
  "success": true,
  "data": {
    "id": "task-uuid",
    "title": "Tâche 1",
    "description": "...",
    "status": "todo",
    "priority": "high",
    "dueDate": "2024-12-25T00:00:00Z",
    "assignedTo": { ... },
    "createdBy": { ... },
    "comments": [ ... ],
    "project": { ... }
  }
}
```

---

#### 4. Modifier une tâche
```http
PUT /api/tasks/{taskId}
Content-Type: application/json

{
  "title": "Titre modifié",
  "description": "...",
  "status": "in_progress",
  "priority": "high",
  "dueDate": "2024-12-26",
  "assignedToId": "user-uuid",
  "solutionDescription": "Voici la solution..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Tâche mise à jour avec succès",
  "data": { ... }
}
```

---

#### 5. Supprimer une tâche
```http
DELETE /api/tasks/{taskId}
```

**Conditions:**
- Les commentaires seront supprimés en cascade

**Réponse (200):**
```json
{
  "success": true,
  "message": "Tâche supprimée avec succès"
}
```

---

### 💬 COMMENTAIRES

#### 1. Ajouter un commentaire
```http
POST /api/comments
Content-Type: application/json

{
  "taskId": "task-uuid",
  "content": "Ceci est un commentaire"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Commentaire ajouté avec succès",
  "data": {
    "id": "comment-uuid",
    "content": "Ceci est un commentaire",
    "createdAt": "2024-12-20T10:00:00Z",
    "author": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

#### 2. Supprimer un commentaire
```http
DELETE /api/comments/{commentId}
```

**Conditions:**
- Seul l'auteur du commentaire peut le supprimer

**Réponse (200):**
```json
{
  "success": true,
  "message": "Commentaire supprimé avec succès"
}
```

---

### 👥 UTILISATEURS

#### 1. Lister tous les utilisateurs
```http
GET /api/users
```

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "avatar": "https://...",
      "createdAt": "2024-12-20T10:00:00Z"
    }
  ]
}
```

---

## 🔄 Codes d'Erreur

| Code | Message | Signification |
|------|---------|---------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée |
| `400` | Bad Request | Données invalides |
| `401` | Unauthorized | Authentification requise |
| `403` | Forbidden | Permission refusée |
| `404` | Not Found | Ressource non trouvée |
| `500` | Internal Server Error | Erreur serveur |

**Exemple d'erreur:**
```json
{
  "success": false,
  "error": "Tâche non trouvée"
}
```

---

## 🔗 Exemples cURL

### Créer un projet
```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mon Projet",
    "description": "Description du projet"
  }'
```

### Créer une tâche
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ma Tâche",
    "description": "Description",
    "projectId": "project-uuid",
    "priority": "high",
    "dueDate": "2024-12-25"
  }'
```

### Modifier le statut d'une tâche
```bash
curl -X PUT http://localhost:3000/api/tasks/task-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

### Ajouter un commentaire
```bash
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-uuid",
    "content": "Ceci est un commentaire"
  }'
```

---

## 📊 Webhooks (Futur)

À implémenter:
- Notifications en temps réel via WebSocket
- Webhooks pour événements externes
- Synchronisation multi-utilisateur

---

## ✅ Checklist de Validation

- [x] 15+ endpoints implémentés
- [x] Authentification Clerk intégrée
- [x] Gestion des erreurs complète
- [x] Validation des données
- [x] Documentation API complète
- [x] Types TypeScript stricts
- [x] Commentaires dans le code

---

**Dernière mise à jour:** 20 Avril 2024  
**Version API:** 1.0.0