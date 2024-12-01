import React from 'react';
import { Box, Heading, VStack, Text } from '@chakra-ui/react';
import { useUser } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../convex/api';

export default function Profile() {
  const { user } = useUser();
  const podcasts = useQuery(api.podcasts.getUserPodcasts, { 
    creator: user?.id || '' 
  });

  return (
    <Box maxW="container.md" mx="auto" pt={8}>
      <Heading mb={6}>Profile</Heading>
      
      <VStack spacing={4} align="stretch">
        <Box>
          <Heading size="md" mb={2}>Your Information</Heading>
          <Text>Email: {user?.primaryEmailAddress?.emailAddress}</Text>
          <Text>Name: {user?.fullName}</Text>
        </Box>

        <Box>
          <Heading size="md" mb={2}>Your Podcasts</Heading>
          {podcasts?.length === 0 && (
            <Text>You haven't created any podcasts yet.</Text>
          )}
          {podcasts?.map((podcast) => (
            <Box key={podcast._id} p={4} borderWidth={1} borderRadius="md" mb={2}>
              <Heading size="sm">{podcast.title}</Heading>
              <Text>{podcast.description}</Text>
              <Text fontSize="sm" color="gray.500">
                Status: {podcast.status}
              </Text>
            </Box>
          ))}
        </Box>
      </VStack>
    </Box>
  );
}
