# Quick Start Guide

This guide will help you get the Packaged Grid solution running quickly.

## Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/allaway-test/packaged-grid.git
cd packaged-grid

# Copy and edit configuration
cp .env.example .env
cp config.example.json config.json

# Start the application
docker-compose up -d

# Access at http://localhost:3000
```

## Option 2: Development Setup

```bash
# Clone and install
git clone https://github.com/allaway-test/packaged-grid.git
cd packaged-grid
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

## Option 3: Production Docker

```bash
# Build the image
docker build -t packaged-grid .

# Run the container
docker run -p 3000:80 \
  -e VITE_DATA_ENDPOINT=https://your-api.example.com/api/data \
  -e VITE_AI_ENDPOINT=https://your-ai.example.com/api/chat \
  packaged-grid
```

## Features Available

- ✅ **DataGrid**: Editable spreadsheet with Name, Age, Email columns
- ✅ **Chat**: AI-powered chat interface with context awareness
- ✅ **Auto-save**: Changes are automatically saved
- ✅ **Configurable**: Environment variables and config files
- ✅ **Mock Data**: Sample data for immediate testing
- ✅ **Docker Ready**: Production-ready containerization

## Next Steps

1. **Integrate your data**: Implement the `ExternalDataProvider` interface
2. **Connect your AI**: Implement the `ExternalChatProvider` interface
3. **Customize appearance**: Modify the theme and UI configuration
4. **Deploy**: Use Docker Compose for production deployment

See the main README.md for detailed integration instructions.