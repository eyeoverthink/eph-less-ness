import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  RadioGroup,
  Radio,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  CheckboxGroup,
  Grid,
  GridItem,
  Tooltip,
  useColorModeValue,
  Heading,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { FaPlay, FaPause, FaUpload, FaMusic, FaMagic, FaRobot, FaImage, FaVideo } from 'react-icons/fa';
import { DownloadIcon } from '@chakra-ui/icons';
import { getVoices, generateSpeech } from '../services/elevenLabsService';
import openaiService from '../services/openaiService';
import videoService from '../services/videoService';
import axios from 'axios';
import MediaPlayer from '../components/MediaPlayer';
import mubertService from '../services/mubertService';
import contentSuggestionService from '../services/contentSuggestionService';

const PodcastStudio = () => {
  const [topic, setTopic] = useState('');
  const [script, setScript] = useState('');
  const [title, setTitle] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [backgroundMusic, setBackgroundMusic] = useState(null);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewAudio, setPreviewAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voices, setVoices] = useState([]);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState(null);
  const [scriptStyle, setScriptStyle] = useState('conversational');
  const [scriptLength, setScriptLength] = useState('medium');
  const [scriptOptions, setScriptOptions] = useState({
    style: 'conversational',
    length: 'medium',
    format: 'dialogue',
    tone: 'friendly',
    targetAudience: 'general',
    includeSegments: ['intro', 'main', 'outro'],
    structureType: 'narrative'
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [videoDemo, setVideoDemo] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [musicSettings, setMusicSettings] = useState({
    mood: 'calm',
    genre: 'ambient',
    duration: 60
  });
  const [contentSuggestions, setContentSuggestions] = useState({
    topics: [],
    keywords: null,
    audience: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    // Fetch available voices when component mounts
    const loadVoices = async () => {
      try {
        const availableVoices = await getVoices();
        setVoices(availableVoices);
      } catch (error) {
        toast({
          title: 'Error loading voices',
          description: error.message,
          status: 'error',
          duration: 5000,
        });
      }
    };
    loadVoices();
  }, []);

  useEffect(() => {
    // Set up Rick Roll demo video
    setVideoDemo(videoService.getDefaultVideo());
  }, []);

  const handleScriptChange = (e) => {
    setScript(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleVoiceChange = (e) => {
    setSelectedVoice(e.target.value);
  };

  const handleMusicUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackgroundMusic(file);
      toast({
        title: 'Music uploaded',
        description: file.name,
        status: 'success',
        duration: 3000,
      });
    }
  };

  const handlePreview = async () => {
    if (!script || !selectedVoice) {
      toast({
        title: 'Missing requirements',
        description: 'Please enter a script and select a voice',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Generate speech from text
      const audioUrl = await generateSpeech(script, selectedVoice);
      
      // Create audio context for mixing if there's background music
      if (backgroundMusic) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Load voice audio
        const voiceResponse = await fetch(audioUrl);
        const voiceArrayBuffer = await voiceResponse.arrayBuffer();
        const voiceAudioBuffer = await audioContext.decodeAudioData(voiceArrayBuffer);
        
        // Load background music
        const musicArrayBuffer = await backgroundMusic.arrayBuffer();
        const musicAudioBuffer = await audioContext.decodeAudioData(musicArrayBuffer);
        
        // Create buffers and connect nodes
        const voiceSource = audioContext.createBufferSource();
        const musicSource = audioContext.createBufferSource();
        const voiceGain = audioContext.createGain();
        const musicGain = audioContext.createGain();
        
        voiceSource.buffer = voiceAudioBuffer;
        musicSource.buffer = musicAudioBuffer;
        
        // Set volumes
        voiceGain.gain.value = 1.0;
        musicGain.gain.value = musicVolume;
        
        // Connect nodes
        voiceSource.connect(voiceGain);
        musicSource.connect(musicGain);
        voiceGain.connect(audioContext.destination);
        musicGain.connect(audioContext.destination);
        
        // Start playback
        voiceSource.start();
        musicSource.start();
        
        // Create a MediaRecorder to capture the mixed audio
        const mixedStream = audioContext.createMediaStreamDestination();
        voiceGain.connect(mixedStream);
        musicGain.connect(mixedStream);
        
        const mediaRecorder = new MediaRecorder(mixedStream.stream);
        const chunks = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/wav' });
          const mixedUrl = URL.createObjectURL(blob);
          setPreviewAudio(mixedUrl);
        };
        
        mediaRecorder.start();
        
        // Record for the duration of the voice audio
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, voiceAudioBuffer.duration * 1000);
      } else {
        // If no background music, just use the generated speech directly
        setPreviewAudio(audioUrl);
      }
      
      setGeneratedAudioUrl(audioUrl);
      toast({
        title: 'Preview ready',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Preview generation failed',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!script || !selectedVoice || !title) {
      toast({
        title: 'Missing requirements',
        description: 'Please enter a title, script and select a voice',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('sourceText', script);
      formData.append('voiceId', selectedVoice);
      if (backgroundMusic) {
        formData.append('backgroundMusic', backgroundMusic);
      }
      formData.append('musicVolume', musicVolume);

      // Send to backend
      const response = await axios.post('/api/podcasts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(progress);
        },
      });

      toast({
        title: 'Podcast created successfully',
        description: 'Your podcast has been created and saved',
        status: 'success',
        duration: 3000,
      });

      // Reset form
      setScript('');
      setTitle('');
      setSelectedVoice('');
      setBackgroundMusic(null);
      setGeneratedAudioUrl(null);
      setPreviewAudio(null);
    } catch (error) {
      toast({
        title: 'Failed to create podcast',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleGenerateScript = async () => {
    if (!topic) {
      toast({
        title: 'Topic Required',
        description: 'Please enter a topic for your podcast',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedScript = await openaiService.generatePodcastScript(topic, scriptOptions);
      setScript(generatedScript);
      
      // Generate a title based on the script
      const titleResponse = await openaiService.generatePodcastScript(
        `Create a catchy, SEO-friendly title for this podcast script: ${generatedScript.substring(0, 200)}...`,
        { style: 'professional', length: 'short' }
      );
      setTitle(titleResponse.split('\n')[0]);

      toast({
        title: 'Script Generated',
        description: 'Your podcast script has been generated successfully!',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Generation Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!title && !topic) {
      toast({
        title: 'Input Required',
        description: 'Please generate a script first or enter a topic',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsGeneratingThumbnail(true);
    try {
      const thumbnailUrl = await videoService.generateThumbnail(title || topic);
      setThumbnail(thumbnailUrl);
      toast({
        title: 'Thumbnail Generated',
        description: 'Your podcast thumbnail has been generated successfully!',
        status: 'success',
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: 'Thumbnail Generation Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const generateBackgroundMusic = async () => {
    try {
      setIsGenerating(true);
      const musicUrl = await mubertService.generateMusicTrack(musicSettings);
      setGeneratedMusic(musicUrl);
      
      toast({
        title: 'Music Generated',
        description: 'Background music has been generated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate background music: ' + error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateContentSuggestions = async () => {
    try {
      setIsGenerating(true);
      const [topics, keywords, audience] = await Promise.all([
        contentSuggestionService.generateTopicSuggestions(script),
        contentSuggestionService.getKeywordOptimization(script),
        contentSuggestionService.analyzeAudienceTarget(script)
      ]);
      
      setContentSuggestions({
        topics,
        keywords,
        audience
      });
      
      toast({
        title: 'Content Analysis Complete',
        description: 'AI suggestions have been generated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate content suggestions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePodcast = async () => {
    if (!title || !script) {
      toast({
        title: 'Missing requirements',
        description: 'Please provide a title and script',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    try {
      setIsSaving(true);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('script', script);
      if (backgroundMusic) {
        formData.append('backgroundMusic', backgroundMusic);
      }
      if (thumbnail) {
        formData.append('thumbnail', thumbnail);
      }

      // Save to backend
      const response = await axios.post('/api/podcasts/save', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Podcast saved!',
        description: 'Your podcast has been saved successfully',
        status: 'success',
        duration: 5000,
      });

      // Clear form or redirect to podcast list
      // setTitle('');
      // setScript('');
      // setBackgroundMusic(null);
      // setThumbnail(null);
      
    } catch (error) {
      console.error('Error saving podcast:', error);
      toast({
        title: 'Error saving podcast',
        description: error.message || 'Failed to save podcast',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <Tabs isFitted variant="enclosed">
        <TabList>
          <Tab>Content</Tab>
          <Tab>Style</Tab>
          <Tab>Media</Tab>
          <Tab>AI Assistant</Tab>
          <Tab>Preview</Tab>
        </TabList>

        <TabPanels>
          {/* Content Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Podcast Topic</FormLabel>
                <HStack>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter your podcast topic..."
                    flex="1"
                  />
                  <Button
                    leftIcon={<FaRobot />}
                    colorScheme="blue"
                    onClick={handleGenerateScript}
                    isLoading={isGenerating}
                    loadingText="Generating"
                  >
                    Generate Script
                  </Button>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Script</FormLabel>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Your podcast script will appear here..."
                  minH="300px"
                  resize="vertical"
                />
              </FormControl>
            </VStack>
          </TabPanel>

          {/* Style Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <FormControl>
                  <FormLabel>Format</FormLabel>
                  <RadioGroup
                    value={scriptOptions.format}
                    onChange={(value) => setScriptOptions({ ...scriptOptions, format: value })}
                  >
                    <Stack>
                      <Radio value="dialogue">Dialogue</Radio>
                      <Radio value="monologue">Monologue</Radio>
                      <Radio value="interview">Interview</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Structure</FormLabel>
                  <RadioGroup
                    value={scriptOptions.structureType}
                    onChange={(value) => setScriptOptions({ ...scriptOptions, structureType: value })}
                  >
                    <Stack>
                      <Radio value="narrative">Narrative</Radio>
                      <Radio value="educational">Educational</Radio>
                      <Radio value="debate">Debate</Radio>
                      <Radio value="entertainment">Entertainment</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Tone</FormLabel>
                  <RadioGroup
                    value={scriptOptions.tone}
                    onChange={(value) => setScriptOptions({ ...scriptOptions, tone: value })}
                  >
                    <Stack>
                      <Radio value="friendly">Friendly</Radio>
                      <Radio value="professional">Professional</Radio>
                      <Radio value="casual">Casual</Radio>
                      <Radio value="humorous">Humorous</Radio>
                    </Stack>
                  </RadioGroup>
                </FormControl>
              </GridItem>

              <GridItem>
                <FormControl>
                  <FormLabel>Segments</FormLabel>
                  <CheckboxGroup
                    value={scriptOptions.includeSegments}
                    onChange={(value) => setScriptOptions({ ...scriptOptions, includeSegments: value })}
                  >
                    <Stack>
                      <Checkbox value="intro">Intro</Checkbox>
                      <Checkbox value="main">Main Content</Checkbox>
                      <Checkbox value="outro">Outro</Checkbox>
                      <Checkbox value="ads">Ad Spots</Checkbox>
                    </Stack>
                  </CheckboxGroup>
                </FormControl>
              </GridItem>
            </Grid>
          </TabPanel>

          {/* Media Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              {/* Thumbnail Section */}
              <Box p={4} borderWidth="1px" borderRadius="lg" bg={bgColor}>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="bold">Podcast Thumbnail</Text>
                    <Button
                      leftIcon={<FaImage />}
                      colorScheme="teal"
                      onClick={handleGenerateThumbnail}
                      isLoading={isGeneratingThumbnail}
                      size="sm"
                    >
                      Generate Thumbnail
                    </Button>
                  </HStack>
                  {thumbnail && (
                    <Image
                      src={thumbnail}
                      alt="Generated thumbnail"
                      borderRadius="md"
                      maxH="200px"
                      objectFit="cover"
                    />
                  )}
                </VStack>
              </Box>

              {/* Video Demo Section */}
              {videoDemo && (
                <Box p={4} borderWidth="1px" borderRadius="lg" bg={bgColor}>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="bold">Video Preview</Text>
                      <Button
                        leftIcon={<FaVideo />}
                        colorScheme="purple"
                        onClick={() => window.open(videoDemo.url, '_blank')}
                        size="sm"
                      >
                        Watch Demo
                      </Button>
                    </HStack>
                    <Image
                      src={videoDemo.thumbnail}
                      alt="Video thumbnail"
                      borderRadius="md"
                      maxH="200px"
                      objectFit="cover"
                      cursor="pointer"
                      onClick={() => window.open(videoDemo.url, '_blank')}
                    />
                  </VStack>
                </Box>
              )}
            </VStack>
          </TabPanel>

          {/* AI Assistant Tab */}
          <TabPanel>
            <VStack spacing={6}>
              <Card w="full">
                <CardHeader>
                  <Heading size="md">AI Music Generation</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Mood</FormLabel>
                      <Select
                        value={musicSettings.mood}
                        onChange={(e) => setMusicSettings({...musicSettings, mood: e.target.value})}
                      >
                        <option value="calm">Calm</option>
                        <option value="energetic">Energetic</option>
                        <option value="mysterious">Mysterious</option>
                        <option value="happy">Happy</option>
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Genre</FormLabel>
                      <Select
                        value={musicSettings.genre}
                        onChange={(e) => setMusicSettings({...musicSettings, genre: e.target.value})}
                      >
                        <option value="ambient">Ambient</option>
                        <option value="electronic">Electronic</option>
                        <option value="acoustic">Acoustic</option>
                        <option value="cinematic">Cinematic</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Duration (seconds)</FormLabel>
                      <Slider
                        value={musicSettings.duration}
                        onChange={(val) => setMusicSettings({...musicSettings, duration: val})}
                        min={30}
                        max={180}
                        step={30}
                      >
                        <SliderTrack>
                          <SliderFilledTrack />
                        </SliderTrack>
                        <SliderThumb />
                      </Slider>
                      <Text textAlign="right">{musicSettings.duration}s</Text>
                    </FormControl>

                    <Button
                      colorScheme="blue"
                      onClick={generateBackgroundMusic}
                      isLoading={isGenerating}
                      loadingText="Generating"
                      w="full"
                    >
                      Generate Background Music
                    </Button>

                    {generatedMusic && (
                      <Box w="full">
                        <audio controls src={generatedMusic} style={{ width: '100%' }} />
                        <Button
                          size="sm"
                          leftIcon={<DownloadIcon />}
                          onClick={() => window.open(generatedMusic, '_blank')}
                          mt={2}
                          w="full"
                          variant="outline"
                        >
                          Download Music
                        </Button>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              <Card w="full">
                <CardHeader>
                  <Heading size="md">Content Suggestions</Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Button
                      colorScheme="green"
                      onClick={generateContentSuggestions}
                      isLoading={isGenerating}
                      loadingText="Analyzing"
                    >
                      Analyze Content
                    </Button>

                    {contentSuggestions.topics.length > 0 && (
                      <VStack spacing={4} align="stretch">
                        <Box>
                          <Heading size="sm" mb={2}>Related Topics</Heading>
                          {contentSuggestions.topics.map((topic, index) => (
                            <Box key={index} p={2} bg="gray.50" borderRadius="md" mb={2}>
                              <Text fontWeight="bold">{topic.title}</Text>
                              <Text fontSize="sm">{topic.details}</Text>
                            </Box>
                          ))}
                        </Box>

                        {contentSuggestions.keywords && (
                          <Box>
                            <Heading size="sm" mb={2}>SEO Keywords</Heading>
                            <Text><strong>Primary:</strong> {contentSuggestions.keywords.primary.join(', ')}</Text>
                            <Text mt={2}><strong>Secondary:</strong> {contentSuggestions.keywords.secondary.join(', ')}</Text>
                          </Box>
                        )}

                        {contentSuggestions.audience && (
                          <Box>
                            <Heading size="sm" mb={2}>Audience Analysis</Heading>
                            <Text><strong>Demographics:</strong> {contentSuggestions.audience.demographics.join(', ')}</Text>
                            <Text mt={2}><strong>Recommended Platforms:</strong> {contentSuggestions.audience.platforms.join(', ')}</Text>
                          </Box>
                        )}
                      </VStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </TabPanel>

          {/* Preview Tab */}
          <TabPanel>
            {/* Existing audio preview content */}
            <FormControl>
              <FormLabel>Podcast Title</FormLabel>
              <Input
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter podcast title"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Select Voice</FormLabel>
              <Select
                value={selectedVoice}
                onChange={handleVoiceChange}
                placeholder="Choose a voice"
              >
                {voices.map((voice) => (
                  <option key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Background Music (Optional)</FormLabel>
              <HStack>
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleMusicUpload}
                  display="none"
                  id="music-upload"
                />
                <Button
                  as="label"
                  htmlFor="music-upload"
                  leftIcon={<FaUpload />}
                  cursor="pointer"
                >
                  Upload Music
                </Button>
                {backgroundMusic && (
                  <Text fontSize="sm" color="gray.600">
                    {backgroundMusic.name}
                  </Text>
                )}
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel>Background Music Volume</FormLabel>
              <HStack spacing={4}>
                <IconButton
                  icon={<FaMusic />}
                  size="sm"
                  variant="ghost"
                />
                <Slider
                  value={musicVolume * 100}
                  onChange={(v) => setMusicVolume(v / 100)}
                  min={0}
                  max={100}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </HStack>
            </FormControl>

            <Box>
              {previewAudio && (
                <MediaPlayer
                  url={previewAudio}
                  title="Preview"
                  thumbnail="https://via.placeholder.com/150"
                />
              )}
            </Box>

            <Box>
              {isProcessing && (
                <Box>
                  <Text mb={2}>Processing... {progress}%</Text>
                  <Progress value={progress} size="sm" colorScheme="blue" />
                </Box>
              )}
            </Box>

            <HStack spacing={4} justify="flex-end">
              <Button
                onClick={handlePreview}
                isDisabled={!script || !selectedVoice || isProcessing}
                colorScheme="blue"
                variant="outline"
              >
                Generate Preview
              </Button>
              <Button
                onClick={handleCreate}
                isDisabled={!script || !selectedVoice || !title || isProcessing}
                colorScheme="blue"
              >
                Create Podcast
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSavePodcast}
                isLoading={isSaving}
                loadingText="Saving..."
                ml={4}
              >
                Save Podcast
              </Button>
            </HStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PodcastStudio;
