import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "@clerk/clerk-react";

export function useConvex() {
  const { userId } = useAuth();

  // Podcast queries and mutations
  const createPodcast = useMutation(api.podcasts.createPodcast);
  const updatePodcastStatus = useMutation(api.podcasts.updatePodcastStatus);
  const getUserPodcasts = useQuery(api.podcasts.getUserPodcasts, { creator: userId });
  const getPodcast = (id) => useQuery(api.podcasts.getPodcast, { id });

  // Video queries and mutations
  const createVideo = useMutation(api.videos.createVideo);
  const updateVideoStatus = useMutation(api.videos.updateVideoStatus);
  const getUserVideos = useQuery(api.videos.getUserVideos, { creator: userId });
  const getVideo = (id) => useQuery(api.videos.getVideo, { id });

  return {
    // Podcast operations
    createPodcast: async (data) => {
      return await createPodcast({ ...data, creator: userId });
    },
    updatePodcastStatus,
    getUserPodcasts,
    getPodcast,

    // Video operations
    createVideo: async (data) => {
      return await createVideo({ ...data, creator: userId });
    },
    updateVideoStatus,
    getUserVideos,
    getVideo,
  };
}
