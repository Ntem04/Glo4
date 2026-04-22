// ======================================
// TYPES TypeScript - TASKFLOW
// ======================================
// Définit tous les types utilisés dans l'application
// Étendue les types Prisma avec des propriétés supplémentaires

import {
  Project as PrismaProject,
  Task as PrismaTask,
  User as PrismaUser,
  Comment as PrismaComment,
  ProjectUser as PrismaProjectUser,
} from '@prisma/client';

/**
 * Type Utilisateur étendu
 * Ajoute des propriétés calculées au modèle Prisma User
 */
export type User = PrismaUser & {
  // Relations optionnelles
  tasks?: Task[];
  createdTasks?: Task[];
  projects?: Project[];
  userProjects?: ProjectUser[];
  comments?: Comment[];
};

/**
 * Type Projet étendu
 * Inclut les statistiques et informations relationnelles
 */
export type Project = PrismaProject & {
  // Relations
  createdBy?: User;
  tasks?: Task[];
  users?: ProjectUser[];

  // Statistiques calculées
  totalTasks?: number;
  collaboratorsCount?: number;
  progressPercentage?: number;

  // Statistiques par statut
  taskStats?: {
    total: number;
    todo: number;
    in_progress: number;
    done: number;
  };

  // Pourcentages par statut (legacy)
  percentages?: {
    progressPercentage: number;
    inProgressPercentage: number;
    toDoPercentage: number;
  };
};

/**
 * Type Tâche étendu
 * Inclut les relations et le contexte du projet
 */
export type Task = PrismaTask & {
  // Relations
  assignedTo?: User | null;
  createdBy?: User;
  project?: Project;
  comments?: Comment[];
};

/**
 * Type Commentaire étendu
 * Inclut l'auteur et les relations
 */
export type Comment = PrismaComment & {
  // Relations
  author?: User;
  task?: Task;
};

/**
 * Type Association Projet-Utilisateur
 * Gère l'appartenance d'un utilisateur à un projet
 */
export type ProjectUser = PrismaProjectUser & {
  // Relations
  user?: User;
  project?: Project;
};

/**
 * Réponse API générique
 * Structure standardisée pour toutes les réponses API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  count?: number;
}

/**
 * Paramètres de filtrage des tâches
 */
export interface TaskFilterParams {
  projectId?: string;
  status?: 'todo' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  assignedToId?: string;
}

/**
 * Paramètres de pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/**
 * État global de l'application (si Redux/Zustand est ajouté)
 */
export interface AppState {
  user: User | null;
  projects: Project[];
  currentProject: Project | null;
  tasks: Task[];
  loading: boolean;
  error: string | null;
}
