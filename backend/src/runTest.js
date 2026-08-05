require("dotenv").config();

const {
  sendAcceptanceEmail,
  sendRejectionEmail,
} = require("./controllers/emailController");

// Mock application objects
const mockAcceptedApplicant = {
  fullName: "Julius Junior",
  // email: "donaldfifonsi@gmail.com",
  email: "oforimckeownjulius@gmail.com",
};

const mockRejectedApplicant = {
  fullName: "Julius Ofori",
  email: "jmofori@palm.edu.gh",
  adminFeedback:
    "Your profile does not match our current technical requirements.",
};

async function executeTests() {
  console.log("Starting email tests...");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error(
      "EMAIL_USER and EMAIL_PASS must be set in .env or environment variables.",
    );
  }

  try {
    // Test Acceptance Email
    console.log("Sending acceptance email...");
    await sendAcceptanceEmail(mockAcceptedApplicant);
    console.log("Acceptance email sent successfully!");

    // Test Rejection Email
    console.log("Sending rejection email...");
    await sendRejectionEmail(mockRejectedApplicant);
    console.log("Rejection email sent successfully!");
  } catch (error) {
    console.error("Error running email tests:", error);
  }
}

executeTests();
