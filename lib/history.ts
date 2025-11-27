import { prisma } from "./prisma";
import type { PlaylistHistory } from "@prisma/client";

//saves a new playlist history entry to the database
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

//retrieves playlist history entries for a given user
export async function getPlaylistHistory(
  userId: string
): Promise<PlaylistHistory[]> {
  return prisma.playlistHistory.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}


