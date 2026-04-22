// ======================================
// API ROUTE - SUPPRIMER UN COMMENTAIRE
// ======================================
// DELETE /api/comments/[commentId] - Supprimer un commentaire

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * DELETE /api/comments/[commentId]
 * Supprime un commentaire
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: { commentId: string } }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        const { commentId } = params;

        // Récupérer le commentaire
        const comment = await prisma.comment.findUnique({
            where: { id: commentId }
        });

        if (!comment) {
            return NextResponse.json(
                { error: 'Commentaire non trouvé' },
                { status: 404 }
            );
        }

        // Récupérer l'utilisateur connecté
        const user = await prisma.user.findFirst({
            where: { email: { not: undefined } }
        });

        // Vérifier que l'utilisateur est l'auteur du commentaire
        if (comment.authorId !== user?.id) {
            return NextResponse.json(
                { error: 'Vous n\'avez pas la permission de supprimer ce commentaire' },
                { status: 403 }
            );
        }

        // Supprimer le commentaire
        await prisma.comment.delete({
            where: { id: commentId }
        });

        return NextResponse.json({
            success: true,
            message: 'Commentaire supprimé avec succès'
        });
    } catch (error) {
        console.error('❌ Erreur API DELETE /comments/[commentId]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
