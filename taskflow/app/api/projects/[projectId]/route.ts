// ======================================
// API ROUTE - DÉTAILS DU PROJET
// ======================================
// GET /api/projects/[projectId] - Récupérer les détails d'un projet
// PUT /api/projects/[projectId] - Mettre à jour un projet
// DELETE /api/projects/[projectId] - Supprimer un projet

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/projects/[projectId]
 * Récupère les détails complets d'un projet incluant les tâches
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { projectId } = params;

        // Récupérer le projet avec toutes ses relations
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                },
                tasks: {
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
                                        email: true,
                                        avatar: true
                                    }
                                }
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                users: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        // Calculer les statistiques des tâches
        const taskStats = {
            total: project.tasks.length,
            todo: project.tasks.filter(t => t.status === 'todo').length,
            in_progress: project.tasks.filter(t => t.status === 'in_progress').length,
            done: project.tasks.filter(t => t.status === 'done').length
        };

        // Calculer le pourcentage de progression
        const progressPercentage = project.tasks.length > 0
            ? Math.round((taskStats.done / project.tasks.length) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            data: {
                ...project,
                taskStats,
                progressPercentage,
                collaboratorsCount: project.users.length + 1
            }
        });
    } catch (error) {
        console.error('❌ Erreur API GET /projects/[projectId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/projects/[projectId]
 * Met à jour les détails d'un projet
 * Body: { title, description }
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        const { projectId } = params;
        const body = await request.json();
        const { title, description } = body;

        // Récupérer le projet
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur est le créateur
        const user = await prisma.user.findFirst({
            where: { email: { not: undefined } }
        });

        if (project.createdById !== user?.id) {
            return NextResponse.json(
                { error: 'Vous n\'avez pas la permission de modifier ce projet' },
                { status: 403 }
            );
        }

        // Mettre à jour le projet
        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: {
                title: title?.trim() || project.title,
                description: description?.trim() || project.description
            },
            include: {
                createdBy: true,
                tasks: true,
                users: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Projet mis à jour avec succès',
            data: updatedProject
        });
    } catch (error) {
        console.error('❌ Erreur API PUT /projects/[projectId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/projects/[projectId]
 * Supprime un projet (action destructive)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        const { projectId } = params;

        // Récupérer le projet
        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur est le créateur
        const user = await prisma.user.findFirst({
            where: { email: { not: undefined } }
        });

        if (project.createdById !== user?.id) {
            return NextResponse.json(
                { error: 'Vous n\'avez pas la permission de supprimer ce projet' },
                { status: 403 }
            );
        }

        // Supprimer le projet (les tâches seront supprimées en cascade)
        await prisma.project.delete({
            where: { id: projectId }
        });

        return NextResponse.json({
            success: true,
            message: 'Projet supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur API DELETE /projects/[projectId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
