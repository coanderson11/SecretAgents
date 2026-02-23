/**
 * SecretAgents Testing Dashboard - JavaScript
 * Connects to backend API and displays real-time data
 */

const API_BASE = 'http://localhost:8025/api';
const SESSION_ID = localStorage.getItem('sessionId') || 'test-session-001';

let allEmails = [];
let allTasks = [];
let allDrafts = [];
let allLogs = [];
let autoRefreshInterval;

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadAllData();
    
    // Auto-refresh every 5 seconds
    autoRefreshInterval = setInterval(loadAllData, 5000);
});

function initializeEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-btn:not(.refresh-btn)').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', loadAllData);

    // Modal close
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('email-modal').addEventListener('click', (e) => {
        if (e.target.id === 'email-modal') closeModal();
    });
}

function switchTab(tabName) {
    // Update buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
}

// ============================================
// DATA LOADING
// ============================================

async function loadAllData() {
    try {
        await Promise.all([
            loadEmails(),
            loadTasks(),
            loadDrafts(),
            loadAuditLog()
        ]);
        updateStats();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

async function loadEmails() {
    try {
        const response = await fetch(`${API_BASE}/emails?sessionId=${SESSION_ID}`);
        if (response.ok) {
            allEmails = await response.json();
            renderEmails();
        }
    } catch (error) {
        console.error('Error loading emails:', error);
        document.getElementById('emails-container').innerHTML = 
            '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Failed to load emails. Backend may be down.</div></div>';
    }
}

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/tasks?sessionId=${SESSION_ID}`);
        if (response.ok) {
            allTasks = await response.json();
            renderTasks();
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function loadDrafts() {
    try {
        const response = await fetch(`${API_BASE}/drafts?sessionId=${SESSION_ID}`);
        if (response.ok) {
            allDrafts = await response.json();
            renderDrafts();
        }
    } catch (error) {
        console.error('Error loading drafts:', error);
    }
}

async function loadAuditLog() {
    try {
        const response = await fetch(`${API_BASE}/audit-log?sessionId=${SESSION_ID}`);
        if (response.ok) {
            allLogs = await response.json();
            renderAuditLog();
        }
    } catch (error) {
        console.error('Error loading audit log:', error);
    }
}

// ============================================
// RENDERING
// ============================================

function renderEmails() {
    const container = document.getElementById('emails-container');
    
    if (allEmails.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📧</div>
                <div class="empty-state-text">No emails yet</div>
                <div style="font-size: 12px; color: var(--text-gray);">Run the fetch_emails MCP tool to load your inbox</div>
            </div>
        `;
        return;
    }

    container.innerHTML = allEmails.map(email => {
        const date = new Date(email.createdAt).toLocaleString();
        const tasksForEmail = allTasks.filter(t => t.emailId === email.id).length;
        
        return `
            <div class="email-item" onclick="showEmailDetail('${email.id}')">
                <div class="email-from">${email.from}</div>
                <div class="email-subject">${email.subject}</div>
                <div class="email-preview">${email.body.substring(0, 150)}...</div>
                <div class="email-meta">
                    <div class="email-date">${date}</div>
                    <div class="email-tasks-count">${tasksForEmail} tasks</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderTasks() {
    const container = document.getElementById('tasks-container');
    
    if (allTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✅</div>
                <div class="empty-state-text">No tasks extracted yet</div>
                <div style="font-size: 12px; color: var(--text-gray);">Use the extract_tasks_from_email tool to create tasks</div>
            </div>
        `;
        return;
    }

    container.innerHTML = allTasks.map(task => {
        const email = allEmails.find(e => e.id === task.emailId);
        return `
            <div class="task-item">
                <div class="task-priority ${task.priority.toLowerCase()}">${task.priority}</div>
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                <div class="task-meta">
                    <div class="task-source">From: <strong>${email?.subject || 'Unknown'}</strong></div>
                    <div>${task.status}</div>
                    ${task.dueDate ? `<div>Due: ${new Date(task.dueDate).toLocaleDateString()}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function renderDrafts() {
    const container = document.getElementById('drafts-container');
    
    if (allDrafts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📝</div>
                <div class="empty-state-text">No drafts generated yet</div>
                <div style="font-size: 12px; color: var(--text-gray);">Use the generate_draft_response tool to create drafts</div>
            </div>
        `;
        return;
    }

    container.innerHTML = allDrafts.map(draft => {
        const email = allEmails.find(e => e.id === draft.emailId);
        const date = new Date(draft.createdAt).toLocaleString();
        
        return `
            <div class="draft-item">
                <div class="draft-status ${draft.status?.toLowerCase()}">${draft.status} - NOT SENT</div>
                <div class="draft-to">To: <strong>${draft.to || email?.from || 'Unknown'}</strong></div>
                <div class="draft-content">${draft.content}</div>
                <div class="draft-meta">
                    <div>Created: ${date}</div>
                    <div>Related to: <strong>${email?.subject || 'Unknown'}</strong></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderAuditLog() {
    const container = document.getElementById('audit-log-container');
    
    if (allLogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No audit logs yet</div>
                <div style="font-size: 12px; color: var(--text-gray);">Actions will appear here as you use the tools</div>
            </div>
        `;
        return;
    }

    // Show most recent first
    const sortedLogs = [...allLogs].reverse();

    container.innerHTML = sortedLogs.map(log => {
        const time = new Date(log.createdAt).toLocaleTimeString();
        const icons = {
            'FETCH': '📥',
            'EXTRACT': '✂️',
            'GENERATE': '✍️',
            'SEND_ATTEMPT': '📤',
            'SEND_BLOCKED': '🚫'
        };
        
        return `
            <div class="audit-log-item">
                <div class="audit-log-icon">${icons[log.action] || '📝'}</div>
                <div class="audit-log-content">
                    <div class="audit-log-action">${log.action}</div>
                    <div class="audit-log-time">${time}</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    document.getElementById('stat-emails').textContent = allEmails.length;
    document.getElementById('stat-tasks').textContent = allTasks.length;
    document.getElementById('stat-drafts').textContent = allDrafts.length;
    document.getElementById('stat-logs').textContent = allLogs.length;
}

// ============================================
// MODAL
// ============================================

function showEmailDetail(emailId) {
    const email = allEmails.find(e => e.id === emailId);
    if (!email) return;

    const tasks = allTasks.filter(t => t.emailId === emailId);
    const date = new Date(email.createdAt).toLocaleString();

    let tasksHtml = '';
    if (tasks.length > 0) {
        tasksHtml = `
            <div class="modal-email-tasks">
                <h3>📋 Extracted Tasks</h3>
                <div class="modal-task-list">
                    ${tasks.map(task => `
                        <div style="padding: 12px; background: var(--bg-light); border-radius: 6px;">
                            <div style="font-weight: 600; margin-bottom: 4px;">${task.title}</div>
                            ${task.description ? `<div style="font-size: 12px; color: var(--text-gray);">${task.description}</div>` : ''}
                            <div style="font-size: 11px; color: var(--text-gray); margin-top: 4px;">Priority: ${task.priority}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById('modal-body').innerHTML = `
        <div class="modal-email-header">
            <div class="modal-email-subject">${email.subject}</div>
            <div class="modal-email-meta">
                <div><strong>From:</strong> ${email.from}</div>
                <div><strong>Date:</strong> ${date}</div>
            </div>
        </div>
        <div class="modal-email-body">${email.body}</div>
        ${tasksHtml}
    `;

    document.getElementById('email-modal').classList.add('show');
}

function closeModal() {
    document.getElementById('email-modal').classList.remove('show');
}

// ============================================
// UTILITIES
// ============================================

// Auto-refresh on page focus
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        loadAllData();
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    clearInterval(autoRefreshInterval);
});
