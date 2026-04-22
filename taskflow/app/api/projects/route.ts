// ======================================
// API ROUTE - PROJETS
// ======================================
// Endpoints pour la gestion des projets
// GET /api/projects - Récupérer tous les projets
// POST /api/projects - Créer un nouveau projet

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

/**
 * GET /api/projects
 * Récupère tous les projets de l'utilisateur connecté
 * Inclut les projets créés et les projets en collaboration
 */
export async function GET(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        // Récupérer l'utilisateur depuis la base de données
        const user = await prisma.user.findFirst({
            where: { email: { not: undefined } }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Récupérer les projets créés par l'utilisateur
        const createdProjects = await prisma.project.findMany({
            where: { createdById: user.id },
            include: {
                tasks: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                users: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Récupérer les projets collaboratifs de l'utilisateur
        const collaborativeProjects = await prisma.project.findMany({
            where: {
                users: {
                    some: { userId: user.id }
                }
            },
            include: {
                tasks: {
                    select: {
                        id: true,
                        status: true
                    }
                },
                users: true,
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Combiner et retourner les projets
        const allProjects = [
            ...createdProjects.map(p => ({ ...p, isCreator: true })),
            ...collaborativeProjects.map(p => ({ ...p, isCreator: false }))
        ];

        return NextResponse.json({
            success: true,
            data: allProjects,
            count: allProjects.length
        });
    } catch (error) {
        console.error('❌ Erreur API GET /projects:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/projects
 * Crée un nouveau projet
 * Body: { title, description }
 */
export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: 'Authentification requise' },
                { status: 401 }
            );
        }

        // Parser le body de la requête
        const body = await request.json();
        const { title, description } = body;

        // Valider les données
        if (!title || title.trim() === '') {
            return NextResponse.json(
                { error: 'Le titre du projet est requis' },
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

        // Générer un code d'invitation unique
        const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Créer le projet
        const newProject = await prisma.project.create({
            data: {
                title: title.trim(),
                description: description?.trim() || null,
                inviteCode,
                createdById: user.id
            },
            include: {
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
                message: 'Projet créé avec succès',
                data: newProject
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('❌ Erreur API POST /projects:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}
