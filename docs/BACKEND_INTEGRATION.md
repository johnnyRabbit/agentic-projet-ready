# Backend Integration Guide

This guide explains the backend integration architecture and how to use it.

## Overview

The AI Engineering Team platform includes a complete backend integration layer with:

1. **Authentication System** - User registration, login, and session management
2. **Backend API** - IndexedDB-based database with full CRUD operations
3. **Groq API Integration** - Real AI model execution with fallback to simulation
4. **Data Synchronization** - Offline-first with local persistence

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Store   │  │ Engine Store │  │ GitHub Store │      │
│  │ (Zustand)    │  │ (Zustand)    │  │ (Zustand)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         ▼                  ▼                  ▼              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Auth Service │  │Backend API   │  │GitHub Client │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ localStorage │  │  IndexedDB   │  │  Groq API    │      │
│  │ (sessions)   │  │  (database)  │  │  (AI models) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Authentication

### Setup

The authentication system is automatically initialized when the app loads. Users can:

1. **Register** - Create a new account with email, password, and name
2. **Login** - Sign in with existing credentials
3. **Logout** - End the current session

### Demo Credentials

For testing, use:
- Email: `demo@example.com`
- Password: `demo123`

### Session Management

- Sessions are stored in `localStorage`
- Sessions expire after 24 hours
- Automatic session refresh
- Secure password hashing (SHA-256)

### User Roles

- `admin` - Full access to all features
- `developer` - Can create and manage projects
- `viewer` - Read-only access

## Backend API

### Database Schema

The backend uses IndexedDB with the following stores:

1. **projects** - Project metadata and configuration
2. **workRequests** - User stories and feature requests
3. **agentRuns** - Agent execution history
4. **pullRequests** - Generated pull requests
5. **analytics** - Metrics and performance data

### API Methods

```typescript
// Initialize
await backendAPI.initialize();

// CRUD Operations
await backendAPI.create('projects', projectData);
await backendAPI.read('projects', projectId);
await backendAPI.update('projects', projectId, updates);
await backendAPI.delete('projects', projectId);
await backendAPI.list('projects', { limit: 10, orderBy: 'createdAt' });

// Query by index
await backendAPI.query('projects', 'userId', userId);

// Batch operations
await backendAPI.batch('projects', [
  { type: 'add', data: project1 },
  { type: 'put', data: project2 },
  { type: 'delete', id: projectId }
]);

// Export/Import
const exportData = await backendAPI.exportData();
await backendAPI.importData(exportData);
```

### Query Options

```typescript
interface QueryOptions {
  limit?: number;        // Max records to return
  offset?: number;       // Skip N records
  orderBy?: string;      // Field to sort by
  orderDirection?: 'asc' | 'desc';
}
```

## Groq API Integration

### Configuration

1. Get an API key from [Groq Console](https://console.groq.com)
2. Enter the key in the Engine Dashboard
3. The system will use real AI models instead of simulation

### Available Models

- `llama-3.1-8b-instant` - Fast, cheap (default for simple tasks)
- `llama-3.3-70b-versatile` - Powerful, versatile (default for complex tasks)
- `llama-3.1-70b-versatile` - Alternative 70B model
- `gemma2-9b-it` - Fast, creative tasks
- `mixtral-8x7b-32768` - Fast, code generation

### Fallback Behavior

If the Groq API is unavailable or no API key is provided:
- System automatically falls back to simulation mode
- Simulation generates realistic responses
- No functionality is lost

### Cost Tracking

All API calls are tracked with:
- Input/output tokens
- Latency
- Cost calculation
- Model used

## Data Synchronization

### Offline-First Architecture

The platform is designed to work offline:

1. **Local Storage** - All data is stored locally in IndexedDB
2. **No Server Required** - Works completely offline
3. **Optional Sync** - Can sync to remote server when available

### Data Persistence

- **Authentication** - Stored in `localStorage`
- **Projects** - Stored in IndexedDB
- **Agent Runs** - Stored in IndexedDB
- **Pull Requests** - Stored in IndexedDB
- **Analytics** - Stored in IndexedDB

### Export/Import

Users can export all data as JSON and import it later:

```typescript
// Export
const data = await backendAPI.exportData();
downloadJSON(data);

// Import
const data = readJSON();
await backendAPI.importData(data);
```

## Security

### Authentication Security

- Passwords are hashed with SHA-256
- Sessions use secure random tokens
- Automatic session expiration
- Secure token storage

### API Security

- Groq API keys are stored in memory only
- Keys are never persisted to disk
- HTTPS-only communication
- Request/response validation

### Data Security

- IndexedDB is sandboxed per origin
- No cross-origin data access
- Secure session management
- Input validation on all operations

## Migration to Real Backend

When ready to migrate to a real backend server:

### 1. Create Backend Server

```typescript
// Example Express server
import express from 'express';
import { Pool } from 'pg';

const app = express();
const pool = new Pool({ /* PostgreSQL config */ });

// Projects API
app.get('/api/projects', async (req, res) => {
  const result = await pool.query('SELECT * FROM projects WHERE userId = $1', [req.userId]);
  res.json(result.rows);
});

app.post('/api/projects', async (req, res) => {
  const result = await pool.query(
    'INSERT INTO projects (name, description, userId) VALUES ($1, $2, $3) RETURNING *',
    [req.body.name, req.body.description, req.userId]
  );
  res.json(result.rows[0]);
});
```

### 2. Update BackendAPI

Replace IndexedDB calls with HTTP requests:

```typescript
class BackendAPI {
  private baseUrl = 'https://api.example.com';
  
  async create<T>(storeName: string, data: T): Promise<APIResponse<T>> {
    const response = await fetch(`${this.baseUrl}/${storeName}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    return response.json();
  }
  
  // ... other methods
}
```

### 3. Database Schema

```sql
-- PostgreSQL schema
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE agent_runs (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  agent_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  input TEXT,
  output TEXT,
  model VARCHAR(100),
  tokens INTEGER,
  cost DECIMAL(10, 6),
  duration INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Best Practices

### 1. Always Initialize Backend

```typescript
useEffect(() => {
  backendAPI.initialize().catch(console.error);
}, []);
```

### 2. Handle Errors Gracefully

```typescript
const response = await backendAPI.create('projects', data);
if (!response.success) {
  showError(response.error);
  return;
}
```

### 3. Use Query Options for Large Datasets

```typescript
const response = await backendAPI.list('agentRuns', {
  limit: 100,
  orderBy: 'createdAt',
  orderDirection: 'desc'
});
```

### 4. Export Data Regularly

```typescript
// Auto-export weekly
setInterval(async () => {
  const data = await backendAPI.exportData();
  saveToCloud(data);
}, 7 * 24 * 60 * 60 * 1000);
```

### 5. Validate Input

```typescript
function validateProject(data: any): boolean {
  return data.name && data.name.length > 0 && data.name.length < 255;
}
```

## Troubleshooting

### "Database not initialized" Error

**Solution**: Call `backendAPI.initialize()` before using the API.

### "Authentication failed" Error

**Solution**: Check credentials and ensure user exists in the database.

### "Groq API error" Error

**Solution**: 
1. Verify API key is correct
2. Check API key has sufficient credits
3. System will fallback to simulation mode automatically

### Data Not Persisting

**Solution**: 
1. Check browser supports IndexedDB
2. Ensure backend API is initialized
3. Check browser console for errors

## Future Enhancements

Planned features:

- [ ] Real backend server (Node.js + PostgreSQL)
- [ ] Real-time synchronization (WebSockets)
- [ ] Multi-user collaboration
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Data encryption at rest
- [ ] Backup and restore
- [ ] API rate limiting
- [ ] Webhook notifications

## Support

For issues or questions:
- Check the browser console for errors
- Review the IndexedDB data in DevTools
- Verify Groq API key is valid
- Check authentication status in localStorage
