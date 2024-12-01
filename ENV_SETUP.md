# Environment Setup Guide

## Setting up environment variables

This project uses environment variables to manage configuration. Follow these steps to set up your environment:

### Backend Setup

1. Navigate to the `backend` directory
2. Copy the template file:
   ```bash
   cp templates/env.template .env
   ```
3. Edit `.env` and replace the placeholder values with your actual configuration:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PORT`: The port number for the backend server (default: 3001)
   - `NODE_ENV`: Your environment (development/production)
   - Add any other required configuration variables

### Frontend Setup

1. Navigate to the `frontend` directory
2. Copy the template file:
   ```bash
   cp templates/env.template .env
   ```
3. Edit `.env` and replace the placeholder values with your actual configuration:
   - `REACT_APP_API_URL`: URL of your backend API
   - `REACT_APP_OPENAI_API_KEY`: Your OpenAI API key
   - Add any other required configuration variables

## Security Notes

- Never commit `.env` files to the repository
- Keep your API keys and secrets secure
- Regularly rotate your API keys
- Use different API keys for development and production environments
