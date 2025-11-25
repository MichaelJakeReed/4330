import crypto from "crypto";
import { prisma } from "./prisma";

export type AppUser = {
  id: string;
  username: string;
  passHash: string;
  spotify?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
};

export function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

// createUser(username, password)
export async function createUser(username: string, password: string): Promise<AppUser> {
  const passHash = hashPassword(password);
  const user = await prisma.user.create({
    data: { username, passHash },
  });

  return { id: user.id, username: user.username, passHash: user.passHash };
}

// findByUsername(username)
export async function findByUsername(username: string): Promise<AppUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
    include: { spotifyAccount: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    passHash: user.passHash,
    spotify: user.spotifyAccount
      ? {
          accessToken: user.spotifyAccount.accessToken,
          refreshToken: user.spotifyAccount.refreshToken,
          expiresAt: user.spotifyAccount.expiresAt.getTime(),
        }
      : undefined,
  };
}

// getUser(id)
export async function getUser(id: string): Promise<AppUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { spotifyAccount: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    username: user.username,
    passHash: user.passHash,
    spotify: user.spotifyAccount
      ? {
          accessToken: user.spotifyAccount.accessToken,
          refreshToken: user.spotifyAccount.refreshToken,
          expiresAt: user.spotifyAccount.expiresAt.getTime(),
        }
      : undefined,
  };
}

// saveUser(user)
// used mainly to persist/update spotify creds
export async function saveUser(u: AppUser): Promise<void> {
  // save spotify info if present
  if (u.spotify) {
    await prisma.spotifyAccount.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        accessToken: u.spotify.accessToken,
        refreshToken: u.spotify.refreshToken,
        expiresAt: new Date(u.spotify.expiresAt),
      },
      update: {
        accessToken: u.spotify.accessToken,
        refreshToken: u.spotify.refreshToken,
        expiresAt: new Date(u.spotify.expiresAt),
      },
    });
  }
}
