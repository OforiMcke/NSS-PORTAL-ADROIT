require("dotenv").config();
const mongoose = require("mongoose");
const Application = require("./models/Application");

const MONGO_URI = process.env.MONGO_URI;

async function repair() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", mongoose.connection.host);

  const broken = await Application.find({
    status: "hired",
    $or: [{ hiredDate: { $exists: false } }, { hiredDate: null }],
  });

  console.log(`Found ${broken.length} hired application(s) missing hiredDate.`);

  for (const app of broken) {
    app.hiredDate = app.reviewDate || new Date();
    await app.save();
    console.log(`Repaired ${app.fullName} — hiredDate set to ${app.hiredDate}`);
  }

  console.log("Repair complete.");
  await mongoose.disconnect();
}

repair().catch((err) => {
  console.error("Repair failed:", err);
  process.exit(1);
});
