'use client'
import { useEffect, useState } from "react";

export function useClientMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []); // Runs only on mount

  return mounted;
}