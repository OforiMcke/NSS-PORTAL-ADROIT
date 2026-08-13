import { useState, useEffect } from "react";
import api from "../../api/axiosInstance";
import "./CreateJob.css";

export const CreateJob = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    employmentType: "NSS",
    role: "",
    deadline: "",
  });

  // Categories/sub-categories are disabled for now — NSS focus only.
  // const [categories, setCategories] = useState([]);
  // const [categoriesLoading, setCategoriesLoading] = useState(true);
  // const [categoriesError, setCategoriesError] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState("");
  // const [subCategories, setSubCategories] = useState([]);
  // const [subCategoryId, setSubCategoryId] = useState("");

  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [roleInput, setRoleInput] = useState("");

  const addRole = () => {
    const trimmed = roleInput.trim();
    if (trimmed && !roles.includes(trimmed)) {
      setRoles((prev) => [...prev, trimmed]);
    }
    setRoleInput("");
  };

  const removeRole = (role) => {
    setRoles((prev) => prev.filter((r) => r !== role));
  };

  // useEffect(() => {
  //   let mounted = true;
  //   api
  //     .get("/api/categories")
  //     .then((res) => {
  //       if (!mounted) return;
  //       const list = res.data?.data || [];
  //       setCategories(list);
  //       if (list.length === 0) {
  //         setCategoriesError("No categories are available. Create one first.");
  //       }
  //     })
  //     .catch((err) => {
  //       if (!mounted) return;
  //       setCategoriesError(
  //         err.response?.data?.message || "Couldn't load categories.",
  //       );
  //     })
  //     .finally(() => {
  //       if (!mounted) return;
  //       setCategoriesLoading(false);
  //     });
  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleCategoryChange = (id) => {
  //   setSelectedCategory(id);
  //   const category = categories.find((c) => c._id === id);
  //   setSubCategories(category?.subCategories || []);
  //   setSubCategoryId("");
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (roles.length === 0) {
      setError("Please add at least one job role.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/jobs", { ...form, roles });
      setLink(res.data.applicationLink);
      setForm({
        title: "",
        description: "",
        employmentType: "NSS",
        deadline: "",
      });
      setRoles([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create job");
    } finally {
      setLoading(false);
    }
  };

  // if (!selectedCategory || !subCategoryId) {
  //   setError("Please select a category and sub-category for this job.");
  //   return;
  // }

  const copyLink = () => {
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="create-job-page">
      <h2>Create Job</h2>

      {link && (
        <div className="job-link-box">
          <p>Job created. Share this link with applicants:</p>
          <div className="link-row">
            <input type="text" readOnly value={link} />
            <button onClick={copyLink}>Copy</button>
          </div>
        </div>
      )}

      {error && <p className="error-text">{error}</p>}
      {/* {categoriesError && <p className="error-text">{categoriesError}</p>} */}

      <form onSubmit={handleSubmit} className="create-job-form">
        <label>
          Job Title
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            required
          />
        </label>

        {/*
        <label>
          Category
          <select
            value={selectedCategory}
            disabled={categoriesLoading}
            onChange={(e) => handleCategoryChange(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sub-Category
          <select
            value={subCategoryId}
            disabled={subCategories.length === 0}
            onChange={(e) => setSubCategoryId(e.target.value)}
            required
          >
            <option value="">Select Sub-Category</option>
            {subCategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Department
          <input
            type="text"
            name="department"
            value={form.department}
            onChange={handleChange}
          />
        </label>

        <label>
          Location
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
          />
        </label>
        */}
        <label>
          Job Roles
          <div className="role-input-row">
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addRole();
                }
              }}
              placeholder="e.g. Software Developer"
            />
            <button type="button" onClick={addRole}>
              Add
            </button>
          </div>
          <div className="role-chip-list">
            {roles.map((r) => (
              <span key={r} className="role-chip">
                {r}
                <button
                  type="button"
                  onClick={() => removeRole(r)}
                  aria-label={`Remove ${r}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </label>

        <label>
          Employment Type
          <select
            name="employmentType"
            value={form.employmentType}
            onChange={handleChange}
          >
            {/* <option>Full-time</option> */}
            {/* <option>Internship</option> */}
            <option>NSS</option>
          </select>
        </label>

        <label>
          Application Deadline
          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default CreateJob;
