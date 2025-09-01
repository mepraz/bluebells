import { MongoClient, Db } from 'mongodb';
import * as bcrypt from 'bcrypt';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'school';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function seedDefaultUser(db: Db) {
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();

    if (userCount === 0) {
        console.log("No users found. Seeding default admin user...");
        const username = 'bluebell';
        const password = 'bluebell123';
        const passwordHash = await bcrypt.hash(password, 10);

        await usersCollection.insertOne({
            username,
            passwordHash
        });
        console.log(`Default user '${username}' with password '${password}' created.`);
        console.log("Please change this password after your first login.");
    }
}


export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI!, {
    tlsAllowInvalidCertificates: true,
  });

  await client.connect();

  const db = client.db(MONGODB_DB);

  // Seed the database with a default user if it's empty
  await seedDefaultUser(db);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
