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
import JobApplicationsPage from "./pages/admin/JobApplicationsPage.jsx";
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard.jsx";
import ApplicationForm from "./pages/applicant/ApplicationForm.jsx";

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
        <Route path="/" element={<Navigate replace to="/signup" />} />

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

        {/* <Route
          path="/apply/:jobId"
          element={
            <RouteGuard requiredRole="applicant">
              <ApplicationForm />
            </RouteGuard>
          }
        /> */}
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

        <Route path="*" element={<Navigate replace to="/signin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
