// ======================================
// API ROUTE - TÂCHES
// ======================================
// POST /api/tasks - Créer une nouvelle tâche
// GET /api/tasks - Récupérer les tâches avec filtres

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/tasks
 * Crée une nouvelle tâche dans un projet
 * Body: { title, description, projectId, priority, dueDate, assignedToId }
 */
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { title, description, projectId, priority = 'medium', dueDate, assignedToId } = body;

        // Valider les données
        if (!title || !projectId) {
            return NextResponse.json(
                { error: 'Titre et ID du projet requis' },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur créateur
        const user = await prisma.user.findFirst({
            where: { email: { not: undefined } }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que le projet existe
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        // Créer la tâche
        const newTask = await prisma.task.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                projectId,
                createdById: user.id,
                priority,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                assignedToId: assignedToId || undefined,
                status: 'todo'
            },
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Tâche créée avec succès',
                data: newTask
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Erreur API POST /tasks:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/tasks
 * Récupère les tâches avec filtres optionnels
 * Query params: projectId, status, priority, assignedToId
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const projectId = searchParams.get('projectId');
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');
        const assignedToId = searchParams.get('assignedToId');

        // Construire les conditions de filtrage
        const where: any = {};
        if (projectId) where.projectId = projectId;
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (assignedToId) where.assignedToId = assignedToId;

        // Récupérer les tâches
        const tasks = await prisma.task.findMany({
            where,
            include: {
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                comments: {
                    include: {
                        author: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true
                            }
                        }
                    }
                },
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            success: true,
            data: tasks,
            count: tasks.length
        });
    } catch (error) {
        console.error('❌ Erreur API GET /tasks:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
