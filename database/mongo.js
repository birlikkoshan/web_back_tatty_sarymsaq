const { MongoClient } = require("mongodb");

let client;
let db;

async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  const dbName = process.env.MONGODB_DB_NAME || "assignment3";

  client = new MongoClient(uri, {
    maxPoolSize: 10,
  });

  await client.connect();
  db = client.db(dbName);

  return db;
}

async function getCollection(name) {
  const database = await connectDB();
  return database.collection(name);
}

async function closeDB() {
  if (!client) return;
  await client.close();
  client = undefined;
  db = undefined;
}

module.exports = {
  connectDB,
  getCollection,
  closeDB,
};
