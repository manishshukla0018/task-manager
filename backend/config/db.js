import mongoose from 'mongoose';
import { env } from './env.js';

const printSrvTroubleshooting = () => {
  console.error(`
----------------------------------------------------------------------
MongoDB Atlas SRV lookup failed (querySrv ECONNREFUSED).
This is usually a DNS or network issue on your machine, not bad code.

Try one of these:

1) Atlas → Network Access → add IP 0.0.0.0/0 (or your current IP).

2) Use a DIRECT connection string (no SRV) — avoids DNS SRV lookup:
   In .env set MONGODB_URI_DIRECT to the "standard" URI from Atlas:
   Atlas → Connect → Compass → copy the mongodb://host1:27017,host2:27017,...
   (or MongoDB docs: "connection string without SRV")

3) Windows: set DNS to 8.8.8.8 / 8.8.4.4, or turn VPN off, or try another network.

4) Local MongoDB for dev only:
   MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager
----------------------------------------------------------------------
`);
};

const printInvalidSchemeHelp = () => {
  console.error(`
----------------------------------------------------------------------
Invalid MongoDB connection string.

Your .env must set exactly ONE of these (no spaces before mongodb):

  MONGODB_URI=mongodb+srv://USER:PASS@cluster...mongodb.net/DBNAME?retryWrites=true&w=majority

or

  MONGODB_URI=mongodb://127.0.0.1:27017/team-task-manager

Common mistakes:
  • Missing mongodb:// or mongodb+srv:// prefix
  • Extra quotes inside the value (copy from Atlas without wrapping again)
  • MONGODB_URI_DIRECT set to a wrong value — remove it or fix it; a bad DIRECT
    value is now ignored and MONGODB_URI is used instead
  • Password contains @ : # ? — URL-encode those characters in the password
----------------------------------------------------------------------
`);
};

export const connectDB = async () => {
  const uri = env.mongoUri;
  const isSrv = uri.startsWith('mongodb+srv://');

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    printInvalidSchemeHelp();
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      family: 4,
    });
    console.log('MongoDB connected');
  } catch (err) {
    const msg = err.message || String(err);
    console.error('MongoDB connection error:', msg);

    if (msg.includes('Invalid scheme') || msg.includes('mongodb://') || msg.includes('mongodb+srv')) {
      printInvalidSchemeHelp();
    }
    if (msg.includes('querySrv') || msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND')) {
      if (isSrv) printSrvTroubleshooting();
    }
    process.exit(1);
  }
};
