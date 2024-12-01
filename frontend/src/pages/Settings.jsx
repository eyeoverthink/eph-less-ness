import React from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Card,
  CardBody,
  SimpleGrid,
} from '@chakra-ui/react';

const Settings = () => {
  return (
    <Box p={4}>
      <Heading mb={6}>Settings</Heading>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={4}>General Settings</Heading>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">
                  Dark Mode
                </FormLabel>
                <Switch colorScheme="blue" />
              </FormControl>
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">
                  Notifications
                </FormLabel>
                <Switch colorScheme="blue" defaultChecked />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="md" mb={4}>Audio Settings</Heading>
              <FormControl>
                <FormLabel>Default Audio Quality</FormLabel>
                <Select defaultValue="high">
                  <option value="low">Low (128kbps)</option>
                  <option value="medium">Medium (256kbps)</option>
                  <option value="high">High (320kbps)</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Input Device</FormLabel>
                <Select>
                  <option value="default">System Default</option>
                </Select>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default Settings;
