"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { checkAndAddUser } from "../actions";

export function SyncUser() {
  const { user } = useUser();

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      checkAndAddUser(
        user.primaryEmailAddress.emailAddress,
        user.fullName || user.username || "Utilisateur",
      );
    }
  }, [user]);

  return null; // Ce composant ne doit rien afficher
}
