export function SubmissionModal({ isLoggedIn, onDone }) {
  return (
    <div className="af-modal-overlay">
      <div className="af-modal">
        <h3>Application Submitted!</h3>
        <p>
          {isLoggedIn
            ? "Your application has been received. Click below to view your status on your dashboard."
            : "Your application has been received. Let's finish securing your account by setting up your password."}
        </p>
        <div className="af-modal-actions">
          <button type="button" className="af-submit" onClick={onDone}>
            {isLoggedIn ? "Go to Dashboard" : "Set Password & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
