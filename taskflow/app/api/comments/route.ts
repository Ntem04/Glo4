// ======================================
// API ROUTE - COMMENTAIRES
// ======================================
// POST /api/comments - Ajouter un commentaire
// DELETE /api/comments/[commentId] - Supprimer un commentaire

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * POST /api/comments
 * Ajoute un commentaire sur une tâche
 * Body: { taskId, content }
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
        const { taskId, content } = body;

        // Valider les données
        if (!taskId || !content || content.trim() === '') {
            return NextResponse.json(
                { error: 'ID de tâche et contenu du commentaire requis' },
                { status: 400 }
            );
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findFirst({
            where: { email: { not: undefined } }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que la tâche existe
        const task = await prisma.task.findUnique({
            where: { id: taskId }
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Tâche non trouvée' },
                { status: 404 }
            );
        }

        // Créer le commentaire
        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                taskId,
                authorId: user.id
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Commentaire ajouté avec succès',
                data: comment
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Erreur API POST /comments:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
