// ======================================
// API ROUTE - UTILISATEURS
// ======================================
// GET /api/users/me - Récupérer le profil de l'utilisateur connecté
// PUT /api/users/me - Mettre à jour le profil
// GET /api/users - Lister tous les utilisateurs (pour l'assignation)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/users/me
 * Récupère le profil de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        // Récupérer l'utilisateur par son email (stocké dans Clerk)
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true
            }
        });

        return NextResponse.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('❌ Erreur API GET /users:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
