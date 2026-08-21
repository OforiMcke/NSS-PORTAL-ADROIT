import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./ApplicationForm.css";

import PersonalDetailsFields from "./components/PersonalDetailsFields";
import JobDetailsFields from "./components/JobDetailsFields";
import DocumentUploadFields from "./components/DocumentUploadFields";
import DeclarationCheckbox from "./components/DeclarationCheckbox";

export default function ApplicationForm({ embedded = false }) {
  const navigate = useNavigate();
  const { jobId: linkedJobId } = useParams();

  const [formValues, setFormValues] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    const computedName = user
      ? user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : "";

    return {
      fullName: computedName,
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      location: user?.location || "",
      yearsOfExperience: "",
      experienceLevel: "",
    };
  });

  const [employmentType, setEmploymentType] = useState(
    "National Service Personnel",
  );
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState({ resume: null, additionalDocs: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [jobLoading, setJobLoading] = useState(!!linkedJobId);
  const [jobError, setJobError] = useState("");

  const [openJobs, setOpenJobs] = useState([]);
  const [openJobsLoading, setOpenJobsLoading] = useState(!linkedJobId);
  const [openJobsError, setOpenJobsError] = useState("");

  const [selectedRoleKey, setSelectedRoleKey] = useState("");
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  useEffect(() => {
    if (!linkedJobId) return;
    let mounted = true;

    api
      .get(`/api/jobs/${linkedJobId}`)
      .then((res) => {
        if (!mounted) return;
        if (res.data) setOpenJobs([res.data]);
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

        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.jobs || res.data?.data || [];

        setOpenJobs(list);

        if (list.length === 0) {
          setOpenJobsError(
            "No open Jobs available right now. Please check back later.",
          );
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Fetch open jobs failure:", err);
        setOpenJobsError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : "Couldn't load open roles. Please refresh the page.",
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

  const roleOptions = useMemo(() => {
    const opts = [];
    openJobs.forEach((j) => {
      const roles = j.roles?.length ? j.roles : [j.title];
      roles.forEach((r) => {
        opts.push({
          key: `${j._id}::${r}`,
          label: r,
          jobId: j._id,
          role: r,
        });
      });
    });
    return opts;
  }, [openJobs]);

  const isLocked = roleOptions.length === 1;
  const effectiveKey = isLocked ? roleOptions[0]?.key : selectedRoleKey;
  const selectedOption =
    roleOptions.find((o) => o.key === effectiveKey) || null;

  const job = useMemo(
    () => openJobs.find((j) => j._id === selectedOption?.jobId) || null,
    [openJobs, selectedOption],
  );
  const effectiveJobRole = selectedOption?.role || "";

  const handleRoleChange = (e) => setSelectedRoleKey(e.target.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleMultiFileChange = (fileArray) => {
    console.log(
      "additionalDocs now:",
      fileArray.map((f) => f.name),
    );
    setFiles((prev) => ({ ...prev, additionalDocs: fileArray }));
  };

  const handleDone = () => {
    const trimmedName = formValues.fullName.trim();
    const [firstName, ...rest] = trimmedName.split(" ");
    const lastName = rest.join(" ");

    navigate("/signup", {
      state: {
        prefill: {
          firstName,
          lastName,
          email: formValues.email,
          phoneNumber: formValues.phoneNumber,
        },
      },
    });
  };

  const validate = () => {
    if (!job?._id || !effectiveJobRole) {
      setError(
        linkedJobId
          ? "We couldn't confirm the job for this application. Please use a valid application link."
          : "Please select a role to apply for.",
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
    formData.append("jobRole", effectiveJobRole);
    formData.append(
      "yearsOfExperience",
      (formValues.yearsOfExperience || "").trim(),
    );
    formData.append("jobId", job._id);
    formData.append("employmentType", employmentType);
    formData.append("cv", files.resume);

    if (files.additionalDocs?.length > 0) {
      files.additionalDocs.forEach((doc) => {
        formData.append("additionalDocs", doc);
      });
    }

    api
      .post("/api/applications", formData)
      .then(() => {
        setShowAccountPrompt(true);
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
          <div className="af-logo"></div>
          <div className="af-header-text">
            <h1>Application Form</h1>
          </div>
        </header>

        <form className="af-body" onSubmit={handleFinalSubmission}>
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

          <PersonalDetailsFields
            formValues={formValues}
            onChange={handleInputChange}
          />

          <JobDetailsFields
            formValues={formValues}
            onChange={handleInputChange}
            employmentType={employmentType}
            onEmploymentTypeChange={setEmploymentType}
            roleOptions={roleOptions}
            isLocked={isLocked}
            selectedRoleKey={effectiveKey}
            onRoleChange={handleRoleChange}
            loading={linkedJobId ? jobLoading : openJobsLoading}
            error={linkedJobId ? jobError : openJobsError}
          />

          <DocumentUploadFields
            files={files}
            onFileChange={handleFileChange}
            onMultiFileChange={handleMultiFileChange}
          />
          <DeclarationCheckbox
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />

          <button type="submit" className="af-submit" disabled={loading}>
            {loading ? "Submitting..." : "Confirm & Submit Application"}
          </button>
        </form>
      </div>

      {showAccountPrompt && (
        <div
          role="dialog"
          aria-modal="true"
          className="af-modal-overlay"
          onClick={() => setShowAccountPrompt(false)}
        >
          <div className="af-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Application Submitted!</h3>
            <p>
              Your application has been received. To check your status, an
              account has been created for you. Click on done to set your
              password.
            </p>
            <div className="af-modal-actions">
              <button className="af-btn-secondary" onClick={handleDone}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
