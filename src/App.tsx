import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminGuard, AuthGate, RegistrationGuard } from "./auth/AuthGate";
import { LoadingState } from "./components/ui";
import { AdminShell } from "./layouts/AdminShell";
import { AppShell } from "./layouts/AppShell";

const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const RegistrationPage = lazy(() => import("./pages/RegistrationPage").then((module) => ({ default: module.RegistrationPage })));
const GroupPage = lazy(() => import("./pages/GroupPage").then((module) => ({ default: module.GroupPage })));
const ScoreboardPage = lazy(() => import("./pages/ScoreboardPage").then((module) => ({ default: module.ScoreboardPage })));
const BuddyPage = lazy(() => import("./pages/BuddyPage").then((module) => ({ default: module.BuddyPage })));
const ActivitiesPage = lazy(() => import("./pages/ActivitiesPage").then((module) => ({ default: module.ActivitiesPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage").then((module) => ({ default: module.AdminDashboardPage })));
const AdminGroupsPage = lazy(() => import("./pages/admin/AdminGroupsPage").then((module) => ({ default: module.AdminGroupsPage })));
const AdminScoresPage = lazy(() => import("./pages/admin/AdminScoresPage").then((module) => ({ default: module.AdminScoresPage })));
const AdminBuddyPage = lazy(() => import("./pages/admin/AdminBuddyPage").then((module) => ({ default: module.AdminBuddyPage })));
const AdminActivitiesPage = lazy(() => import("./pages/admin/AdminActivitiesPage").then((module) => ({ default: module.AdminActivitiesPage })));
const AdminAnnouncementsPage = lazy(() => import("./pages/admin/AdminAnnouncementsPage").then((module) => ({ default: module.AdminAnnouncementsPage })));

export default function App() {
  return (
    <AuthGate>
      <Suspense fallback={<LoadingState label="Opening page" />}>
        <Routes>
          <Route element={<RegistrationGuard><AppShell /></RegistrationGuard>}>
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="register" element={<RegistrationPage />} />
            <Route path="group" element={<GroupPage />} />
            <Route path="scoreboard" element={<ScoreboardPage />} />
            <Route path="buddy" element={<BuddyPage />} />
            <Route path="activities" element={<ActivitiesPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="admin" element={<AdminGuard><AdminShell /></AdminGuard>}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="groups" element={<AdminGroupsPage />} />
            <Route path="scores" element={<AdminScoresPage />} />
            <Route path="buddy" element={<AdminBuddyPage />} />
            <Route path="activities" element={<AdminActivitiesPage />} />
            <Route path="announcements" element={<AdminAnnouncementsPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthGate>
  );
}
