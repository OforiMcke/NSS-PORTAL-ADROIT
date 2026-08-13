require("dotenv").config();

const {
  sendAcceptanceEmail,
  sendRejectionEmail,
  sendApplicationReceivedEmail,
  sendNewApplicationAdminEmail,
} = require("./controllers/emailController");

const MockApplicationEmail = {
  fullName: "JM Ofori",
  email: "oforimckeownjulius@gmail.com",
  jobTitle: "Software dev",
};

const MockNewApplicationEmail = {
  fullName: "JM Ofori",
  email: "oforimckeownjulius@gmail.com",
  jobTitle: "Software dev",
};
// Mock application objects
const mockAcceptedApplicant = {
  fullName: "Julius Junior",
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
    console.log("Sending application email...");
    await sendApplicationReceivedEmail(MockApplicationEmail);
    console.log("Application email sent successfully!");

    console.log("Sending New application email...");
    await sendNewApplicationAdminEmail(MockNewApplicationEmail);
    console.log(" New Application email received successfully!");

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
