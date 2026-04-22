"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react"; // Ajout de useCallback
import { useUser } from "@clerk/nextjs";
import {
  Plus,
  Loader2,
  ArrowLeft,
  Settings,
  Filter,
  Trash2,
  Eye,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Project, Task } from "@/type";
import Wrapper from "@/app/components/Wrapper";
import {
  createTask,
  deleteTask as deleteTaskAction,
  getProjectTasks,
} from "@/app/actions";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrage
  const [statusFilter, setStatusFilter] = useState<
    "all" | "todo" | "in_progress" | "done"
  >("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "low" | "medium" | "high"
  >("all");

  // Formulaire
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState("medium");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // --- OPTIMISATION : Utilisation de useCallback pour éviter les boucles d'effets ---
  const fetchProjectData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error("Projet introuvable");

      const data = await response.json();
      if (data.success) {
        setProject(data.data);
      }
    } catch (error) {
      toast.error("Impossible de charger le projet");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  const fetchTasks = useCallback(async () => {
    try {
      const fetchedTasks = await getProjectTasks(projectId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Erreur tâches:", error);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && user) {
      fetchProjectData();
      fetchTasks();
    }
  }, [projectId, user, fetchProjectData, fetchTasks]);

  // --- CORRECTION : Alignement des arguments avec la fonction createTask du back-end ---
  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    try {
      setIsSubmitting(true);
      const email = user?.primaryEmailAddress?.emailAddress || "";

      // Vérifie bien l'ordre des arguments dans ton app/actions.ts
      // Généralement : (title, description, dueDate, projectId, createdByEmail, assignToEmail)
      await createTask(
        newTaskTitle.trim(),
        newTaskDescription.trim(),
        newTaskDueDate ? new Date(newTaskDueDate) : null, // Conversion en Date
        projectId,
        email,
        email, // Par défaut, on s'assigne la tâche à soi-même
      );

      setNewTaskTitle("");
      setNewTaskDescription("");
      setShowCreateForm(false);

      await fetchTasks();
      toast.success("Tâche ajoutée !");
    } catch (error) {
      toast.error(
        "Erreur lors de la création. L'utilisateur existe-t-il en base ?",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Supprimer cette tâche ?")) return;
    try {
      await deleteTaskAction(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Tâche supprimée");
    } catch (error) {
      toast.error("Erreur de suppression");
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const statusMatch = statusFilter === "all" || task.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  if (isLoading)
    return (
      <Wrapper>
        <div className="flex flex-col justify-center items-center py-20">
          <Loader2 className="animate-spin text-primary mb-4" size={40} />
          <p className="text-gray-500 animate-pulse">
            Chargement de TaskFlow...
          </p>
        </div>
      </Wrapper>
    );

  return (
    <Wrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="btn btn-circle btn-ghost btn-sm">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold">{project?.title}</h1>
          </div>
          <button className="btn btn-ghost btn-sm">
            <Settings size={20} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stats shadow bg-base-200">
            <div className="stat p-4">
              <div className="stat-title text-xs">Total</div>
              <div className="stat-value text-2xl">{stats.total}</div>
            </div>
          </div>
          <div className="stats shadow bg-blue-50">
            <div className="stat p-4">
              <div className="stat-title text-xs text-blue-600">À faire</div>
              <div className="stat-value text-2xl text-blue-600">
                {stats.todo}
              </div>
            </div>
          </div>
          <div className="stats shadow bg-yellow-50">
            <div className="stat p-4">
              <div className="stat-title text-xs text-yellow-600">En cours</div>
              <div className="stat-value text-2xl text-yellow-700">
                {stats.in_progress}
              </div>
            </div>
          </div>
          <div className="stats shadow bg-green-50">
            <div className="stat p-4">
              <div className="stat-title text-xs text-green-600">Terminées</div>
              <div className="stat-value text-2xl text-green-600">
                {stats.done}
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire & Filtres */}
        <div className="flex flex-col gap-4">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-primary w-full md:w-fit"
            >
              <Plus size={20} /> Nouvelle Tâche
            </button>
          ) : (
            <div className="card bg-base-100 border-2 border-primary/20 shadow-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Titre de la tâche"
                  className="input input-bordered w-full"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                />
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
                <textarea
                  placeholder="Description..."
                  className="textarea textarea-bordered md:col-span-2"
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                />
                <div className="flex gap-2 md:col-span-2">
                  <button
                    onClick={handleCreateTask}
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Enregistrer"
                    )}
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="btn btn-ghost"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 overflow-x-auto pb-2">
            <select
              className="select select-sm select-bordered"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">Tous les statuts</option>
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminée</option>
            </select>
            <select
              className="select select-sm select-bordered"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
            >
              <option value="all">Toutes priorités</option>
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </div>
        </div>

        {/* Liste des tâches */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="card bg-base-100 shadow-md border border-base-300 hover:border-primary transition-all"
            >
              <div className="card-body p-5">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight">
                    {task.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-ghost btn-xs text-error"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 my-2">
                  {task.description || "Aucune description"}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                  <span
                    className={`badge badge-sm ${task.priority === "high" ? "badge-error" : task.priority === "medium" ? "badge-warning" : "badge-ghost"}`}
                  >
                    {task.priority}
                  </span>
                  <span className="badge badge-sm badge-outline">
                    {task.status}
                  </span>
                </div>

                <div className="pt-4 mt-4 border-t flex justify-between items-center">
                  <span className="text-[10px] text-gray-400">
                    📅{" "}
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "Sans date"}
                  </span>
                  <Link
                    href={`/task-details/${task.id}`}
                    className="btn btn-primary btn-xs"
                  >
                    Détails <Eye size={12} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Wrapper>
  );
}
