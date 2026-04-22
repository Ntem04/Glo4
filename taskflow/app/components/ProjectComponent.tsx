// ======================================
// COMPOSANT - CARTE DE PROJET
// ======================================
// Affiche les informations d'un projet dans une carte
// Inclut: statistiques, progression, actions

import { Project } from '@/type';
import { Copy, ExternalLink, FolderGit2, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import React, { FC } from 'react';
import { toast } from 'react-toastify';

interface ProjectProps {
    project: Project;
    onDelete?: (id: string) => void;
}

const ProjectComponent: FC<ProjectProps> = ({ project, onDelete }) => {
    // ======================================
    // FONCTIONS UTILITAIRES
    // ======================================

    /**
     * Gère la suppression du projet avec confirmation
     */
    const handleDeleteClick = () => {
        const isConfirmed = window.confirm(
            "Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
        );
        if (isConfirmed && onDelete) {
            onDelete(project.id);
        }
    };

    /**
     * Copie le code d'invitation du projet dans le presse-papiers
     */
    const handleCopyCode = async () => {
        try {
            if (project.inviteCode) {
                await navigator.clipboard.writeText(project.inviteCode);
                toast.success("✅ Code d'invitation copié !");
            }
        } catch (error) {
            toast.error("❌ Erreur lors de la copie du code");
        }
    };

    // ======================================
    // CALCULS ET STATISTIQUES
    // ======================================

    // Compter le nombre total de tâches
    const totalTasks = project.tasks?.length || 0;

    // Calculer les tâches par statut
    const taskStats = {
        todo: project.taskStats?.todo || 0,
        in_progress: project.taskStats?.in_progress || 0,
        done: project.taskStats?.done || 0
    };

    // Calculer les pourcentages de progression
    const progressPercentage = totalTasks > 0 ? Math.round((taskStats.done / totalTasks) * 100) : 0;
    const inProgressPercentage = totalTasks > 0 ? Math.round((taskStats.in_progress / totalTasks) * 100) : 0;
    const toDoPercentage = totalTasks > 0 ? Math.round((taskStats.todo / totalTasks) * 100) : 0;

    // ======================================
    // RENDU
    // ======================================

    return (
        <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            {/* ======= HEADER - TITRE ET ICÔNE ======= */}
            <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Icône du projet */}
                        <div className="bg-primary/20 rounded-lg p-2">
                            <FolderGit2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            {/* Titre du projet */}
                            <h3 className="card-title text-lg truncate">{project.title}</h3>
                            {/* Date de création */}
                            <p className="text-xs text-gray-500">
                                Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ======= DESCRIPTION ======= */}
                {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {project.description}
                    </p>
                )}

                {/* ======= CODE D'INVITATION ======= */}
                <div className="bg-base-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Code d'invitation</p>
                        <p className="font-mono font-bold text-primary">{project.inviteCode}</p>
                    </div>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={handleCopyCode}
                        title="Copier le code"
                    >
                        <Copy className="w-4 h-4" />
                    </button>
                </div>

                {/* ======= STATISTIQUES DES MEMBRES ======= */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                        {project.collaboratorsCount || 1} collaborateur(s)
                    </span>
                </div>

                {/* ======= STATISTIQUES DES TÂCHES ======= */}
                <div className="space-y-3 mb-4">
                    {/* À faire */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">À faire</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                {taskStats.todo}
                            </span>
                        </div>
                        <progress
                            className="progress progress-info w-full h-1"
                            value={toDoPercentage}
                            max="100"
                        />
                        <p className="text-xs text-gray-400 mt-1">{toDoPercentage}%</p>
                    </div>

                    {/* En cours */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">En cours</span>
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                {taskStats.in_progress}
                            </span>
                        </div>
                        <progress
                            className="progress progress-warning w-full h-1"
                            value={inProgressPercentage}
                            max="100"
                        />
                        <p className="text-xs text-gray-400 mt-1">{inProgressPercentage}%</p>
                    </div>

                    {/* Terminées */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">Terminées</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                {taskStats.done}
                            </span>
                        </div>
                        <progress
                            className="progress progress-success w-full h-1"
                            value={progressPercentage}
                            max="100"
                        />
                        <p className="text-xs text-gray-400 mt-1">{progressPercentage}%</p>
                    </div>
                </div>

                {/* ======= BARRE DE PROGRESSION GLOBALE ======= */}
                <div className="bg-gradient-to-r from-blue-100 to-green-100 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-2">Progression globale</p>
                    <progress
                        className="progress w-full"
                        value={progressPercentage}
                        max="100"
                    />
                    <p className="text-right text-sm font-bold text-primary mt-1">
                        {progressPercentage}%
                    </p>
                </div>

                {/* ======= ACTIONS ======= */}
                <div className="flex gap-2">
                    {/* Bouton - Voir le projet */}
                    <Link
                        href={`/project/${project.id}`}
                        className="btn btn-primary btn-sm flex-1 gap-2"
                    >
                        <span>{totalTasks} tâche{totalTasks !== 1 ? 's' : ''}</span>
                        <ExternalLink className="w-4 h-4" />
                    </Link>

                    {/* Bouton - Supprimer */}
                    <button
                        className="btn btn-ghost btn-sm text-error"
                        onClick={handleDeleteClick}
                        title="Supprimer le projet"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProjectComponent;