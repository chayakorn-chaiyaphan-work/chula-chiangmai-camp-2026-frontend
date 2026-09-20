import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ErrorState, LoadingState } from "../components/ui";
import { useSession } from "./SessionProvider";

export function AuthGate({ children }: { children: ReactNode }) {
  const { status, error, retry } = useSession();
  if (status === "loading") return <LoadingState />;
  if (status === "error") return <ErrorState title="Sign-in could not be completed" message={error?.message || "Please try again."} onRetry={retry} />;
  return children;
}

export function RegistrationGuard({ children }: { children: ReactNode }) {
  const { profile } = useSession();
  const location = useLocation();
  if (profile?.user.role === "participant" && !profile.participant && location.pathname !== "/register") {
    return <Navigate to="/register" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function AdminGuard({ children }: { children: ReactNode }) {
  const { profile } = useSession();
  if (profile?.user.role !== "admin") return <Navigate to="/home" replace />;
  return children;
}
