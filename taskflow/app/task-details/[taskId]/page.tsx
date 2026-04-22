"use client";
import {
  getProjectInfo,
  getTaskDetails,
  updateTaskStatus,
} from "@/app/actions";
import EmptyState from "@/app/components/EmptyState";
import UserInfo from "@/app/components/UserInfo";
import Wrapper from "@/app/components/Wrapper";
import { Project, Task } from "@/type";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";

// --- CORRECTION : Importation dynamique pour éviter "document is not defined" ---
const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full bg-base-200 animate-pulse rounded-xl" />
  ),
});
// @ts-ignore
import "react-quill-new/dist/quill.snow.css";

const Page = ({ params }: { params: Promise<{ taskId: string }> }) => {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const [task, setTask] = useState<Task | null>(null);
  const [taskId, setTaskId] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState("");
  const [realStatus, setRealStatus] = useState("");
  const [solution, setSolution] = useState("");

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "code-block"],
      ["link"],
      ["clean"],
    ],
  };

  const fetchInfos = async (id: string) => {
    try {
      const fetchedTask = await getTaskDetails(id);
      if (fetchedTask) {
        setTask(fetchedTask as unknown as Task);
        setStatus(fetchedTask.status);
        setRealStatus(fetchedTask.status);
        fetchProject(fetchedTask.projectId);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement des détails.");
    }
  };

  const fetchProject = async (projId: string) => {
    try {
      const fetchedProject = await getProjectInfo(projId);
      setProject(fetchedProject as unknown as Project);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const resolvedParams = await params;
      setTaskId(resolvedParams.taskId);
      fetchInfos(resolvedParams.taskId);
    };
    init();
  }, [params]);

  const changeStatus = async (id: string, newStatus: string) => {
    try {
      await updateTaskStatus(id, newStatus);
      fetchInfos(id);
    } catch (error) {
      toast.error("Erreur lors du changement de statut");
    }
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
    const modal = document.getElementById("my_modal_3") as HTMLDialogElement;

    // On utilise les valeurs exactes de ton énumération Prisma
    if (newStatus === "todo" || newStatus === "in_progress") {
      changeStatus(taskId, newStatus);
      toast.success("Statut mis à jour");
    } else if (newStatus === "done") {
      modal?.showModal();
    }
  };

  const closeTask = async (newStatus: string) => {
    const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
    try {
      if (solution.replace(/<(.|\n)*?>/g, "").trim().length === 0) {
        toast.error("Veuillez décrire la solution");
        return;
      }
      await updateTaskStatus(taskId, newStatus, solution);
      await fetchInfos(taskId);
      modal?.close();
      toast.success("Tâche clôturée avec succès !");
    } catch (error) {
      toast.error("Erreur lors de la clôture");
    }
  };

  return (
    <Wrapper>
      {task ? (
        <div className="pb-10">
          <div className="flex flex-col md:justify-between md:flex-row mb-6">
            <div className="breadcrumbs text-sm">
              <ul>
                <li>
                  <Link href={`/project/${task.projectId}`}>
                    Retour au projet
                  </Link>
                </li>
                <li>Détails de la tâche</li>
              </ul>
            </div>
            <div className="p-4 border border-base-300 rounded-xl w-full md:w-fit bg-base-100 shadow-sm">
              <UserInfo
                role="Assignée à"
                email={task.assignedTo?.email || "Non assigné"}
                name={task.assignedTo?.name || "N/A"}
              />
            </div>
          </div>

          <h1 className="font-bold text-3xl mb-6">{task.title}</h1>

          <div className="flex justify-between items-center mb-8 bg-base-200 p-4 rounded-xl">
            <span className="text-sm font-medium">
              Échéance :
              <div className="badge badge-outline ml-2">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "Aucune"}
              </div>
            </span>
            <select
              value={status}
              onChange={handleStatusChange}
              className="select select-sm select-primary"
              disabled={
                realStatus === "done" || task.assignedTo?.email !== email
              }
            >
              <option value="todo">À faire</option>
              <option value="in_progress">En cours</option>
              <option value="done">Terminée</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-4 border border-base-300 rounded-xl bg-base-100">
              <UserInfo
                role="Créée par"
                email={task.createdBy?.email || null}
                name={task.createdBy?.name || null}
              />
            </div>
            {task.dueDate && (
              <div className="flex items-center justify-center p-4 bg-primary/10 rounded-xl">
                <span className="font-bold text-primary">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(task.dueDate).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  )}{" "}
                  jours restants
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description</h2>
            <div className="ql-snow bg-base-100">
              <div
                className="ql-editor p-5 border-base-300 border rounded-xl min-h-[150px]"
                dangerouslySetInnerHTML={{
                  __html: task.description || "Aucune description fournie.",
                }}
              />
            </div>
          </div>

          {task.solutionDescription && (
            <div className="mt-10 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-xl font-semibold text-success mb-4">
                Solution apportée
              </h2>
              <div className="ql-snow bg-success/5">
                <div
                  className="ql-editor p-5 border-success/20 border rounded-xl"
                  dangerouslySetInnerHTML={{ __html: task.solutionDescription }}
                />
              </div>
            </div>
          )}

          <dialog id="my_modal_3" className="modal">
            <div className="modal-box w-11/12 max-w-2xl">
              <h3 className="font-bold text-lg mb-2">Clôturer la tâche</h3>
              <p className="text-sm text-gray-500 mb-4">
                Décrivez brièvement comment vous avez résolu cette tâche.
              </p>

              <ReactQuill
                theme="snow"
                placeholder="Expliquez votre solution..."
                value={solution}
                modules={modules}
                onChange={setSolution}
              />

              <div className="modal-action">
                <button
                  onClick={() => {
                    const modal = document.getElementById(
                      "my_modal_3",
                    ) as HTMLDialogElement;
                    setStatus(realStatus);
                    modal.close();
                  }}
                  className="btn btn-ghost"
                >
                  Annuler
                </button>
                <button
                  onClick={() => closeTask("done")}
                  className="btn btn-primary"
                >
                  Enregistrer et Terminer
                </button>
              </div>
            </div>
          </dialog>
        </div>
      ) : (
        <EmptyState
          imageSrc="/empty-task.png"
          imageAlt="Tâche introuvable"
          message="Cette tâche n'existe pas ou a été supprimée."
        />
      )}
    </Wrapper>
  );
};

export default Page;
