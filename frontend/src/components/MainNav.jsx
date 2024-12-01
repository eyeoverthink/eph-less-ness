import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Button,
  useColorModeValue,
  Container,
  Text,
} from '@chakra-ui/react';
import { FaMicrophone, FaHome, FaUser, FaCog, FaVideo } from 'react-icons/fa';

const MainNav = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { name: 'Home', path: '/', icon: FaHome },
    { name: 'Podcast', path: '/studio', icon: FaMicrophone },
    { name: 'Video', path: '/video-studio', icon: FaVideo },
    { name: 'Profile', path: '/profile', icon: FaUser },
    { name: 'Settings', path: '/settings', icon: FaCog },
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      width="100%"
      zIndex="1000"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      shadow="sm"
    >
      <Container maxW="7xl">
        <Flex h="16" alignItems="center" justifyContent="space-between">
          <Text fontSize="xl" fontWeight="bold" color="blue.500">
            AI Podcast Studio
          </Text>

          <HStack spacing={4}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  leftIcon={<item.icon />}
                  variant={isActive(item.path) ? 'solid' : 'ghost'}
                  colorScheme={isActive(item.path) ? 'blue' : 'gray'}
                  size="md"
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default MainNav;
