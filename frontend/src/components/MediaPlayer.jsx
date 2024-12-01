import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  VStack,
  Text,
  Image,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaCompress,
  FaStepForward,
  FaStepBackward
} from 'react-icons/fa';
import AudioWaveform from './AudioWaveform';

const MediaPlayer = ({ url, title, thumbnail, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef(null);
  const waveformRef = useRef(null);
  const containerRef = useRef(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    
    // Sync waveform playback
    if (waveformRef.current) {
      waveformRef.current.playPause();
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
    
    // Sync waveform progress
    if (waveformRef.current) {
      waveformRef.current.seekTo(audioRef.current.currentTime / audioRef.current.duration);
    }
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    setIsMuted(value === 0);
  };

  const handleSeek = (value) => {
    const time = value * duration;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
    
    // Sync waveform position
    if (waveformRef.current) {
      waveformRef.current.seekTo(value);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(1);
      setIsMuted(false);
    } else {
      setVolume(0);
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleWaveformReady = (wavesurfer) => {
    waveformRef.current = wavesurfer;
    
    // Sync initial state
    if (isPlaying) {
      wavesurfer.play();
    }
    
    // Add waveform click handler
    wavesurfer.on('interaction', () => {
      const progress = wavesurfer.getCurrentTime() / wavesurfer.getDuration();
      handleSeek(progress);
    });
  };

  return (
    <Box
      ref={containerRef}
      p={4}
      borderRadius="lg"
      bg={bgColor}
      boxShadow="md"
      width="100%"
    >
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <Image
            src={thumbnail || 'https://via.placeholder.com/150'}
            alt={title}
            boxSize="60px"
            objectFit="cover"
            borderRadius="md"
          />
          <VStack align="start" flex={1}>
            <Text fontWeight="bold" color={textColor}>
              {title || 'Untitled'}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </VStack>
        </HStack>

        <AudioWaveform
          audioUrl={url}
          onReady={handleWaveformReady}
          height="64px"
        />

        <audio
          ref={audioRef}
          src={url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onEnded}
        />

        <HStack spacing={4}>
          <IconButton
            aria-label="Previous 10 seconds"
            icon={<FaStepBackward />}
            onClick={() => {
              audioRef.current.currentTime -= 10;
              handleTimeUpdate();
            }}
          />
          
          <IconButton
            aria-label={isPlaying ? 'Pause' : 'Play'}
            icon={isPlaying ? <FaPause /> : <FaPlay />}
            onClick={togglePlay}
          />
          
          <IconButton
            aria-label="Next 10 seconds"
            icon={<FaStepForward />}
            onClick={() => {
              audioRef.current.currentTime += 10;
              handleTimeUpdate();
            }}
          />

          <HStack flex={1} spacing={2}>
            <IconButton
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              onClick={toggleMute}
            />
            <Slider
              aria-label="Volume"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              width="100px"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </HStack>

          <IconButton
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            icon={isFullscreen ? <FaCompress /> : <FaExpand />}
            onClick={toggleFullscreen}
          />
        </HStack>
      </VStack>
    </Box>
  );
};

export default MediaPlayer;
