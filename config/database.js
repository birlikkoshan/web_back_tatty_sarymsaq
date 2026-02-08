const { MongoClient } = require("mongodb");
const config = require("./index");

let client;
let db;

async function connectDB() {
  if (db) return db;

  const uri = config.mongoUri;
  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment variables");
  }

  const mongoOptions = {
    retryWrites: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  };
  if (process.env.MONGODB_TLS === "false" || uri.includes("railway.internal")) {
    mongoOptions.tls = false;
  } else if (uri.startsWith("mongodb+srv://") || process.env.MONGODB_TLS === "true") {
    mongoOptions.tls = true;
  }

  client = new MongoClient(uri, mongoOptions);
  await client.connect();
  db = client.db(config.dbName);

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
