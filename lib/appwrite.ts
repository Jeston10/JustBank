"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
  // Check for required environment variables
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  
  console.log("Appwrite config check:", {
    hasEndpoint: !!endpoint,
    hasProjectId: !!projectId,
    endpoint: endpoint ? endpoint.substring(0, 30) + "..." : "missing",
    projectId: projectId ? projectId.substring(0, 10) + "..." : "missing"
  });

  if (!endpoint) {
    console.error("NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined");
    throw new Error("NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined");
  }
  if (!projectId) {
    console.error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined");
    throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT_ID is not defined");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  console.log("Session check:", {
    hasSession: !!session,
    hasSessionValue: !!(session?.value),
    sessionLength: session?.value?.length || 0
  });

  if (!session || !session.value) {
    console.error("No valid session found");
    throw new Error("No session");
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;

  console.log("Admin client config check:", {
    hasEndpoint: !!endpoint,
    hasProjectId: !!projectId,
    hasApiKey: !!apiKey
  });

  if (!endpoint || !projectId || !apiKey) {
    throw new Error("Missing required Appwrite environment variables");
  }

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    }
  };
}

