import { Link } from 'react-router-dom';
import { 
  Button, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Box, 
  Container,
  SimpleGrid,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaMicrophone, FaVideo, FaRobot, FaMusic, FaBrain } from 'react-icons/fa';
import { SignIn, SignOutButton, useUser } from "@clerk/clerk-react";

const Feature = ({ icon, title, text }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      shadow="md"
      height="full"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Text fontWeight="bold" fontSize="xl">{title}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>{text}</Text>
    </VStack>
  );
};

const Home = () => {
  const { isSignedIn, user } = useUser();
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.400, purple.500)',
    'linear(to-r, blue.200, purple.300)'
  );

  if (!isSignedIn) {
    return (
      <Container maxW="xl" centerContent py={20}>
        <VStack spacing={8}>
          <Heading textAlign="center">Welcome to AI Podcast Studio</Heading>
          <Text textAlign="center">Please sign in to start creating amazing content</Text>
          <SignIn />
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="7xl" py={20}>
      <VStack spacing={12} align="stretch">
        <VStack spacing={4} textAlign="center">
          <Heading 
            size="2xl" 
            bgGradient={bgGradient}
            bgClip="text"
          >
            Welcome back, {user.firstName || 'Creator'}!
          </Heading>
          
          <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.300')}>
            Create professional podcasts and videos with our advanced AI suite
          </Text>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          <Feature
            icon={FaRobot}
            title="Studio-D AI"
            text="Advanced AI assistant for content creation and editing"
          />
          <Feature
            icon={FaBrain}
            title="OpenAI Integration"
            text="Powered by GPT-4 for intelligent content suggestions"
          />
          <Feature
            icon={FaMusic}
            title="Mubert Integration"
            text="AI-generated music and sound effects"
          />
        </SimpleGrid>

        <HStack spacing={6} justify="center">
          <Link to="/studio">
            <Button
              size="lg"
              leftIcon={<FaMicrophone />}
              colorScheme="blue"
              variant="solid"
            >
              Create Podcast
            </Button>
          </Link>
          
          <Link to="/video-studio">
            <Button
              size="lg"
              leftIcon={<FaVideo />}
              colorScheme="purple"
              variant="solid"
            >
              Create Video
            </Button>
          </Link>
        </HStack>

        <Box textAlign="center">
          <SignOutButton>
            <Button variant="ghost" colorScheme="gray">
              Sign Out
            </Button>
          </SignOutButton>
        </Box>
      </VStack>
    </Container>
  );
};

export default Home;
