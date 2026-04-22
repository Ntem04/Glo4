// ======================================
// PAGE D'ACCUEIL - TABLEAU DE BORD
// ======================================
// Affiche la liste des projets créés et collaboratifs
// Cette page montre un aperçu de tous les projets avec statistiques
"use client"

import Wrapper from "./components/Wrapper";
import { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { createProject, deleteProjectById, getProjectsCreatedByUser } from "./actions";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-toastify";
import { Project } from "@/type";
import ProjectComponent from "./components/ProjectComponent";
import EmptyState from "./components/EmptyState";

export default function Home() {
  // ======================================
  // HOOKS & STATE
  // ======================================
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress as string;
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Récupère les projets créés par l'utilisateur
   * Affiche un toast de succès/erreur
   */
  const fetchProjects = async (userEmail: string) => {
    try {
      setIsLoading(true);
      const myProjects = await getProjectsCreatedByUser(userEmail);
      setProjects(myProjects);
      console.log("✅ Projets chargés:", myProjects);
    } catch (error) {
      console.error("❌ Erreur lors du chargement des projets:", error);
      toast.error("Erreur lors du chargement des projets");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Récupère les projets au montage du composant
   */
  useEffect(() => {
    if (email) {
      fetchProjects(email);
    }
  }, [email]);

  /**
   * Supprime un projet avec confirmation
   * Met à jour l'état et montre une notification
   */
  const handleDeleteProject = async (projectId: string) => {
    // Demander la confirmation
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) {
      return;
    }

    try {
      setIsLoading(true);
      await deleteProjectById(projectId);
      await fetchProjects(email);
      toast.success("Projet supprimé avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression du projet");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crée un nouveau projet
   * Valide les données et montre une notification
   */
  const handleCreateProject = async () => {
    // Valider les données
    if (!projectName.trim()) {
      toast.error("Veuillez entrer un nom de projet");
      return;
    }

    try {
      setIsSubmitting(true);
      const modal = document.getElementById("createProjectModal") as HTMLDialogElement;
      
      // Créer le projet
      const newProject = await createProject(
        projectName.trim(),
        projectDescription.trim(),
        email
      );
      
      // Fermer le modal et réinitialiser le formulaire
      if (modal) {
        modal.close();
      }
      setProjectName("");
      setProjectDescription("");
      
      // Recharger la liste des projets
      await fetchProjects(email);
      toast.success("✅ Projet créé avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de la création du projet:", error);
      toast.error("Erreur lors de la création du projet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Wrapper>
      <div className="space-y-6">
        {/* ======================================
            HEADER - TITRE ET BOUTON DE CRÉATION
            ====================================== */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez vos projets collaboratifs en un seul endroit
            </p>
          </div>
          <button
            className="btn btn-primary gap-2 text-lg"
            onClick={() =>
              (
                document.getElementById("createProjectModal") as HTMLDialogElement
              ).showModal()
            }
          >
            <Plus size={20} />
            Nouveau Projet
          </button>
        </div>

        {/* ======================================
            STATISTIQUES
            ====================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total des projets</p>
            <p className="text-3xl font-bold">{projects.length}</p>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Tâches actives</p>
            <p className="text-3xl font-bold">
              {projects.reduce(
                (sum, p) => sum + (p.taskStats?.todo || 0) + (p.taskStats?.in_progress || 0),
                0
              )}
            </p>
          </div>
          <div className="bg-base-200 rounded-lg p-4">
            <p className="text-sm text-gray-600">Tâches complétées</p>
            <p className="text-3xl font-bold">
              {projects.reduce((sum, p) => sum + (p.taskStats?.done || 0), 0)}
            </p>
          </div>
        </div>

        {/* ======================================
            LISTE DES PROJETS OU ÉTAT VIDE
            ====================================== */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin" size={32} />
            <span className="ml-4">Chargement des projets...</span>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="Aucun projet créé"
            description="Créez votre premier projet pour commencer à gérer vos tâches collaborativement."
            actionText="Créer un projet"
            onAction={() =>
              (
                document.getElementById("createProjectModal") as HTMLDialogElement
              ).showModal()
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectComponent
                key={project.id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        {/* ======================================
            MODAL - CRÉER UN NOUVEAU PROJET
            ====================================== */}
        <dialog id="createProjectModal" className="modal modal-bottom sm:modal-middle">
          <div className="modal-box w-full max-w-md">
            {/* Bouton de fermeture */}
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>

            {/* Contenu du modal */}
            <h3 className="font-bold text-xl mb-4">Créer un nouveau projet</h3>
            <p className="text-gray-600 text-sm mb-6">
              Commencez par donner un nom et une description à votre projet.
            </p>

            {/* Formulaire */}
            <div className="space-y-4">
              {/* Champ - Nom du projet */}
              <div>
                <label className="block text-sm font-medium mb-2">Nom du projet *</label>
                <input
                  type="text"
                  placeholder="Ex: Application Mobile"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="input input-bordered w-full"
                  maxLength={100}
                />
              </div>

              {/* Champ - Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Décrivez les objectifs de votre projet..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="textarea textarea-bordered w-full h-24"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {projectDescription.length}/500
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => {
                    setProjectName("");
                    setProjectDescription("");
                    (document.getElementById("createProjectModal") as HTMLDialogElement).close();
                  }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary flex-1 gap-2"
                  onClick={handleCreateProject}
                  disabled={isSubmitting || !projectName.trim()}
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {isSubmitting ? "Création..." : "Créer"}
                </button>
              </div>
            </div>
          </div>

          {/* Overlay de fermeture */}
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </Wrapper>
  );
}
