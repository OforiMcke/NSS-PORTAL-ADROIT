require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Application = require("./models/Application");

(async () => {
  try {
    await connectDB();

    const collection = mongoose.connection.collection("applications");

    const before = await collection.indexes();
    console.log(
      "Indexes before cleanup:",
      before.map((i) => i.name),
    );

    const hasOldIndex = before.some((i) => i.name === "email_1");

    if (hasOldIndex) {
      await collection.dropIndex("email_1");
      console.log("Dropped old 'email_1' unique index.");
    } else {
      console.log("No 'email_1' index found — skipping drop.");
    }

    // Creates any indexes declared in the schema that are missing,
    // and drops any indexes in the DB that are no longer declared in the schema.
    const syncResult = await Application.syncIndexes();
    console.log("syncIndexes result (dropped/created):", syncResult);

    const after = await collection.indexes();
    console.log(
      "Indexes after cleanup:",
      after.map((i) => i.name),
    );

    process.exit(0);
  } catch (err) {
    console.error("Failed to fix indexes:", err.message);
    process.exit(1);
  }
})();
