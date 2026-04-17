import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import ClassesPage from "./pages/ClassesPage";
import FacultyPage from "./pages/FacultyPage";
import SubjectsPage from "./pages/SubjectsPage";
import RoomsPage from "./pages/RoomsPage";
import TimetablesPage from "./pages/TimetablesPage";
import MyTimetablePage from "./pages/MyTimetablePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner richColors position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/classes" element={<ProtectedRoute allowedRoles={["admin"]}><ClassesPage /></ProtectedRoute>} />
                      <Route path="/faculty" element={<ProtectedRoute allowedRoles={["admin"]}><FacultyPage /></ProtectedRoute>} />
                      <Route path="/subjects" element={<ProtectedRoute allowedRoles={["admin"]}><SubjectsPage /></ProtectedRoute>} />
                      <Route path="/rooms" element={<ProtectedRoute allowedRoles={["admin"]}><RoomsPage /></ProtectedRoute>} />
                      <Route path="/timetables" element={<ProtectedRoute allowedRoles={["admin"]}><TimetablesPage /></ProtectedRoute>} />
                      <Route path="/my-timetable" element={<MyTimetablePage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
