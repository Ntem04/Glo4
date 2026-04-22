// ======================================
// COMPOSANT - CARTE DE TÂCHE (DRAGGABLE)
// ======================================
// Affiche une tâche avec support du drag & drop

"use client";

import React, { FC } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "@/type";
import { Trash, GripVertical } from "lucide-react";
import Link from "next/link";
import UserInfo from "./UserInfo";

interface TaskCardProps {
  task: Task;
  index: number;
  email?: string;
  onDelete?: (id: string) => void;
  isDragging?: boolean;
}

const TaskCard: FC<TaskCardProps> = ({
  task,
  index,
  email,
  onDelete,
  isDragging,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCardDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isCardDragging ? 0.5 : 1,
  };

  const canDelete = email === task.createdBy?.email;

  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const priorityColor = {
    low: "badge-info",
    medium: "badge-warning",
    high: "badge-error",
  }[task.priority || "medium"];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 border-gray-200 hover:border-primary shadow p-3 transition-all ${
        isCardDragging ? "shadow-lg border-primary" : ""
      }`}
    >
      {/* Grip handle pour drag */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-start gap-2 cursor-grab active:cursor-grabbing mb-2"
      >
        <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          {/* Titre */}
          <h4 className="font-semibold text-sm line-clamp-2 break-words">
            {task.title && task.title.length > 50
              ? `${task.title.slice(0, 50)}...`
              : task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mt-1">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Priorité et Badge */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className={`badge badge-sm ${priorityColor}`}>
          {task.priority || "medium"}
        </div>
      </div>

      {/* Utilisateur assigné */}
      {task.user && (
        <div className="mb-3">
          <UserInfo
            role=""
            email={task.user?.email || null}
            name={task.user?.name || null}
          />
        </div>
      )}

      {/* Échéance */}
      {task.dueDate && (
        <div className="text-xs text-gray-500 mb-3">
          📅 {new Date(task.dueDate).toLocaleDateString("fr-FR")}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-between">
        <Link
          className="btn btn-xs btn-primary flex-1"
          href={`/task-details/${task.id}`}
        >
          Voir
        </Link>
        {canDelete && (
          <button
            onClick={handleDeleteClick}
            disabled={isDragging}
            className="btn btn-xs btn-ghost"
            title="Supprimer"
          >
            <Trash className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
