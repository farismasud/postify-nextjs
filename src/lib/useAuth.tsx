"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<null | {}>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({}); // Simulasi user login
    }
    setLoading(false);
  }, []);

  return { user, loading };
}
