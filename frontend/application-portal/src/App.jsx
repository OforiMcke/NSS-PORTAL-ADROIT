import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import SignUp from "./pages/auth/SignUp.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import JobApplicationsPage from "./pages/admin/jobs/JobApplicationsPage.jsx";
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard.jsx";
import ApplicationForm from "./pages/applicant/application/ApplicationForm.jsx";
import JobRoles from "./pages/admin/jobs/JobRoles";
import { ProtectedRoute } from "./components/ProtectedRoute";
import ApprovedCandidates from "./pages/admin/ApprovedCandidates.jsx";
import InterviewSchedule from "./pages/admin/interviews/InterviewSchedule.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

function RouteGuard({ children, requiredRole, isPublic }) {
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const role = localStorage.getItem("userRole");

  if (isPublic && token && role) {
    return <Navigate to={role === "admin" ? "/admin" : "/applicant"} replace />;
  }

  if (!isPublic && !token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!isPublic && requiredRole && role !== requiredRole) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/signin" />} />

        <Route
          path="/signup"
          element={
            <RouteGuard isPublic>
              <SignUp />
            </RouteGuard>
          }
        />
        <Route
          path="/signin"
          element={
            <RouteGuard isPublic>
              <SignIn />
            </RouteGuard>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <RouteGuard isPublic>
              <ForgotPassword />
            </RouteGuard>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <RouteGuard isPublic>
              <ResetPassword />
            </RouteGuard>
          }
        />

        <Route
          path="/applicant"
          element={
            <RouteGuard requiredRole="applicant">
              <ApplicantDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/applicant/apply"
          element={
            <RouteGuard requiredRole="applicant">
              <ApplicationForm />
            </RouteGuard>
          }
        />

        <Route path="/apply/:jobId" element={<ApplicationForm />} />
        <Route
          path="/admin"
          element={
            <RouteGuard requiredRole="admin">
              <AdminDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/job-applications"
          element={
            <RouteGuard requiredRole="admin">
              <JobApplicationsPage />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/job-roles"
          element={
            <ProtectedRoute allowedRole="admin">
              <JobRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approved-candidates"
          element={
            <RouteGuard requiredRole="admin">
              <ApprovedCandidates />
            </RouteGuard>
          }
        />
        <Route
          path="/admin/interview-schedule"
          element={
            <RouteGuard requiredRole="admin">
              <InterviewSchedule />
            </RouteGuard>
          }
        />

        <Route path="*" element={<Navigate replace to="/signin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
