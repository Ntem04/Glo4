"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import { FolderGit2, Menu, X, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import React, { useEffect, useState } from "react";
import { checkAndAddUser } from "../actions";

const Navbar = () => {
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: string) => {
    const html = document.documentElement;
    if (newTheme === "dark") {
      html.setAttribute("data-theme", "dark");
    } else {
      html.setAttribute("data-theme", "light");
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const navLinks = [
    {
      href: "/general-projects",
      label: "Collaborations",
    },
    {
      href: "/",
      label: "Mes projets",
    },
  ];

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
      checkAndAddUser(user?.primaryEmailAddress?.emailAddress, user?.fullName);
    }
  }, [user]);

  const isActiveLink = (href: string) =>
    pathname.replace(/\/$/, "") === href.replace(/\/$/, "");

  const renderLinks = (classNames: string) =>
    navLinks.map(({ href, label }) => {
      return (
        <Link
          key={href}
          href={href}
          className={`btn-sm ${classNames} ${isActiveLink(href) ? "btn-primary" : ""}`}
        >
          {label}
        </Link>
      );
    });

  return (
    <div className="border-b boder-base-300  px-5 md:px-[10%] py-4 relative ">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-primary-content text-primary rounded-full p-2">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <span className="ml-3 font-bold text-3xl">
            Kranke <span className="text-primary">Haus</span>
          </span>
        </div>

        <button
          className="btn w-fit btn-sm sm:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu className="w-4" />
        </button>

        <div className="hidden sm:flex space-x-4 items-center ">
          <button
            className="btn btn-sm btn-ghost"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="w-4" />
            ) : (
              <Sun className="w-4" />
            )}
          </button>
          {user ? (
            <>
              {renderLinks("btn")}
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn btn-sm btn-outline">
                Se connecter
              </Link>
              <Link href="/sign-up" className="btn btn-sm btn-primary">
                S'inscrire
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        className={`absolute top-0 w-full h-screen flex flex-col gap-2 p-4 transition-all duration-300 sm:hidden  bg-white  z-50 ${menuOpen ? "left-0" : "-left-full"} `}
      >
        <div className="flex justify-between items-center">
          {user ? <UserButton /> : <div></div>}
          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-4" />
              ) : (
                <Sun className="w-4" />
              )}
            </button>
            <button
              className="btn w-fit btn-sm"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <X className="w-4" />
            </button>
          </div>
        </div>
        {user ? (
          renderLinks("btn")
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/sign-in" className="btn btn-sm btn-outline">
              Se connecter
            </Link>
            <Link href="/sign-up" className="btn btn-sm btn-primary">
              S'inscrire
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
