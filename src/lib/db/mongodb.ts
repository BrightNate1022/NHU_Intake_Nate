import { MongoClient, Db } from 'mongodb';

const options = {};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so the value
    // is preserved across module reloads caused by HMR
    if (!global._mongoClientPromise) {
      global._mongoClient = new MongoClient(uri, options);
      global._mongoClientPromise = global._mongoClient.connect();
    }
    return global._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable
    const client = new MongoClient(uri, options);
    return client.connect();
  }
}

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('hireu-intake');
}

export default getClientPromise;

