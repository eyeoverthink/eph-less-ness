import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Textarea,
  Select,
  Progress,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Card,
  CardBody,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaUpload, FaVideo, FaImage, FaMagic } from 'react-icons/fa';
import openaiService from '../services/openaiService';
import videoService from '../services/videoService';
import mubertService from '../services/mubertService';
import MediaPlayer from '../components/MediaPlayer';

export default function VideoStudio() {
  // State management following documented pattern
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [scriptOptions, setScriptOptions] = useState({
    style: 'engaging',
    format: 'tutorial',
    tone: 'professional',
    targetAudience: 'general',
    structureType: 'educational'
  });

  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Handle script generation
  const generateScript = async () => {
    if (!title) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your video',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsProcessing(true);
      const generatedScript = await openaiService.generateVideoScript({
        title,
        ...scriptOptions
      });
      setScript(generatedScript);
      toast({
        title: 'Script Generated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error Generating Script',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle thumbnail generation
  const generateThumbnail = async () => {
    if (!title) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for thumbnail generation',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsGeneratingThumbnail(true);
      const thumbnailUrl = await openaiService.generateThumbnail(title);
      setThumbnail(thumbnailUrl);
      toast({
        title: 'Thumbnail Generated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error Generating Thumbnail',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      toast({
        title: 'Video Uploaded',
        description: file.name,
        status: 'success',
        duration: 3000,
      });
    }
  };

  // Handle background music
  const handleMusicUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBackgroundMusic(file);
      toast({
        title: 'Music Uploaded',
        description: file.name,
        status: 'success',
        duration: 3000,
      });
    }
  };

  return (
    <Box maxW="container.xl" mx="auto" p={4}>
      <VStack spacing={6} align="stretch">
        <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>Content</Tab>
                <Tab>Style</Tab>
                <Tab>Media</Tab>
                <Tab>Preview</Tab>
              </TabList>

              <TabPanels>
                {/* Content Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Video Title</FormLabel>
                      <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your video title"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Script</FormLabel>
                      <Textarea
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        placeholder="Enter or generate your video script"
                        minH="200px"
                      />
                    </FormControl>

                    <Button
                      leftIcon={<FaMagic />}
                      onClick={generateScript}
                      isLoading={isProcessing}
                      colorScheme="blue"
                    >
                      Generate Script
                    </Button>
                  </VStack>
                </TabPanel>

                {/* Style Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Video Style</FormLabel>
                      <Select
                        value={scriptOptions.style}
                        onChange={(e) => setScriptOptions({...scriptOptions, style: e.target.value})}
                      >
                        <option value="engaging">Engaging</option>
                        <option value="educational">Educational</option>
                        <option value="entertaining">Entertaining</option>
                        <option value="professional">Professional</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Video Format</FormLabel>
                      <Select
                        value={scriptOptions.format}
                        onChange={(e) => setScriptOptions({...scriptOptions, format: e.target.value})}
                      >
                        <option value="tutorial">Tutorial</option>
                        <option value="vlog">Vlog</option>
                        <option value="presentation">Presentation</option>
                        <option value="interview">Interview</option>
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Media Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Upload Video</FormLabel>
                      <Input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Thumbnail</FormLabel>
                      {thumbnail && (
                        <Image src={thumbnail} alt="Video thumbnail" mb={2} />
                      )}
                      <Button
                        leftIcon={<FaImage />}
                        onClick={generateThumbnail}
                        isLoading={isGeneratingThumbnail}
                        colorScheme="green"
                        mb={2}
                      >
                        Generate Thumbnail
                      </Button>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Background Music</FormLabel>
                      <Input
                        type="file"
                        accept="audio/*"
                        onChange={handleMusicUpload}
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Preview Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    {videoFile && (
                      <Box>
                        <Heading size="md" mb={2}>Video Preview</Heading>
                        <MediaPlayer
                          src={URL.createObjectURL(videoFile)}
                          type="video"
                        />
                      </Box>
                    )}

                    {backgroundMusic && (
                      <Box>
                        <Heading size="md" mb={2}>Background Music Preview</Heading>
                        <MediaPlayer
                          src={URL.createObjectURL(backgroundMusic)}
                          type="audio"
                        />
                      </Box>
                    )}

                    {!videoFile && !backgroundMusic && (
                      <Text>Upload media in the Media tab to preview it here</Text>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {isProcessing && (
          <Progress value={progress} size="sm" colorScheme="blue" />
        )}
      </VStack>
    </Box>
  );
}
