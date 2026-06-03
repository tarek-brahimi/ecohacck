import crypto from "node:crypto";
import mysql from "mysql2/promise";

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derivedKey}`;
}

function createPool() {
  if (process.env.MYSQL_URL) {
    return mysql.createPool(process.env.MYSQL_URL);
  }

  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || "hackathon_db";

  if (!host || !user || !password) {
    throw new Error(
      "Set MYSQL_URL or MYSQL_HOST, MYSQL_USER, and MYSQL_PASSWORD.",
    );
  }

  return mysql.createPool({
    host,
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
  });
}

const users = [
  {
    id: "user_admin",
    email: "admin@example.com",
    fullName: "Platform Admin",
    ageGroup: "young-adult",
    interests: JSON.stringify(["tech", "social"]),
    role: "admin",
  },
  {
    id: "user_house",
    email: "house@example.com",
    fullName: "Riyadh Community House",
    ageGroup: "young-adult",
    interests: JSON.stringify(["social", "outdoor"]),
    role: "house-owner",
  },
  {
    id: "user_alex",
    email: "alex@example.com",
    fullName: "Alex Johnson",
    ageGroup: "teen",
    interests: JSON.stringify(["sports", "tech"]),
    role: "user",
  },
  {
    id: "user_jordan",
    email: "jordan@example.com",
    fullName: "Jordan Lee",
    ageGroup: "young-adult",
    interests: JSON.stringify(["arts", "music"]),
    role: "user",
  },
];

const activities = [
  {
    id: "activity_public_1",
    title: "Neighborhood Football Meetup",
    description: "Casual football session for teens and young adults.",
    category: "sports",
    location: "King Fahd Park, Riyadh",
    latitude: 24.754,
    longitude: 46.639,
    date: "2026-07-12 16:00:00",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
    difficultyLevel: "easy",
    organizerId: "user_admin",
    houseOwnerId: "user_house",
    status: "public",
    approvedAt: "2026-06-01 10:00:00",
  },
  {
    id: "activity_public_2",
    title: "Creative Coding Workshop",
    description: "Hands-on coding workshop for beginners.",
    category: "tech",
    location: "Olaya District, Riyadh",
    latitude: 24.691,
    longitude: 46.685,
    date: "2026-07-20 14:00:00",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd95375aa9?w=800",
    difficultyLevel: "medium",
    organizerId: "user_admin",
    houseOwnerId: "user_house",
    status: "public",
    approvedAt: "2026-06-01 10:00:00",
  },
  {
    id: "activity_pending_1",
    title: "Community Garden Day",
    description: "Volunteer gardening and sustainability activities.",
    category: "outdoor",
    location: "Al Malaz, Riyadh",
    latitude: 24.67,
    longitude: 46.72,
    date: "2026-08-05 09:00:00",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    difficultyLevel: "easy",
    organizerId: "user_admin",
    houseOwnerId: "user_house",
    status: "pending",
    approvedAt: null,
  },
];

async function main() {
  const pool = createPool();
  const passwordHash = hashPassword("password123");

  try {
    for (const user of users) {
      await pool.execute(
        `INSERT INTO users (id, email, password_hash, full_name, age_group, interests, points, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 0, ?, NOW())
         ON DUPLICATE KEY UPDATE
           email = VALUES(email),
           password_hash = VALUES(password_hash),
           full_name = VALUES(full_name),
           age_group = VALUES(age_group),
           interests = VALUES(interests),
           role = VALUES(role)`,
        [
          user.id,
          user.email,
          passwordHash,
          user.fullName,
          user.ageGroup,
          user.interests,
          user.role,
        ],
      );
    }

    for (const activity of activities) {
      await pool.execute(
        `INSERT INTO activities (
          id, title, description, category, location, latitude, longitude, date, image_url,
          difficulty_level, organizer_id, house_owner_id, status, approved_at, enrollment_count, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
        ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          category = VALUES(category),
          location = VALUES(location),
          latitude = VALUES(latitude),
          longitude = VALUES(longitude),
          date = VALUES(date),
          image_url = VALUES(image_url),
          difficulty_level = VALUES(difficulty_level),
          organizer_id = VALUES(organizer_id),
          house_owner_id = VALUES(house_owner_id),
          status = VALUES(status),
          approved_at = VALUES(approved_at)`,
        [
          activity.id,
          activity.title,
          activity.description,
          activity.category,
          activity.location,
          activity.latitude,
          activity.longitude,
          activity.date,
          activity.imageUrl,
          activity.difficultyLevel,
          activity.organizerId,
          activity.houseOwnerId,
          activity.status,
          activity.approvedAt,
        ],
      );
    }

    console.log("Seed completed.");
    console.log("Demo accounts (password: password123):");
    for (const user of users) {
      console.log(`- ${user.role}: ${user.email}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
