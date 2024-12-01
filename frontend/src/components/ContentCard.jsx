import React, { useState } from 'react';
import {
  Box,
  Image,
  Text,
  HStack,
  VStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useColorModeValue,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import {
  FaPlay,
  FaEdit,
  FaTrash,
  FaEllipsisV,
} from 'react-icons/fa';

const ContentCard = ({
  content,
  onPlay,
  onEdit,
  onDelete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  const handlePlayClick = (e) => {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
    onPlay(content);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Box
      position="relative"
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      bg={bgColor}
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'lg'
      }}
    >
      {/* Thumbnail Container */}
      <Box position="relative" pb="56.25%">
        <Image
          position="absolute"
          top={0}
          left={0}
          w="100%"
          h="100%"
          src={content.thumbnailUrl || 'https://via.placeholder.com/400x200?text=No+Thumbnail'}
          alt={content.title}
          objectFit="cover"
          onClick={handlePlayClick}
          cursor="pointer"
        />
        
        {/* Overlay */}
        {!isPlaying && (
          <>
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.400"
              opacity={0}
              transition="opacity 0.2s"
              _groupHover={{ opacity: 1 }}
              onClick={handlePlayClick}
              _hover={{ cursor: 'pointer' }}
            />
            <IconButton
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              aria-label="Play"
              icon={<FaPlay />}
              size="lg"
              colorScheme="blue"
              onClick={handlePlayClick}
              opacity={0}
              _groupHover={{ opacity: 1 }}
            />
          </>
        )}
        <Badge
          position="absolute"
          bottom={2}
          right={2}
          colorScheme={content.type === 'podcast' ? 'purple' : 'red'}
        >
          {content.type}
        </Badge>
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme={content.status === 'published' ? 'green' : 'yellow'}
        >
          {content.status}
        </Badge>
      </Box>

      {/* Content */}
      <VStack p={4} align="stretch" spacing={3}>
        <Text fontSize="lg" fontWeight="bold" color={textColor} noOfLines={1}>
          {content.title}
        </Text>
        
        <Text fontSize="sm" color={mutedColor} noOfLines={2}>
          {content.description || 'No description available'}
        </Text>

        {/* Stats and Date */}
        <Flex align="center" justify="flex-end">
          <Text fontSize="sm" color={mutedColor}>
            {formatDate(content.createdAt)}
          </Text>
        </Flex>

        {/* Actions */}
        <HStack spacing={2} justify="space-between">
          <Tooltip label="Play">
            <IconButton
              aria-label="Play"
              icon={<FaPlay />}
              size="sm"
              variant="ghost"
              onClick={handlePlayClick}
              isDisabled={!content.audioUrl}
            />
          </Tooltip>
          
          <Menu>
            <MenuButton
              as={IconButton}
              aria-label="More options"
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem icon={<FaEdit />} onClick={() => onEdit(content)}>
                Edit
              </MenuItem>
              <MenuItem icon={<FaTrash />} onClick={() => onDelete(content)} color="red.500">
                Delete
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ContentCard;
