/**
 * Testing Dashboard Server
 * Serves the dashboard UI and provides API endpoints to fetch data from the database
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS)
const dashboardPath = path.join(__dirname, 'dashboard');
app.use(express.static(dashboardPath));

// Serve index.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(dashboardPath, 'index.html'));
});

// ============================================
// API ENDPOINTS
// ============================================

/**
 * GET /api/emails
 * Fetch all emails for a session
 */
app.get('/api/emails', async (req, res) => {
    try {
        const { sessionId = 'test-session-001' } = req.query;

        const emails = await prisma.email.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/tasks
 * Fetch all tasks for a session
 */
app.get('/api/tasks', async (req, res) => {
    try {
        const { sessionId = 'test-session-001' } = req.query;

        const tasks = await prisma.task.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/drafts
 * Fetch all drafts for a session
 */
app.get('/api/drafts', async (req, res) => {
    try {
        const { sessionId = 'test-session-001' } = req.query;

        const drafts = await prisma.draft.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(drafts);
    } catch (error) {
        console.error('Error fetching drafts:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/audit-log
 * Fetch audit log entries for a session
 */
app.get('/api/audit-log', async (req, res) => {
    try {
        const { sessionId = 'test-session-001' } = req.query;

        // Check if AuditLog model exists in schema
        let logs = [];
        try {
            logs = await prisma.auditLog.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'desc' },
                take: 100
            });
        } catch (e) {
            // AuditLog table doesn't exist yet, return mock data
            console.log('AuditLog table not yet created, returning mock data');
            logs = [];
        }

        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit log:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * GET /api/stats
 * Get summary stats
 */
app.get('/api/stats', async (req, res) => {
    try {
        const { sessionId = 'test-session-001' } = req.query;

        const [emailCount, taskCount, draftCount] = await Promise.all([
            prisma.email.count({ where: { sessionId } }),
            prisma.task.count({ where: { sessionId } }),
            prisma.draft.count({ where: { sessionId } })
        ]);

        res.json({
            emails: emailCount,
            tasks: taskCount,
            drafts: draftCount,
            sessionId
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * POST /api/log-action
 * Log an action to the audit log
 */
app.post('/api/log-action', async (req, res) => {
    try {
        const { sessionId, action, description, details } = req.body;

        // Try to create audit log entry, but don't fail if table doesn't exist
        try {
            const log = await prisma.auditLog.create({
                data: {
                    sessionId: sessionId || 'test-session-001',
                    action: action || 'UNKNOWN',
                    description,
                    details
                }
            });
            res.json(log);
        } catch (e) {
            if (e.code === 'P1000' || e.message.includes('no such table')) {
                // Table doesn't exist, just return success
                res.json({ message: 'Action logged (AuditLog table pending)' });
            } else {
                throw e;
            }
        }
    } catch (error) {
        console.error('Error logging action:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message });
});

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🎯 TESTING DASHBOARD SERVER STARTED');
    console.log(`${'='.repeat(60)}\n`);
    console.log(`📊 Dashboard URL: http://localhost:${PORT}`);
    console.log(`🔌 API Base: http://localhost:${PORT}/api\n`);
    console.log('Available endpoints:');
    console.log('  GET  /api/emails       - Fetch emails');
    console.log('  GET  /api/tasks        - Fetch extracted tasks');
    console.log('  GET  /api/drafts       - Fetch generated drafts');
    console.log('  GET  /api/audit-log    - Fetch audit log');
    console.log('  GET  /api/stats        - Get summary stats');
    console.log('  POST /api/log-action   - Log an action');
    console.log('  GET  /api/health       - Health check\n');
    console.log(`${'='.repeat(60)}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
