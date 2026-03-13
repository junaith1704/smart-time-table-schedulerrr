import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/store/AppContext";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import ClassesPage from "./pages/ClassesPage";
import FacultyPage from "./pages/FacultyPage";
import SubjectsPage from "./pages/SubjectsPage";
import RoomsPage from "./pages/RoomsPage";
import TimetablesPage from "./pages/TimetablesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AppProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<ClassesPage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/timetables" element={<TimetablesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
