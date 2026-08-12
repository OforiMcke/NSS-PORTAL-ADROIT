export default function PersonalDetailsFields({ formValues, onChange }) {
  return (
    <>
      <h3>Personal Information</h3>
      <div className="af-grid-2">
        <div>
          <label>
            Full Name <span style={{ color: "#d33" }}>*</span>
          </label>
          <input
            type="text"
            name="fullName"
            className="af-input"
            value={formValues.fullName}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>
            Email Address <span style={{ color: "#d33" }}>*</span>
          </label>
          <input
            type="email"
            name="email"
            className="af-input"
            value={formValues.email}
            onChange={onChange}
            required
          />
        </div>
      </div>
      <div className="af-grid-2" style={{ marginTop: "12px" }}>
        <div>
          <label>
            Phone Number <span style={{ color: "#d33" }}>*</span>
          </label>
          <input
            type="tel"
            name="phoneNumber"
            className="af-input"
            value={formValues.phoneNumber}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Current Location</label>
          <input
            type="text"
            name="location"
            className="af-input"
            value={formValues.location}
            onChange={onChange}
          />
        </div>
      </div>
      {/* <h3>Education Details</h3>

      <div className="af-grid-2" style={{ marginTop: "12px" }}>
        <div>
          <label>Education Level</label>
          <input
            type="text"
            name="educationLevel"
            className="af-input"
            placeholder="e.g. BSc, HND, WASSCE"
            value={formValues.educationLevel}
            onChange={onChange}
          />
        </div>
        <div>
          <label>School Attended</label>
          <input
            type="text"
            name="school"
            className="af-input"
            value={formValues.school}
            onChange={onChange}
          />
        </div>
      </div> */}
    </>
  );
}
