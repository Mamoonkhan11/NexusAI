"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

function UnauthorizedToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const unauthorized = searchParams.get("unauthorized");
    if (unauthorized === "1") {
      toast.error("Unauthorized access – Admins only");
    }
  }, [searchParams]);

  return null;
}

export default UnauthorizedToast;
