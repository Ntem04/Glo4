// ======================================
// COMPOSANT - TABLEAU KANBAN AVEC DRAG & DROP
// ======================================
// Affiche les tâches dans des colonnes par statut
// Support du drag & drop pour changer de statut

"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Task } from "@/type";
import TaskCard from "./TaskCard";
import { toast } from "react-toastify";

interface TaskBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => Promise<void>;
  onDelete?: (id: string) => void;
  email?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onStatusChange,
  onDelete,
  email,
}) => {
  const [loading, setLoading] = useState(false);

  // Configurer les capteurs pour éviter les faux clics
  const sensors = useSensors(
    useSensor(PointerSensor, {
      distance: 8,
    }),
  );

  // Grouper les tâches par statut
  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const statuses = ["todo", "in_progress", "done"];

  const statusConfig = {
    todo: {
      bg: "bg-red-50",
      border: "border-red-200",
      badge: "bg-red-200",
      label: "À faire",
    },
    in_progress: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      badge: "bg-yellow-200",
      label: "En cours",
    },
    done: {
      bg: "bg-green-50",
      border: "border-green-200",
      badge: "bg-green-200",
      label: "Terminé",
    },
  };

  /**
   * Gère la fin du drag et drop
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    // Extraire le statut de l'ID droppé
    const overStatus = over.id.toString().split("-")[0];
    const taskId = active.id.toString();

    // Trouver la tâche
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Si le statut n'a pas changé, ne rien faire
    if (task.status === overStatus) return;

    try {
      setLoading(true);
      await onStatusChange(taskId, overStatus);
      const config = statusConfig[overStatus as keyof typeof statusConfig];
      toast.success(`✅ Tâche déplacée vers "${config?.label || overStatus}"`);
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
      toast.error("❌ Erreur lors du changement de statut");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {statuses.map((status) => {
          const statusTasks = getTasksByStatus(status);
          const config = statusConfig[status as keyof typeof statusConfig];

          return (
            <div
              key={status}
              className={`rounded-lg border-2 ${config.border} ${config.bg} p-4 min-h-[500px]`}
            >
              {/* En-tête de colonne */}
              <div className="mb-4">
                <div
                  className={`${config.badge} text-gray-800 px-3 py-1 rounded-lg inline-block font-semibold text-sm`}
                >
                  {config.label} ({statusTasks.length})
                </div>
              </div>

              {/* Zone de drop pour les tâches */}
              <SortableContext
                items={statusTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {statusTasks.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <p className="text-sm">Aucune tâche ici</p>
                      <p className="text-xs">
                        Glissez des tâches pour les ajouter
                      </p>
                    </div>
                  ) : (
                    statusTasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        email={email}
                        onDelete={onDelete}
                        isDragging={loading}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>
    </DndContext>
  );
};

export default TaskBoard;
