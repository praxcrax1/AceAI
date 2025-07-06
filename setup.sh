#!/bin/bash

# AceAI Setup and Run Script
# This script sets up the AceAI environment and starts the server

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== AceAI Setup and Run Script =====${NC}"
echo -e "${BLUE}Setting up the AceAI environment...${NC}"

# Check if .env file exists
if [ ! -f "./server/.env" ]; then
    echo -e "${YELLOW}Creating sample .env file...${NC}"
    cat > ./server/.env << EOF
PORT=3000
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_ENVIRONMENT=your_pinecone_environment
PINECONE_INDEX_NAME=aceai-docs
EOF
    echo -e "${GREEN}.env file created. Please edit it with your API keys before running the application.${NC}"
    echo -e "${YELLOW}You will need:${NC}"
    echo -e "  - Google Gemini API key from https://ai.google.dev/"
    echo -e "  - Pinecone API key from https://app.pinecone.io/"
    echo -e "  - Pinecone environment (e.g. us-east-1)"
    echo -e "  - Pinecone index name (must be created with dimension 768 for Gemini embeddings)"
    exit 1
fi

# Create required directories
echo -e "${YELLOW}Creating required directories...${NC}"
mkdir -p ./server/uploads
mkdir -p ./server/data
mkdir -p ./uploads

# Check if data directory contains documents.json
if [ ! -f "./server/data/documents.json" ]; then
    echo -e "${YELLOW}Creating empty documents.json file...${NC}"
    echo "[]" > ./server/data/documents.json
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd ./server && npm install --legacy-peer-deps

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dependencies installed successfully${NC}"
    
    # Check for API keys
    source .env
    if [[ "$GOOGLE_API_KEY" == "your_google_api_key" || "$PINECONE_API_KEY" == "your_pinecone_api_key" ]]; then
        echo -e "${RED}Warning: You need to update your API keys in .env file${NC}"
        echo -e "${YELLOW}Please edit ./server/.env and restart the application${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}===================================${NC}"
    echo -e "${GREEN}Setup complete! Starting AceAI server...${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo -e "${GREEN}Web interface: http://localhost:${PORT:-3000}${NC}"
    echo -e "${GREEN}API endpoint: http://localhost:${PORT:-3000}/api${NC}"
    echo -e "${GREEN}Health check: http://localhost:${PORT:-3000}/api/admin/health${NC}"
    echo -e "${BLUE}===================================${NC}"
    echo -e "${YELLOW}Documentation:${NC}"
    echo -e "  - README.md: Main documentation"
    echo -e "  - ARCHITECTURE.md: Technical details"
    echo -e "  - UI-PLAN.md: UI roadmap"
    echo -e "  - DEVELOPMENT.md: Developer guide"
    echo -e "${BLUE}===================================${NC}"
    
    npm start
else
    echo -e "${RED}Failed to install dependencies${NC}"
    exit 1
fi
