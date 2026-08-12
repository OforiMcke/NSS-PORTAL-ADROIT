import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./ApplicationForm.css";

import PersonalDetailsFields from "./components/PersonalDetailsFields";
import JobDetailsFields from "./components/JobDetailsFields";
import JobSelectFields from "./components/JobSelectFields";
import DocumentUploadFields from "./components/DocumentUploadFields";
import DeclarationCheckbox from "./components/DeclarationCheckbox";
// import ApplicationSummary from "./components/ApplicationSummary";

export default function ApplicationForm({ embedded = false, onSubmitSuccess }) {
  const navigate = useNavigate();
  const { jobId: linkedJobId } = useParams();

  // const [showSummary, setShowSummary] = useState(false);

  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    jobRole: "",
    experienceLevel: "",
  });

  const [employmentType, setEmploymentType] = useState(
    "National Service Personnel",
  );
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState({ resume: null });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [job, setJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(!!linkedJobId);
  const [jobError, setJobError] = useState("");

  const [openJobs, setOpenJobs] = useState([]);
  const [openJobsLoading, setOpenJobsLoading] = useState(!linkedJobId);
  const [openJobsError, setOpenJobsError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");

  useEffect(() => {
    if (!linkedJobId) return;
    let mounted = true;

    api
      .get(`/api/jobs/${linkedJobId}`)
      .then((res) => {
        if (!mounted) return;
        setJob(res.data);
      })
      .catch((err) => {
        if (!mounted) return;
        setJobError(
          err.response?.data?.message ||
            "This application link is invalid or has expired.",
        );
      })
      .finally(() => {
        if (!mounted) return;
        setJobLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [linkedJobId]);

  useEffect(() => {
    if (linkedJobId) return;
    let mounted = true;

    api
      .get("/api/jobs/open/list")
      .then((res) => {
        if (!mounted) return;
        const list = res.data || [];
        setOpenJobs(list);
        if (list.length === 0) {
          setOpenJobsError(
            "No open positions are available right now. Please check back later.",
          );
        }
      })
      .catch((err) => {
        if (!mounted) return;
        setOpenJobsError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : "Couldn't load open positions. Please refresh the page.",
        );
      })
      .finally(() => {
        if (!mounted) return;
        setOpenJobsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [linkedJobId]);

  const handleJobSelect = (id) => {
    setSelectedJobId(id);
    setJob(openJobs.find((j) => j._id === id) || null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const finishSubmit = () => {
    if (embedded && typeof onSubmitSuccess === "function") {
      onSubmitSuccess();
      return;
    }
    navigate("/applicant");
  };

  const validate = () => {
    if (!job?._id) {
      setError(
        linkedJobId
          ? "We couldn't confirm the job for this application. Please use a valid application link."
          : "Please select a position to apply for.",
      );
      return false;
    }

    if (
      !formValues.fullName.trim() ||
      !formValues.email.trim() ||
      !formValues.phoneNumber.trim()
    ) {
      setError("Please fill out all required fields marked with *.");
      return false;
    }

    if (!files.resume) {
      setError("Please upload your resume (CV).");
      return false;
    }

    if (!agreed) {
      setError("Please confirm the declaration checkbox before proceeding.");
      return false;
    }

    return true;
  };

  // Summary step disabled for now — form submits directly on Confirm & Submit.
  // const handleProceedToSummary = (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setSuccess("");
  //   if (!validate()) return;
  //   setShowSummary(true);
  // };

  // const handlePrintDocument = () => {
  //   window.print();
  // };

  const handleFinalSubmission = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);

    const formData = new FormData();
    formData.append("fullName", formValues.fullName.trim());
    formData.append("email", formValues.email.trim());
    formData.append("phoneNumber", formValues.phoneNumber.trim());
    formData.append("location", formValues.location.trim());
    formData.append("jobRole", formValues.jobRole.trim());
    formData.append("experienceLevel", formValues.experienceLevel.trim());
    formData.append("jobId", job._id);
    formData.append("employmentType", employmentType);
    formData.append("cv", files.resume);

    api
      .post("/api/applications", formData)
      .then((res) => {
        setSuccess(res.data?.message || "Application submitted successfully");
        setTimeout(() => finishSubmit(), 1200);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || err.message || "Submission failed",
        );
      })
      .finally(() => setLoading(false));
  };

  if (linkedJobId && jobLoading) {
    return (
      <div className={`af-page ${embedded ? "af-embedded" : ""}`}>
        <div className="af-card">
          <p style={{ padding: "24px" }}>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (linkedJobId && jobError) {
    return (
      <div className={`af-page ${embedded ? "af-embedded" : ""}`}>
        <div className="af-card">
          <p style={{ padding: "24px", color: "#d33", fontWeight: "600" }}>
            {jobError}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`af-page ${embedded ? "af-embedded" : ""}`}>
      <div className="af-card">
        <header className="af-header">
          <div className="af-header-text">
            <h1>Application Form</h1>
            <p>
              {linkedJobId
                ? `Applying for: ${job?.title || "..."}`
                : "Select a position and fill out the details below to apply"}
            </p>
          </div>
        </header>

        <div className="af-body">
          {error && (
            <div
              className="af-error"
              style={{
                color: "#d33",
                fontSize: "13px",
                marginBottom: "15px",
                fontWeight: "600",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="af-success"
              style={{
                color: "green",
                fontSize: "13px",
                marginBottom: "15px",
                fontWeight: "600",
              }}
            >
              {success}
            </div>
          )}

          {/* {showSummary ? (
            <ApplicationSummary
              formValues={formValues}
              jobTitle={job?.title}
              employmentType={employmentType}
              files={files}
              loading={loading}
              success={success}
              onBack={() => setShowSummary(false)}
              onPrint={handlePrintDocument}
              onSubmit={handleFinalSubmission}
            />
          ) : ( */}
          <form onSubmit={handleFinalSubmission}>
            <PersonalDetailsFields
              formValues={formValues}
              onChange={handleInputChange}
            />

            {!linkedJobId && (
              <JobSelectFields
                jobs={openJobs}
                jobsLoading={openJobsLoading}
                jobsError={openJobsError}
                selectedJobId={selectedJobId}
                onJobChange={handleJobSelect}
              />
            )}

            <JobDetailsFields
              formValues={formValues}
              onChange={handleInputChange}
              employmentType={employmentType}
              onEmploymentTypeChange={setEmploymentType}
              job={job}
            />

            <DocumentUploadFields
              onFileChange={handleFileChange}
              files={files}
            />

            <DeclarationCheckbox agreed={agreed} onChange={setAgreed} />

            <button type="submit" className="af-submit" disabled={loading}>
              {loading ? "Submitting..." : "Confirm & Submit Application"}
            </button>
          </form>
          {/* )} */}
        </div>
      </div>
    </div>
  );
}
