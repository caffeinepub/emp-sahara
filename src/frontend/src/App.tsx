import React, { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile, useGetMyRegistrationStatus } from "./hooks/useQueries";
import LoginPage from "./pages/LoginPage";
import RegistrationRequestPage from "./pages/RegistrationRequestPage";
import HomePage from "./pages/HomePage";
import AttendancePage from "./pages/AttendancePage";
import TasksPage from "./pages/TasksPage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import FilesPage from "./pages/FilesPage";
import AppHeader from "./components/AppHeader";
import BottomNav, { type TabId } from "./components/BottomNav";
import { PageLoader } from "./components/LoadingState";

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  // Only check registration status when logged in and no profile
  const hasNoProfile = isAuthenticated && profileFetched && userProfile === null;
  // Pre-fetch registration status (used by RegistrationRequestPage internally)
  useGetMyRegistrationStatus();

  const [activeTab, setActiveTab] = useState<TabId>("home");

  // Initializing
  if (isInitializing || (isAuthenticated && !profileFetched)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  // Not logged in
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Logged in but no profile — show registration flow
  if (hasNoProfile) {
    return <RegistrationRequestPage />;
  }

  // Profile exists — show the app
  if (!userProfile || !identity) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  const principal = identity.getPrincipal();

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-md mx-auto relative">
      <AppHeader profile={userProfile} />

      <div className="flex-1 overflow-y-auto">
        {activeTab === "home" && (
          <HomePage profile={userProfile} principal={principal} />
        )}
        {activeTab === "attendance" && (
          <AttendancePage profile={userProfile} principal={principal} />
        )}
        {activeTab === "tasks" && (
          <TasksPage profile={userProfile} />
        )}
        {activeTab === "rewards" && (
          <RewardsPage profile={userProfile} />
        )}
        {activeTab === "files" && (
          <FilesPage profile={userProfile} principal={principal} />
        )}
        {activeTab === "profile" && (
          <ProfilePage profile={userProfile} />
        )}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
      <Toaster richColors position="top-center" />
    </LanguageProvider>
  );
}
