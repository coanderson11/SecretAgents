# 🎯 SecretAgents Testing Dashboard

A lightweight, browser-based dashboard for visualizing and monitoring your SecretAgents MCP testing workflow.

## Features

✅ **Real-time Email Viewing** - See all fetched emails from your inbox  
✅ **Task Extraction Monitoring** - View AI-extracted tasks from emails  
✅ **Draft Generation Display** - See generated drafts with PENDING status  
✅ **Audit Log Streaming** - Real-time log of all operations  
✅ **Summary Statistics** - Quick overview of test metrics  
✅ **Interactive Details** - Click emails to view full content and related tasks  

## Safety

🔒 **All drafts are automatically marked as PENDING** - emails will NOT be sent  
🔒 **Session isolated** - your data is separate from other users  
🔒 **Read-only UI** - no send buttons or dangerous actions exposed  

## Installation

### 1. Install Dependencies

```bash
cd C:\Users\coander\secretagents\email-task-mcp
npm install express cors
```

### 2. Start the Dashboard Server

```bash
cd C:\Users\coander\secretagents\email-task-mcp
node dashboard/server.js
```

You should see:

```
============================================================
🎯 TESTING DASHBOARD SERVER STARTED
============================================================

📊 Dashboard URL: http://localhost:3001
🔌 API Base: http://localhost:3001/api

Available endpoints:
  GET  /api/emails       - Fetch emails
  GET  /api/tasks        - Fetch extracted tasks
  GET  /api/drafts       - Fetch generated drafts
  GET  /api/audit-log    - Fetch audit log
  GET  /api/stats        - Get summary stats
  POST /api/log-action   - Log an action
  GET  /api/health       - Health check

============================================================
```

### 3. Open Dashboard in Browser

Open your browser and navigate to:

```
http://localhost:3001
```

## Usage

### Dashboard Tabs

**📧 Emails**
- View all fetched emails from your inbox
- Shows: From, Subject, Preview, Date, Task Count
- Click any email to view full details and related tasks

**✅ Tasks**
- View all extracted tasks
- Shows: Priority, Title, Description, Status, Due Date
- Grouped by source email

**📝 Drafts**
- View all generated draft responses
- Shows: Status, Recipients, Content Preview, Date
- All marked as PENDING (safe - won't send)

**📋 Audit Log**
- Real-time log of all operations
- Shows: Action, Timestamp, Description
- Auto-updates every 5 seconds

### Statistics

Top-right stats show:
- **Emails Fetched**: Total emails loaded from inbox
- **Tasks Extracted**: Total tasks automatically extracted from emails
- **Drafts Generated**: Total draft responses generated
- **Actions Logged**: Total operations logged to audit trail

### Refreshing Data

Click the **🔄 Refresh** button to manually reload data, or let it auto-refresh every 5 seconds.

## API Endpoints

All endpoints accept optional `sessionId` query parameter (defaults to `test-session-001`).

### GET /api/emails
Fetch all emails for a session.

```bash
curl http://localhost:3001/api/emails?sessionId=test-session-001
```

### GET /api/tasks
Fetch all extracted tasks.

```bash
curl http://localhost:3001/api/tasks?sessionId=test-session-001
```

### GET /api/drafts
Fetch all generated drafts.

```bash
curl http://localhost:3001/api/drafts?sessionId=test-session-001
```

### GET /api/audit-log
Fetch audit log entries.

```bash
curl http://localhost:3001/api/audit-log?sessionId=test-session-001
```

### GET /api/stats
Get summary statistics.

```bash
curl http://localhost:3001/api/stats?sessionId=test-session-001
```

### POST /api/log-action
Log an action to the audit trail.

```bash
curl -X POST http://localhost:3001/api/log-action \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-001",
    "action": "FETCH",
    "description": "Fetched 5 emails from inbox",
    "details": { "count": 5 }
  }'
```

### GET /api/health
Health check endpoint.

```bash
curl http://localhost:3001/api/health
```

## Architecture

```
Browser (Dashboard UI)
    ↓
Dashboard Server (Node.js Express)
    ↓
Database (Prisma + SQLite)
    ↓
MCP Tools
```

## Database Connection

The dashboard connects to the same SQLite database as the backend:

```
C:\Users\coander\email-task-app\backend\dev.db
```

Environment variable (loaded from `.env`):

```env
DATABASE_URL=file:C:\Users\coander\email-task-app\backend\dev.db
```

## Troubleshooting

### Dashboard shows "Failed to load emails. Backend may be down."

1. Check if the backend database exists at `C:\Users\coander\email-task-app\backend\dev.db`
2. Ensure the `.env` file has the correct `DATABASE_URL`
3. Verify Prisma client is generated: `npx prisma generate`
4. Check the browser console for detailed error messages

### No data appears in dashboard

1. Create test emails: `node C:\Users\coander\email-task-app\backend\create-test-emails.js`
2. Verify `sessionId` matches in browser (defaults to `test-session-001`)
3. Refresh the dashboard with the 🔄 button
4. Check the server logs for errors

### Dashboard won't start

1. Install dependencies: `npm install express cors`
2. Ensure port 3001 is available: `netstat -ano | findstr :3001`
3. Check Node.js is installed: `node --version`

## File Structure

```
dashboard/
├── index.html       - Main dashboard HTML
├── app.js          - Frontend JavaScript logic
├── styles.css      - Dashboard styling
├── server.js       - Express API server
└── README.md       - This file
```

## Development

### Modifying the Dashboard

Edit these files to customize the dashboard:

- `index.html` - HTML structure and layout
- `styles.css` - Colors, fonts, spacing, responsive design
- `app.js` - Data loading logic, rendering functions
- `server.js` - API endpoints, database queries

### Adding New Features

Example: Add a new tab for email statistics

1. Add button in `index.html`:
```html
<button class="nav-btn" data-tab="statistics">
  <span class="nav-icon">📊</span>
  <span class="nav-label">Statistics</span>
</button>
```

2. Add content section:
```html
<section class="tab-content" id="tab-statistics">
  <div id="statistics-container"></div>
</section>
```

3. Add function in `app.js`:
```javascript
async function loadStatistics() {
  const response = await fetch(`${API_BASE}/stats?sessionId=${SESSION_ID}`);
  const stats = await response.json();
  renderStatistics(stats);
}
```

## Testing Workflow

Typical testing flow:

1. **Start Dashboard**: `node dashboard/server.js`
2. **Open Dashboard**: http://localhost:3001
3. **Create Test Emails**: `node create-test-emails.js`
4. **See Emails**: Dashboard shows 3 test emails
5. **Extract Tasks**: Use MCP tool to extract tasks
6. **See Tasks**: Dashboard updates with extracted tasks
7. **Generate Drafts**: Use MCP tool to generate responses
8. **See Drafts**: Dashboard shows draft responses marked PENDING
9. **View Audit Log**: See complete history of all operations

## Performance

- Dashboard auto-refreshes every 5 seconds (configurable in `app.js`)
- Database queries are indexed on `sessionId` for fast lookups
- Lightweight JavaScript - no heavy frameworks
- Responsive CSS grid layout
- Modal animations are GPU-accelerated

## Security

✅ CORS enabled for local development  
✅ No authentication required (localhost only)  
✅ No credentials stored in client code  
✅ Database connection on server-side only  
✅ API endpoints validate `sessionId`  

## Future Enhancements

- [ ] Real-time WebSocket updates (instead of 5-second polling)
- [ ] Export data to CSV/JSON
- [ ] Filter and search capabilities
- [ ] Dark mode theme
- [ ] Multi-session support selector
- [ ] Email template editor
- [ ] Task filtering by priority/status
- [ ] Draft approval workflow

---

**Status**: ✅ Ready for Phase 0 Testing  
**Last Updated**: 2026-02-19  
**Dashboard Version**: 1.0.0
