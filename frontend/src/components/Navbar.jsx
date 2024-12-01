import { Link, useLocation } from 'react-router-dom';
import { SignInButton, SignOutButton, useUser } from '@clerk/clerk-react';
import {
  Box,
  Flex,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Tooltip
} from '@chakra-ui/react';
import {
  FaMicrophone,
  FaVideo,
  FaUser,
  FaRobot,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
  FaCog,
  FaFolder,
  FaSignOutAlt,
  FaPlus
} from 'react-icons/fa';

const Navbar = () => {
  const { isSignedIn, user } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const activeColor = useColorModeValue('blue.500', 'blue.300');

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = isActivePath(to);
    return (
      <Link to={to}>
        <HStack
          px={4}
          py={2}
          spacing={2}
          rounded="md"
          color={isActive ? activeColor : textColor}
          bg={isActive ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700'),
            color: activeColor
          }}
          transition="all 0.2s"
          position="relative"
          role="group"
        >
          <Icon />
          <Text fontWeight={isActive ? "semibold" : "normal"}>{children}</Text>
          {to === '/podcast-studio' && <Badge colorScheme="green">New</Badge>}
          {isActive && (
            <Box
              position="absolute"
              bottom="-1px"
              left="0"
              right="0"
              height="2px"
              bg={activeColor}
              borderRadius="full"
            />
          )}
        </HStack>
      </Link>
    );
  };

  const MobileNavLink = ({ to, icon: Icon, children, onClick }) => {
    const isActive = isActivePath(to);
    return (
      <Link to={to} onClick={onClick}>
        <HStack
          px={4}
          py={3}
          spacing={3}
          color={isActive ? activeColor : textColor}
          bg={isActive ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700')
          }}
          position="relative"
        >
          <Icon size={20} />
          <Text fontSize="md" fontWeight={isActive ? "semibold" : "normal"}>{children}</Text>
          {to === '/podcast-studio' && <Badge colorScheme="green">New</Badge>}
          {isActive && (
            <Box
              position="absolute"
              left="0"
              top="0"
              bottom="0"
              width="2px"
              bg={activeColor}
              borderRadius="full"
            />
          )}
        </HStack>
      </Link>
    );
  };

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
    >
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1400px" mx="auto">
        {/* Logo */}
        <Link to="/">
          <HStack spacing={2}>
            <FaRobot size={24} color={useColorModeValue('#3182CE', '#63B3ED')} />
            <Text fontSize="xl" fontWeight="bold" color={textColor}>
              <Text as="span" color={activeColor}>AI</Text>
              Studio
            </Text>
          </HStack>
        </Link>

        {/* Desktop Navigation */}
        <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
          <NavLink to="/podcast-studio" icon={FaMicrophone}>Podcast Studio</NavLink>
          <NavLink to="/video-studio" icon={FaVideo}>Video Studio</NavLink>
          <NavLink to="/my-content" icon={FaFolder}>My Content</NavLink>
        </HStack>

        {/* Right Section */}
        <HStack spacing={4}>
          {/* Color Mode Toggle */}
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />

          {/* User Menu */}
          {isSignedIn ? (
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                rightIcon={<FaUser />}
              >
                <HStack>
                  <Avatar size="sm" src={user.profileImageUrl} name={user.fullName} />
                  <Text display={{ base: 'none', md: 'block' }}>{user.fullName}</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FaUser />}>Profile</MenuItem>
                <MenuItem icon={<FaCog />}>Settings</MenuItem>
                <MenuItem icon={<FaSignOutAlt />} onClick={() => SignOutButton()}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <SignInButton>
              <Button colorScheme="blue" size="sm">Sign In</Button>
            </SignInButton>
          )}

          {/* Mobile Menu Button */}
          <IconButton
            display={{ base: 'flex', md: 'none' }}
            aria-label="Open menu"
            icon={<FaBars />}
            onClick={onOpen}
            variant="ghost"
          />
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            <HStack spacing={2}>
              <FaRobot size={20} color={useColorModeValue('#3182CE', '#63B3ED')} />
              <Text>
                <Text as="span" color={activeColor}>AI</Text>
                Studio
              </Text>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            <VStack align="stretch" spacing={2}>
              <MobileNavLink to="/podcast-studio" icon={FaMicrophone} onClick={onClose}>
                Podcast Studio
              </MobileNavLink>
              <MobileNavLink to="/video-studio" icon={FaVideo} onClick={onClose}>
                Video Studio
              </MobileNavLink>
              <MobileNavLink to="/my-content" icon={FaFolder} onClick={onClose}>
                My Content
              </MobileNavLink>

              {isSignedIn && (
                <>
                  <Box py={4}>
                    <Flex align="center" p={2} rounded="md" bg={useColorModeValue('gray.50', 'gray.700')}>
                      <Avatar size="sm" src={user.profileImageUrl} name={user.fullName} />
                      <Box ml={3}>
                        <Text fontWeight="medium">{user.fullName}</Text>
                        <Text fontSize="sm" color="gray.500">{user.primaryEmailAddress?.emailAddress}</Text>
                      </Box>
                    </Flex>
                  </Box>
                  <Button
                    leftIcon={<FaSignOutAlt />}
                    variant="ghost"
                    w="full"
                    justifyContent="flex-start"
                    onClick={() => SignOutButton()}
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Navbar;
