# Packaged Grid

A deployable Docker container that packages Synapse DataGrid and Chat components for external platform integration. This solution allows external platforms to easily deploy collaborative data grids and AI-powered chat interfaces using their own data sources and AI services.

## Features

- **DataGrid Component**: Collaborative spreadsheet-like interface based on Synapse DataGrid
- **Chat Component**: AI-powered chat interface based on Synapse Chat types
- **Configurable Data Sources**: Support for REST APIs, GraphQL, and custom data providers
- **AI Integration**: Support for OpenAI, Anthropic, and custom AI services
- **Docker Ready**: Easy deployment with Docker and Docker Compose
- **External Platform Integration**: Configurable for various external platforms and data sources

## Quick Start

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/allaway-test/packaged-grid.git
cd packaged-grid
```

2. Copy and configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Copy and configure the platform settings:
```bash
cp config.example.json config.json
# Edit config.json with your data and AI provider settings
```

4. Start the application:
```bash
docker-compose up -d
```

5. Access the application at `http://localhost:3000`

### Using Docker

1. Build the image:
```bash
docker build -t packaged-grid .
```

2. Run the container:
```bash
docker run -p 3000:80 \
  -e VITE_DATA_ENDPOINT=https://your-api.example.com/api/data \
  -e VITE_AI_ENDPOINT=https://your-ai-service.example.com/api/chat \
  packaged-grid
```

### Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_DATA_ENDPOINT` | Your data API endpoint | `https://api.example.com/data` |
| `VITE_AI_ENDPOINT` | Your AI service endpoint | `https://ai.example.com/chat` |
| `VITE_AI_API_KEY` | API key for AI service | `sk-...` |
| `BACKEND_API_URL` | Backend API URL for nginx proxy | `http://backend:8080` |

### Configuration File

Create a `config.json` file to customize the platform integration:

```json
{
  "dataProvider": {
    "type": "rest",
    "endpoint": "https://your-api.example.com/api/data",
    "headers": {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_TOKEN"
    }
  },
  "aiProvider": {
    "type": "openai",
    "endpoint": "https://api.openai.com/v1/chat/completions",
    "apiKey": "YOUR_OPENAI_API_KEY",
    "model": "gpt-3.5-turbo"
  },
  "ui": {
    "theme": "light",
    "primaryColor": "#1976d2",
    "enableChat": true,
    "enableGrid": true
  }
}
```

## External Platform Integration

### Data Provider Integration

To integrate with your data source, implement the `ExternalDataProvider` interface:

```typescript
interface ExternalDataProvider {
  fetchData(query?: string): Promise<DataGridRow[]>
  updateData(data: DataGridRow[]): Promise<boolean>
  getColumns(): Promise<GridColumn[]>
}
```

### Chat Provider Integration

To integrate with your AI service, implement the `ExternalChatProvider` interface:

```typescript
interface ExternalChatProvider {
  sendMessage(message: string, sessionId?: string): Promise<string>
  createSession(): Promise<string>
  getHistory(sessionId: string): Promise<Interaction[]>
}
```

### Example Implementations

The package includes example implementations for:

- **MockDataProvider**: In-memory data provider for testing
- **RestApiDataProvider**: REST API integration
- **OpenAIChatProvider**: OpenAI API integration
- **MockChatProvider**: Mock chat provider for testing

## API Endpoints

Your backend should implement these endpoints:

### Data Endpoints

- `GET /api/data` - Fetch grid data
- `GET /api/data?q=query` - Search/filter data
- `PUT /api/data` - Update grid data
- `GET /api/columns` - Get column definitions

### Chat Endpoints

- `POST /api/chat` - Send chat message
- `POST /api/chat/session` - Create new chat session
- `GET /api/chat/history/:sessionId` - Get chat history

## Examples

### REST API Data Provider

```typescript
const dataProvider = new RestApiDataProvider(
  'https://api.example.com',
  {
    'Authorization': 'Bearer your-token',
    'Content-Type': 'application/json'
  }
)
```

### OpenAI Chat Provider

```typescript
const chatProvider = new OpenAIChatProvider(
  'your-openai-api-key',
  'gpt-3.5-turbo'
)
```

### Custom Configuration

```javascript
// Set configuration at runtime
window.__PACKAGED_GRID_CONFIG__ = {
  dataProvider: {
    type: 'custom',
    endpoint: 'https://your-custom-api.com/data'
  },
  aiProvider: {
    type: 'custom',
    endpoint: 'https://your-ai-service.com/chat'
  }
}
```

## Deployment

### Production Deployment

1. Configure your environment variables
2. Build and deploy using Docker:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

Example Kubernetes deployment configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: packaged-grid
spec:
  replicas: 3
  selector:
    matchLabels:
      app: packaged-grid
  template:
    metadata:
      labels:
        app: packaged-grid
    spec:
      containers:
      - name: packaged-grid
        image: packaged-grid:latest
        ports:
        - containerPort: 80
        env:
        - name: VITE_DATA_ENDPOINT
          value: "https://your-api.example.com/api/data"
        - name: VITE_AI_ENDPOINT
          value: "https://your-ai.example.com/api/chat"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see LICENSE file for details

## Support

For issues and questions:
1. Check the documentation above
2. Review existing issues
3. Create a new issue with detailed information about your setup and the problem

## Roadmap

- [ ] WebSocket support for real-time collaboration
- [ ] Additional AI provider integrations
- [ ] Enhanced data validation and type checking
- [ ] Plugin system for custom extensions
- [ ] Advanced grid features (filtering, sorting, grouping)
- [ ] Multi-tenant support
- [ ] Enhanced security features