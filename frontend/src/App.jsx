import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import MainNav from './components/MainNav';
import Home from './pages/Home';
import PodcastStudio from './pages/PodcastStudio';
import VideoStudio from './pages/VideoStudio';
import Profile from './pages/Profile';
import MyContent from './pages/MyContent';
import Settings from './pages/Settings';

function App() {
  return (
    <ChakraProvider>
      <Router future={{ v7_relativeSplatPath: true }}>
        <Box minH="100vh">
          <MainNav />
          <Box as="main" pt="16" px={4} maxW="7xl" mx="auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={<PodcastStudio />} />
              <Route path="/video-studio" element={<VideoStudio />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/my-content" element={<MyContent />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
