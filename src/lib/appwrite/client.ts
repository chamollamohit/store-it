"use client";

import { Client, Storage } from "node-appwrite";
import { appwriteConfig } from "./config";

// Initialize the Appwrite client for the browser
const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

// This tells the client to use the session cookie
// set by your server-side authentication.
client.setSession("current");

// Export a client-side storage instance
export const storage = new Storage(client);

console.log(storage);
