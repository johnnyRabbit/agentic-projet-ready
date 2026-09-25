# 🚀 Quick Start Guide

Get up and running with AI Engineering Team in 5 minutes!

## Prerequisites

- Node.js 24.15.0 installed (see `.nvmrc`)
- npm 11+ package manager
- Git (optional, for cloning)

## Installation

### Option 1: Download Release

1. Download the latest release from [GitHub Releases](https://github.com/yourusername/ai-engineering-team/releases)
2. Extract the archive
3. Navigate to the project directory

### Option 2: Clone Repository

```bash
git clone https://github.com/yourusername/ai-engineering-team.git
cd ai-engineering-team
```

## Setup

### 1. Install Dependencies

```bash
npm ci
```

### 2. Configure Environment (Optional)

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` to add your Groq API key (optional):

```env
GROQ_API_KEY=your_api_key_here
```

**Note:** The app works without an API key in simulation mode!

### 3. Start Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

## First Steps

### 1. Explore the Command Center

The Command Center is your main dashboard. You'll see:

- Active projects
- Running agents
- Cost tracking
- Workflow pipeline status

### 2. Try the Engine Dashboard

Navigate to **Engine** in the sidebar:

1. Click **"User Story Delivery"** to start a workflow
2. Watch agents execute in real-time
3. See the execution log update
4. Review agent outputs

### 3. Test the Delivery Pipeline

Navigate to **Delivery** in the sidebar:

1. Enter a user story (or use the example)
2. Click **"Deliver to Pull Request"**
3. Watch the complete pipeline execute:
   - Requirements analysis
   - Planning
   - Implementation
   - Testing
   - Review
   - PR generation

### 4. Check Execution Dashboard

Navigate to **Execution** to:

- Create worktrees
- Browse and edit files
- Run tests
- Build and lint projects
- Commit changes

### 5. Monitor Platform Status

Navigate to **Platform** to see:

- Database status
- File system access
- Web Worker sandbox
- Analytics summary
- Data management (export/import)

### 6. View Analytics

Navigate to **Analytics** to see:

- Total cost and tokens
- Success rates
- Cost trends over time
- Agent performance metrics
- Recent activity

## Example Workflow

Here's a complete example workflow:

### Step 1: Create a User Story

```
As a user, I want to filter notifications by unread status
so that I can focus on important messages.

Acceptance Criteria:
- Filter button in notification list
- Toggle between all/unread
- Persist filter preference
```

### Step 2: Deliver to PR

1. Go to **Delivery** page
2. Paste the user story
3. Click **"Deliver to Pull Request"**
4. Wait ~30 seconds

### Step 3: Review Results

You'll see:

- ✅ Pull Request generated
- ✅ All checks passed (build, test, lint, security)
- ✅ Code review completed
- ✅ Traceability links created
- ✅ Cost report: €0.42
- ✅ Estimated human effort saved: 3h

### Step 4: Approve or Request Changes

- Click **"Approve & Merge"** to accept
- Click **"Review Code"** to see details
- Click **"Request Changes"** to provide feedback

## Key Features

### 🤖 Autonomous Agents

- **Engineering Lead** - Orchestrates the team
- **Requirements Analyst** - Extracts requirements
- **Planner** - Creates implementation plans
- **Developer** - Writes code
- **Reviewer** - Reviews implementations
- **Tester** - Writes and runs tests
- **Security Analyst** - Security audits
- **Risk Analyst** - Risk assessment

### 💰 Cost Tracking

- Real-time cost monitoring
- Budget limits per project/task
- Cost breakdown by phase
- Token usage tracking

### 🔒 Security

- Sandboxed code execution
- API key management
- Audit logging
- Security reviews

### 📊 Analytics

- Historical metrics
- Performance insights
- Cost trends
- Agent performance

### 💾 Persistence

- IndexedDB storage
- Export/Import functionality
- State survives page reloads
- Data backup/restore

## Troubleshooting

### Issue: "Groq API not connected"

**Solution:** This is normal! The app works in simulation mode without an API key. To use real AI:

1. Get a Groq API key from https://console.groq.com
2. Add it to the Engine Dashboard
3. Click "Test Connection"

### Issue: "Database not available"

**Solution:** IndexedDB should be available in all modern browsers. Try:

1. Clear browser cache
2. Check browser console for errors
3. Try a different browser (Chrome/Firefox/Edge)

### Issue: "File System not available"

**Solution:** File System Access API is only available in Chrome/Edge. In other browsers, the app uses a virtual file system.

### Issue: "Web Worker failed"

**Solution:** Web Workers are supported in all modern browsers. Try:

1. Refresh the page
2. Check browser console for errors
3. Disable browser extensions

## Next Steps

- Read the [User Guide](docs/USER_GUIDE.md) for detailed documentation
- Check out the [Architecture Docs](docs/ENGINE_ARCHITECTURE.md)
- Join our [Discord community](https://discord.gg/aiengteam)
- Star the repo on GitHub ⭐

## Getting Help

- 📖 [Documentation](docs/)
- 💬 [Discord Community](https://discord.gg/aiengteam)
- 🐛 [Report Issues](https://github.com/yourusername/ai-engineering-team/issues)
- 📧 [Email Support](mailto:support@aiengteam.com)

## What's Next?

Now that you're up and running, explore:

1. **Custom Workflows** - Create your own agent workflows
2. **Team Collaboration** - Set up multi-user mode (coming soon)
3. **GitHub Integration** - Connect to real repositories (coming soon)
4. **Custom Agents** - Add your own specialized agents
5. **API Access** - Use the REST API (coming soon)

Happy engineering! 🚀
