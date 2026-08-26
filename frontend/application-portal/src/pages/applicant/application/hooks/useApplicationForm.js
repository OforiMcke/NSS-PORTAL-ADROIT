import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../api/axiosInstance";

export function useApplicationForm({ embedded, onSubmitSuccess }) {
  const navigate = useNavigate();
  const { jobId: linkedJobId } = useParams();
  const isLoggedIn = !!localStorage.getItem("authToken");

  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    yearsOfExperience: "",
    experienceLevel: "",
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
    if (!embedded || !isLoggedIn) return;
    let mounted = true;
    api
      .get("/api/auth/profile")
      .then((res) => {
        if (!mounted) return;
        const p = res.data;
        setFormValues((prev) => ({
          ...prev,
          fullName: `${p.firstName || ""} ${p.lastName || ""}`.trim(),
          email: p.email || "",
          phoneNumber: p.phoneNumber || "",
        }));
      })
      .catch((err) =>
        console.error("Failed to prefill from profile:", err.message),
      );
    return () => {
      mounted = false;
    };
  }, [embedded, isLoggedIn]);

  useEffect(() => {
    if (!linkedJobId) return;
    let mounted = true;
    api
      .get(`/api/jobs/${linkedJobId}`)
      .then((res) => {
        if (mounted && res.data) setOpenJobs([res.data]);
      })
      .catch((err) => {
        if (mounted)
          setJobError(
            err.response?.data?.message ||
              "This application link is invalid or has expired.",
          );
      })
      .finally(() => mounted && setJobLoading(false));
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
        if (list.length === 0)
          setOpenJobsError(
            "No open Jobs available right now. Please check back later.",
          );
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
      .finally(() => mounted && setOpenJobsLoading(false));
    return () => {
      mounted = false;
    };
  }, [linkedJobId]);

  const roleOptions = useMemo(() => {
    const opts = [];
    openJobs.forEach((j) => {
      const roles = j.roles?.length ? j.roles : [j.title];
      roles.forEach((r) =>
        opts.push({ key: `${j._id}::${r}`, label: r, jobId: j._id, role: r }),
      );
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (key) => (e) =>
    setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }));
  const handleMultiFileChange = (fileArray) =>
    setFiles((prev) => ({ ...prev, additionalDocs: fileArray }));

  const handleDone = () => {
    if (embedded && onSubmitSuccess) return onSubmitSuccess();
    if (isLoggedIn) return navigate("/applicant");
    const [firstName, ...rest] = formValues.fullName.trim().split(" ");
    navigate("/signup", {
      state: {
        prefill: {
          firstName,
          lastName: rest.join(" "),
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

  const handleSubmit = (e) => {
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
    files.additionalDocs?.forEach((doc) =>
      formData.append("additionalDocs", doc),
    );

    api
      .post("/api/applications", formData)
      .then(() => setShowAccountPrompt(true))
      .catch((err) =>
        setError(
          err.response?.data?.message || err.message || "Submission failed",
        ),
      )
      .finally(() => setLoading(false));
  };

  return {
    isLoggedIn,
    linkedJobId,
    formValues,
    employmentType,
    setEmploymentType,
    agreed,
    setAgreed,
    files,
    loading,
    error,
    success,
    jobLoading,
    jobError,
    openJobsLoading,
    openJobsError,
    roleOptions,
    isLocked,
    effectiveKey,
    showAccountPrompt,
    handleInputChange,
    handleFileChange,
    handleMultiFileChange,
    handleDone,
    handleRoleChange: (e) => setSelectedRoleKey(e.target.value),
    handleSubmit,
  };
}
