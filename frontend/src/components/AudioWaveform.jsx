import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Box } from '@chakra-ui/react';

const AudioWaveform = ({ audioUrl, onReady, height = '128px', waveColor = '#3182ce', progressColor = '#63b3ed' }) => {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);

  useEffect(() => {
    if (!audioUrl) return;

    // Create WaveSurfer instance
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      height: parseInt(height),
      normalize: true,
      responsive: true,
      cursorWidth: 1,
      cursorColor: '#718096',
      barWidth: 2,
      barGap: 1,
      barRadius: 3,
      plugins: []
    });

    // Load audio file
    ws.load(audioUrl);

    // Add event listeners
    ws.on('ready', () => {
      if (onReady) onReady(ws);
    });

    ws.on('error', (err) => {
      console.error('WaveSurfer error:', err);
    });

    // Store wavesurfer instance
    wavesurfer.current = ws;

    // Cleanup
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [audioUrl]);

  return (
    <Box
      ref={waveformRef}
      w="100%"
      h={height}
      bg="gray.50"
      borderRadius="md"
      overflow="hidden"
    />
  );
};

export default AudioWaveform;
