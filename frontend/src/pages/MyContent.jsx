import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  VStack,
  Text,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { FiSearch } from 'react-icons/fi';
import ContentCard from '../components/ContentCard';
import api from '../services/axiosConfig';

const MyContent = () => {
  const [content, setContent] = useState({ podcasts: [], videos: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedContent, setSelectedContent] = useState(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useUser();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch podcasts
      const podcastsResponse = await api.get('/podcasts/user');
      const podcasts = podcastsResponse.data.podcasts || [];

      // Fetch videos (when implemented)
      // const videosResponse = await api.get('/videos/user');
      // const videos = videosResponse.data.videos || [];
      const videos = []; // Temporary until video API is implemented

      setContent({ podcasts, videos });
    } catch (error) {
      console.error('Error fetching content:', error);
      setError('Failed to load your content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (content) => {
    setSelectedContent(content);
    setIsPlayerOpen(true);
  };

  const handleEdit = (content) => {
    navigate(content.type === 'podcast' ? '/studio' : '/video-studio', {
      state: { content }
    });
  };

  const handleDelete = async (contentToDelete) => {
    try {
      // Delete from backend
      await api.delete(`/${contentToDelete.type}s/${contentToDelete._id}`);

      toast({
        title: 'Content deleted',
        description: `Successfully deleted ${contentToDelete.title}`,
        status: 'success',
        duration: 3000
      });
      
      // Refresh content
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete content',
        status: 'error',
        duration: 3000
      });
    }
  };

  const filteredContent = (type) => {
    return content[type].filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading>My Content</Heading>

        <HStack spacing={4}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Select
            maxW="200px"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </Select>
        </HStack>

        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>Podcasts ({content.podcasts.length})</Tab>
            <Tab>Videos ({content.videos.length})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              {filteredContent('podcasts').length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredContent('podcasts').map((podcast) => (
                    <ContentCard
                      key={podcast._id}
                      content={{ ...podcast, type: 'podcast' }}
                      onPlay={handlePlay}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text>No podcasts found</Text>
                </Box>
              )}
            </TabPanel>

            <TabPanel>
              {filteredContent('videos').length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {filteredContent('videos').map((video) => (
                    <ContentCard
                      key={video._id}
                      content={{ ...video, type: 'video' }}
                      onPlay={handlePlay}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <Box textAlign="center" py={10}>
                  <Text>No videos found</Text>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Content Player Modal */}
      <Modal isOpen={isPlayerOpen} onClose={() => setIsPlayerOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody p={6}>
            {selectedContent?.type === 'podcast' ? (
              <audio
                controls
                style={{ width: '100%' }}
                src={selectedContent.audioUrl}
              >
                Your browser does not support the audio element.
              </audio>
            ) : (
              <video
                controls
                style={{ width: '100%' }}
                src={selectedContent?.url}
              >
                Your browser does not support the video element.
              </video>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MyContent;
