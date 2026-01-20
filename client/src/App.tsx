import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardHome from "@/pages/dashboard";
import SymptomTool from "@/pages/symptom-tool";
import Community from "@/pages/community";
import Affiliate from "@/pages/affiliate";
import NotFound from "@/pages/not-found";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";

function Router() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={DashboardHome} />
        <Route path="/symptom-tool" component={SymptomTool} />
        <Route path="/community" component={Community} />
        <Route path="/affiliate" component={Affiliate} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

