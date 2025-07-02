"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) {
    throw new Error("NEXT_PUBLIC_APPWRITE_ENDPOINT is not defined");
  }
  if (!process.env.NEXT_PUBLIC_APPWRITE_PROJECT) {
    throw new Error("NEXT_PUBLIC_APPWRITE_PROJECT is not defined");
  }

  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT);

  const cookieStore = await cookies();
  const session = cookieStore.get("appwrite-session");

  if (!session || !session.value) {
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
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

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

