// ======================================
// COMPOSANT - DROPDOWN DE RECHERCHE
// ======================================
// Affiche un dropdown avec les résultats de recherche

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { searchProjects } from "@/app/actions";

interface SearchDropdownProps {
  email: string;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({ email }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effectuer la recherche au changement de query
  useEffect(() => {
    if (query.trim().length === 0) {
      setResults({ projects: [], tasks: [] });
      setIsOpen(false);
      return;
    }

    const performSearch = async () => {
      setIsLoading(true);
      try {
        const searchResults = await searchProjects(query, email);
        setResults(searchResults);
        setIsOpen(true);
      } catch (error) {
        console.error("Erreur recherche:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Débounce la recherche
    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [query, email]);

  const hasResults = results.projects.length > 0 || results.tasks.length > 0;

  return (
    <div ref={dropdownRef} className="relative w-full md:w-64">
      {/* Input de recherche */}
      <div className="relative">
        <input
          type="text"
          placeholder="Rechercher projets, tâches..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length > 0 && hasResults) {
              setIsOpen(true);
            }
          }}
          className="input input-bordered input-sm w-full pl-10 pr-3"
          aria-label="Rechercher"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        )}
      </div>

      {/* Dropdown des résultats */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
              Recherche en cours...
            </div>
          ) : hasResults ? (
            <div className="p-2">
              {/* Résultats des projets */}
              {results.projects.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500 px-2 py-2">
                    PROJETS
                  </p>
                  {results.projects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/project/${project.id}`}
                      className="block px-2 py-2 rounded hover:bg-base-200 cursor-pointer transition"
                      onClick={() => {
                        setQuery("");
                        setIsOpen(false);
                      }}
                    >
                      <p className="font-medium text-sm">{project.title}</p>
                      {project.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {project.tasks.length} tâche(s)
                      </p>
                    </Link>
                  ))}
                </div>
              )}

              {/* Résultats des tâches */}
              {results.tasks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 px-2 py-2">
                    TÂCHES
                  </p>
                  {results.tasks.map((task: any) => (
                    <Link
                      key={task.id}
                      href={`/task-details/${task.id}`}
                      className="block px-2 py-2 rounded hover:bg-base-200 cursor-pointer transition"
                      onClick={() => {
                        setQuery("");
                        setIsOpen(false);
                      }}
                    >
                      <p className="font-medium text-sm">{task.title}</p>
                      <p className="text-xs text-gray-500">
                        Projet: {task.project.title}
                      </p>
                      {task.assignedTo && (
                        <p className="text-xs text-gray-400 mt-1">
                          Assignée à: {task.assignedTo.name}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              <p className="text-sm">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;
