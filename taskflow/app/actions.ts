"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * Vérifie si un utilisateur existe et le crée s'il n'existe pas
 */
export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (!existingUser && name) {
      await prisma.user.create({ data: { email, name } });
    }
  } catch (error) {
    console.error("❌ Erreur utilisateur:", error);
    throw error;
  }
}

function generateUniqueCode(): string {
  return randomBytes(6).toString("hex");
}

/**
 * Crée un nouveau projet
 * CORRECTION : Utilise 'title' selon ton schéma (pas 'name')
 */
export async function createProject(
  title: string,
  description: string,
  email: string,
) {
  try {
    const inviteCode = generateUniqueCode();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Utilisateur non trouvé");

    return await prisma.project.create({
      data: {
        title, // OK : Présent dans ton modèle Project
        description,
        inviteCode,
        createdById: user.id,
      },
    });
  } catch (error) {
    console.error("❌ Erreur création projet:", error);
    throw error;
  }
}

/**
 * Récupère les tâches d'un projet
 * CORRECTION : Utilise 'assignedTo' et 'createdAt' (présents dans ton schéma)
 */
export async function getProjectTasks(projectId: string) {
  try {
    return await prisma.task.findMany({
      where: { projectId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } }, // OK
        createdBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" }, // OK : Présent dans ton modèle Task
    });
  } catch (error) {
    console.error("❌ Erreur chargement tâches:", error);
    throw error;
  }
}

/**
 * Crée une tâche
 * CORRECTION : Utilise 'title' et 'assignedToId'
 */
export async function createTask(
  title: string,
  description: string,
  dueDate: Date | null,
  projectId: string,
  createdByEmail: string,
  assignToEmail: string | undefined,
) {
  try {
    // 1. Chercher ou créer l'utilisateur (upsert) pour éviter l'erreur
    const creator = await prisma.user.upsert({
      where: { email: createdByEmail },
      update: {}, // Si l'utilisateur existe, on ne change rien
      create: {
        email: createdByEmail,
        name: createdByEmail.split("@")[0], // Nom par défaut
      },
    });

    // Plus besoin du "if (!creator) throw...", car upsert garantit qu'il existe.

    let assignedUserId = null;
    if (assignToEmail) {
      const targetUser = await prisma.user.findUnique({
        where: { email: assignToEmail },
      });
      assignedUserId = targetUser?.id;
    }

    return await prisma.task.create({
      data: {
        title, // OK
        description,
        dueDate,
        projectId,
        createdById: creator.id,
        assignedToId: assignedUserId, // OK
      },
    });
  } catch (error) {
    console.error("❌ Erreur création tâche:", error);
    throw error;
  }
}

/**
 * Ajoute un commentaire
 */
export async function addComment(
  taskId: string,
  content: string,
  email: string,
) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Utilisateur non trouvé");

    return await prisma.comment.create({
      // OK : 'comment' (minuscule) pour modèle 'Comment'
      data: {
        content,
        taskId,
        authorId: user.id,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  } catch (error) {
    console.error("❌ Erreur commentaire:", error);
    throw error;
  }
}

/**
 * Met à jour le statut d'une tâche
 */
export async function updateTaskStatus(
  taskId: string,
  newStatus: string,
  solutionDescription?: string,
) {
  try {
    return await prisma.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        solutionDescription: solutionDescription || null, // OK
      },
    });
  } catch (error) {
    console.error("❌ Erreur statut:", error);
    throw error;
  }
}
/**
 * Récupère tous les projets créés par un utilisateur
 */
export async function getProjectsCreatedByUser(email: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        createdBy: { email },
      },
      include: {
        tasks: true,
        users: {
          include: {
            user: true,
          },
        },
      },
    });

    // On formate un peu pour simplifier l'usage côté client
    return projects.map((project) => ({
      ...project,
      users: project.users.map((u) => u.user),
    }));
  } catch (error) {
    console.error("❌ Erreur récupération projets:", error);
    throw error;
  }
}

/**
 * Supprime un projet par son ID
 * C'est cette fonction qui manquait à l'appel !
 */
export async function deleteProjectById(projectId: string) {
  try {
    await prisma.project.delete({
      where: { id: projectId },
    });
    console.log(`✅ Projet ${projectId} supprimé`);
  } catch (error) {
    console.error("❌ Erreur suppression projet:", error);
    throw error;
  }
}
/**
 * Ajoute un utilisateur à un projet via un code d'invitation
 */
export async function addUserToProject(email: string, inviteCode: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { inviteCode },
    });

    if (!project) throw new Error("Projet non trouvé avec ce code");

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("Utilisateur non trouvé");

    // Vérifier si déjà membre
    const existingMembership = await prisma.projectUser.findUnique({
      where: {
        userId_projectId: {
          userId: user.id,
          projectId: project.id,
        },
      },
    });

    if (existingMembership)
      throw new Error("Vous faites déjà partie de ce projet");

    // Créer le lien
    await prisma.projectUser.create({
      data: {
        userId: user.id,
        projectId: project.id,
      },
    });

    return "Bienvenue dans le projet !";
  } catch (error: any) {
    console.error("❌ Erreur ajout projet:", error);
    throw new Error(error.message || "Erreur lors de l'adhésion");
  }
}

/**
 * Récupère les projets où l'utilisateur est membre (collaborateur)
 */
export async function getProjectsAssociatedWithUser(email: string) {
  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            user: { email },
          },
        },
      },
      include: {
        tasks: true,
        users: {
          include: { user: true },
        },
        createdBy: true,
      },
    });

    return projects.map((project) => ({
      ...project,
      users: project.users.map((u) => u.user),
    }));
  } catch (error) {
    console.error("❌ Erreur récupération projets associés:", error);
    throw error;
  }
}

/**
 * Supprime une tâche par son ID
 */
export async function deleteTask(taskId: string) {
  try {
    await prisma.task.delete({
      where: { id: taskId },
    });
    console.log(`✅ Tâche ${taskId} supprimée avec succès`);
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la tâche:", error);
    throw new Error("Impossible de supprimer la tâche");
  }
}
/**
 * Récupère les informations de base d'un projet par son ID
 * (Requis par la page task-details pour afficher le contexte du projet)
 */
export async function getProjectInfo(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        title: true,
        description: true,
        inviteCode: true,
        createdAt: true,
        // On inclut le créateur pour savoir qui gère le projet
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) throw new Error("Projet introuvable");
    return project;
  } catch (error) {
    console.error("❌ Erreur getProjectInfo:", error);
    throw error;
  }
}

/**
 * Récupère les détails complets d'une tâche pour la page de détails
 */
export async function getTaskDetails(taskId: string) {
  try {
    return await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, avatar: true },
        },
        createdBy: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  } catch (error) {
    console.error("❌ Erreur getTaskDetails:", error);
    throw error;
  }
}
