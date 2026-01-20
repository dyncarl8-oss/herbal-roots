import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/dashboard";
import RitualGuide from "@/pages/ritual-guide";
import SymptomTool from "@/pages/symptom-tool";
import Community from "@/pages/community";
import Affiliate from "@/pages/affiliate";
import NotFound from "@/pages/not-found";
import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";

// Detect base path for Whop iFrame embedding
// Whop loads apps at paths like /experience/exp_xxx or /app/app_xxx
function getBasePath(): string {
  const path = window.location.pathname;

  // Check for Whop experience or app paths
  const whopPathMatch = path.match(/^(\/(?:experience|app)\/[^/]+)/);
  if (whopPathMatch) {
    return whopPathMatch[1];
  }

  // Default to root
  return "";
}

import MasterclassLibrary from "@/pages/masterclass-library";
import MasterclassView from "@/pages/masterclass-view";
import AdminDashboard from "@/pages/admin-dashboard";

function AppRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardHome} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/ritual/:id" component={RitualGuide} />
        <Route path="/masterclasses" component={MasterclassLibrary} />
        <Route path="/masterclass/:id" component={MasterclassView} />
        <Route path="/symptom-tool" component={SymptomTool} />
        <Route path="/community" component={Community} />
        <Route path="/affiliate" component={Affiliate} />
        <Route component={DashboardHome} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  const basePath = getBasePath();

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router base={basePath}>
            <AppRoutes />
          </Router>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
