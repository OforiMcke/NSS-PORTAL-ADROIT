import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./pages/auth/SignUp.jsx";
import SignIn from "./pages/auth/SignIn.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import JobApplicationsPage from "./pages/admin/jobApplicationPage.jsx";
import ApplicantDashboard from "./pages/applicant/ApplicantDashboard.jsx";
import ApplicationForm from "./pages/applicant/ApplicationForm.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/signin" />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/job-applications" element={<JobApplicationsPage />} />
        <Route path="/applicant" element={<ApplicantDashboard />} />
        <Route path="/applicant/apply" element={<ApplicationForm />} />
        <Route path="*" element={<Navigate replace to="/signin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
