import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance";
import "./ApplicationForm.css";

const EMPLOYMENT_TYPES = [
  "Intern",
  "National Service Personnel",
  "Full-Time",
  "Part-Time",
];

export default function ApplicationForm({ embedded = false, onSubmitSuccess }) {
  const [employmentType, setEmploymentType] = useState("Intern");
  const [agreed, setAgreed] = useState(false);
  const [files, setFiles] = useState({
    resume: null,
    coverLetter: null,
    photo: null,
    additional: null,
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const finishSubmit = () => {
    if (embedded && typeof onSubmitSuccess === "function") {
      onSubmitSuccess();
      return;
    }
    navigate("/applicant");
  };

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);

  const handleFileChange = (key) => (e) => {
    const file = e.target.files?.[0] || null;
    setFiles((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const form = e.target;
    const fullName = form.fullName?.value?.trim();
    const email = form.email?.value?.trim();
    const phoneNumber = form.phoneNumber?.value?.trim();
    const statementOfMotivation = form.statementOfMotivation?.value?.trim();
    const categoryId = form.categoryId?.value;
    const subCategoryId = form.subCategoryId?.value;

    if (!fullName || !email || !phoneNumber || !statementOfMotivation) {
      setError("Please fill required fields and add your CV.");
      return;
    }

    if (!files.resume) {
      setError("Please upload your resume (CV).");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("statementOfMotivation", statementOfMotivation);
    if (categoryId) formData.append("categoryId", categoryId);
    if (subCategoryId) formData.append("subCategoryId", subCategoryId);
    formData.append("employmentType", employmentType);
    formData.append("cv", files.resume);
    if (files.photo) formData.append("photo", files.photo);
    if (files.coverLetter) formData.append("coverLetter", files.coverLetter);
    if (files.additional) formData.append("additional", files.additional);

    setLoading(true);
    api
      .post("/api/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
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

  useEffect(() => {
    let mounted = true;
    api
      .get("/api/categories")
      .then((res) => {
        if (!mounted) return;
        const list = res.data?.data || [];
        setCategories(list);
        if (list.length === 0) {
          setCategoriesError(
            "No categories are available right now. Please check back later.",
          );
        }
      })
      .catch((err) => {
        if (!mounted) return;
        console.warn("Failed to load categories", err.message);
        setCategoriesError(
          err.response?.status === 401
            ? "Your session has expired. Please log in again."
            : "Couldn't load categories. Please refresh the page.",
        );
      })
      .finally(() => {
        if (!mounted) return;
        setCategoriesLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className={`af-page ${embedded ? "af-embedded" : ""}`}>
      <form className="af-card" onSubmit={handleSubmit}>
        <header className="af-header">
          <div className="af-header-text">
            <h1>Application Form</h1>
            <p>Fill out the details below to apply for a position</p>
          </div>
        </header>

        <div className="af-body">
          <section className="af-section">
            <h2>Personal Information</h2>
            <div className="af-grid-2">
              <div>
                <label>
                  Full Name <span style={{ color: "#d33" }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  name="fullName"
                  required
                />
              </div>

              <div>
                <label>
                  Email <span style={{ color: "#d33" }}>*</span>
                </label>
                <input type="email" placeholder="Email" name="email" required />
              </div>

              <div>
                <label>
                  Phone Number <span style={{ color: "#d33" }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Phone Number"
                  name="phoneNumber"
                  required
                />
              </div>

              <div>
                <label>Location</label>
                <input type="text" placeholder="Location" name="location" />
              </div>
            </div>
          </section>

          <section className="af-section">
            <h2>Education Details</h2>
            <div className="af-grid-2">
              <input
                type="text"
                placeholder="Level of Education"
                name="educationLevel"
              />
              <input type="text" placeholder="School Attended" name="school" />
            </div>
          </section>

          <section className="af-section">
            <h2>
              Employment Type<span style={{ color: "#d33" }}>*</span>
            </h2>
            <div
              className="af-pill-group"
              role="group"
              aria-label="Employment Type"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  className={`af-pill ${employmentType === type ? "af-pill-active" : ""}`}
                  onClick={() => setEmploymentType(type)}
                  aria-pressed={employmentType === type}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className="af-section">
            <h2>Job Details</h2>
            <div className="af-grid-2">
              <input type="text" placeholder="Job Title" name="jobTitle" />
              <input type="text" placeholder="Job Role" name="jobRole" />
              <input
                type="text"
                placeholder="Level of Experience"
                name="experienceLevel"
              />
              <input
                type="url"
                placeholder="Portfolio / Website (URL)"
                name="portfolio"
              />
            </div>
            {categoriesError && (
              <div className="af-error" style={{ marginBottom: 8 }}>
                {categoriesError}
              </div>
            )}
            <div className="af-grid-2">
              <select
                value={selectedCategory}
                name="categoryId"
                className="af-select"
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedCategory(id);
                  const category = categories.find((c) => c._id === id);
                  setSubCategories(category?.subCategories || []);
                }}
                required
              >
                <option value="" disabled>
                  {categoriesLoading
                    ? "Loading categories..."
                    : "Select a category"}
                </option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={subCategories.length > 0 ? undefined : ""}
                name="subCategoryId"
                className="af-select"
                disabled={!selectedCategory || subCategories.length === 0}
                required
              >
                <option value="" disabled>
                  {selectedCategory
                    ? subCategories.length > 0
                      ? "Select a sub-category"
                      : "No sub-categories available"
                    : "Select a category first"}
                </option>
                {subCategories.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 12 }}>
              <label>
                <strong>
                  Statement of Motivation{" "}
                  <span style={{ color: "#d33" }}>*</span>
                </strong>
              </label>
              <textarea
                name="statementOfMotivation"
                rows={6}
                placeholder="Briefly tell us why you are a good fit"
                style={{ width: "100%", marginTop: 8 }}
                required
              />
            </div>
          </section>

          <section className="af-section af-uploads">
            <div className="af-grid-4">
              <div className="af-upload-field">
                <span className="af-upload-label">
                  Upload Resume (CV) <span style={{ color: "#d33" }}>*</span>
                </span>
                <label className="af-dropzone">
                  <input
                    type="file"
                    onChange={handleFileChange("resume")}
                    hidden
                    accept=".pdf,.doc,.docx"
                    required
                  />
                  <span>
                    {files.resume ? files.resume.name : "Choose file"}
                  </span>
                </label>
              </div>
              <div className="af-upload-field">
                <span className="af-upload-label">Upload Cover Letter</span>
                <label className="af-dropzone">
                  <input
                    type="file"
                    onChange={handleFileChange("coverLetter")}
                    hidden
                    accept=".pdf,.doc,.docx"
                  />
                  <span>
                    {files.coverLetter ? files.coverLetter.name : "Choose file"}
                  </span>
                </label>
              </div>
              <div className="af-upload-field">
                <span className="af-upload-label">
                  Upload Photo <em>(optional)</em>
                </span>
                <label className="af-dropzone">
                  <input
                    type="file"
                    onChange={handleFileChange("photo")}
                    hidden
                    accept="image/*"
                  />
                  <span>{files.photo ? files.photo.name : "Choose file"}</span>
                </label>
              </div>
              <div className="af-upload-field">
                <span className="af-upload-label">
                  Additional Documents <em>(optional)</em>
                </span>
                <label className="af-dropzone">
                  <input
                    type="file"
                    onChange={handleFileChange("additional")}
                    hidden
                  />
                  <span>{files.additional ? files.additional.name : ""}</span>
                </label>
              </div>
            </div>
          </section>

          <div className="af-footer">
            <label className="af-checkbox">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <a href="#terms">terms and conditions</a> &amp;{" "}
                <a href="#privacy">Privacy Policy</a>
              </span>
            </label>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button
                type="submit"
                className="af-submit"
                disabled={!agreed || loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              {error && <div className="af-error">{error}</div>}
              {success && <div className="af-success">{success}</div>}
            </div>
          </div>
        </div>
      </form>

      {success && (
        <div
          className="af-modal"
          style={{
            position: "fixed",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "rgba(0,0,0,0.45)",
            zIndex: 60,
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "#0a0b1a",
              padding: 24,
              borderRadius: 12,
              color: "#fff",
              width: 420,
              textAlign: "center",
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 8 }}>{success}</h3>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              You will be redirected shortly.
            </p>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                gap: 8,
                justifyContent: "center",
              }}
            >
              <button
                onClick={finishSubmit}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: "#2563eb",
                  color: "#fff",
                }}
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => setSuccess("")}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid #444",
                  background: "transparent",
                  color: "#fff",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
