import { prisma } from "./prisma";
import type { PlaylistHistory } from "@prisma/client";

export async function savePlaylistHistory(
  userId: string,
  concept: string,
  spotifyUrl: string,
  spotifyPlaylistId?: string
) {
  return prisma.playlistHistory.create({
    data: {
      userId,
      concept,
      spotifyUrl,
      spotifyPlaylistId,
    },
  });
}

export async function getPlaylistHistory(
  userId: string
): Promise<PlaylistHistory[]> {
  return prisma.playlistHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}


