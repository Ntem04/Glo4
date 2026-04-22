// ======================================
// API ROUTE - DÉTAILS DE LA TÂCHE
// ======================================
// GET /api/tasks/[taskId] - Récupérer une tâche
// PUT /api/tasks/[taskId] - Mettre à jour une tâche
// DELETE /api/tasks/[taskId] - Supprimer une tâche

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/tasks/[taskId]
 * Récupère les détails complets d'une tâche
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const { taskId } = params;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
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
                },
                project: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Tâche non trouvée' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: task
        });
    } catch (error) {
        console.error('❌ Erreur API GET /tasks/[taskId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/tasks/[taskId]
 * Met à jour une tâche
 * Body: { title, description, status, priority, dueDate, assignedToId, solutionDescription }
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        const { taskId } = params;
        const body = await request.json();

        // Récupérer la tâche
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Tâche non trouvée' },
                { status: 404 }
            );
        }

        // Préparer les données à mettre à jour
        const updateData: any = {};
        if (body.title !== undefined) updateData.title = body.title.trim();
        if (body.description !== undefined) updateData.description = body.description?.trim() || null;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.priority !== undefined) updateData.priority = body.priority;
        if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId || null;
        if (body.solutionDescription !== undefined) updateData.solutionDescription = body.solutionDescription?.trim() || null;

        // Mettre à jour la tâche
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updateData,
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

        return NextResponse.json({
            success: true,
            message: 'Tâche mise à jour avec succès',
            data: updatedTask
        });
    } catch (error) {
        console.error('❌ Erreur API PUT /tasks/[taskId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/tasks/[taskId]
 * Supprime une tâche
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        const { taskId } = params;

        // Récupérer la tâche
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Tâche non trouvée' },
                { status: 404 }
            );
        }

        // Supprimer la tâche
        await prisma.task.delete({
            where: { id: taskId }
        });

        return NextResponse.json({
            success: true,
            message: 'Tâche supprimée avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur API DELETE /tasks/[taskId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
