require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("./Category");
const SubCategory = require("./SubCategory");

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error(
    "MONGO_URI is not set. Check that backend/.env exists and contains MONGO_URI=<your connection string>, " +
      "and that you're running this script from a location where dotenv can find that .env file.",
  );
  process.exit(1);
}

const seedData = [
  {
    name: "NSS Applications",
    slug: "nss-applications",
    description: "National Service Scheme placements",
    subCategories: [
      "Software Developers",
      "UI/UX Designers",
      // "Mobile App Developers",
      // "Business Administration",
      // "Human Resource",
      // "Others",
    ],
  },
  {
    name: "Internship Applications",
    slug: "internship-applications",
    description: "Internship openings across departments",
    subCategories: [
      "Software Developers",
      "UI/UX Designers",
      // "Mobile App Developers",
      // "Data Analysts",
      // "Others",
    ],
  },
  {
    name: "Job Applications",
    slug: "job-applications",
    description: "Full-time job openings",
    subCategories: [
      "Software Developers",
      "UI/UX Designers",
      // "Mobile App Developers",
      // "Product Managers",
      // "Others",
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB:", mongoose.connection.host);

  await Category.deleteMany({});
  await SubCategory.deleteMany({});
  console.log("Cleared existing Category / SubCategory collections");

  for (const cat of seedData) {
    const category = await Category.create({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      isActive: true,
      subCategories: [],
    });

    const subDocs = await SubCategory.insertMany(
      cat.subCategories.map((name) => ({
        name,
        category: category._id,
        applications: [],
        acceptedApplications: [],
        isActive: true,
      })),
    );

    category.subCategories = subDocs.map((s) => s._id);
    await category.save();

    console.log(
      `Seeded "${category.name}" with ${subDocs.length} sub-categories: ${subDocs
        .map((s) => s.name)
        .join(", ")}`,
    );
  }

  console.log("Done seeding.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
