// Simple mock API server for frontend demo (no database required)
const http = require('http');

const PORT = 4000;

// Mock data
const mockOverview = {
    totalEvents: 125847,
    uniqueUsers: 3891,
    eventCounts: [
        { eventType: 'page_view', count: 45320 },
        { eventType: 'button_click', count: 28741 },
        { eventType: 'form_submit', count: 12458 },
        { eventType: 'purchase', count: 8923 },
        { eventType: 'signup', count: 5421 },
    ],
    dailyTrend: Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
            date: date.toISOString(),
            count: Math.floor(3000 + Math.random() * 2000),
        };
    }),
};

const mockUser = {
    sub: 'user-123',
    email: 'demo@analytics-saas.com',
    role: 'admin',
    tenantId: 'tenant-456',
};

const mockTokens = {
    accessToken: 'mock-access-token-12345',
    refreshToken: 'mock-refresh-token-67890',
};

// CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
};

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, corsHeaders);
        res.end();
        return;
    }

    // Set CORS headers for all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
    });

    const url = req.url || '';

    // Routes
    if (url.includes('/api/v1/auth/login')) {
        res.writeHead(200);
        res.end(JSON.stringify(mockTokens));
    } else if (url.includes('/api/v1/auth/register')) {
        res.writeHead(201);
        res.end(JSON.stringify(mockTokens));
    } else if (url.includes('/api/v1/auth/me')) {
        res.writeHead(200);
        res.end(JSON.stringify(mockUser));
    } else if (url.includes('/api/v1/auth/logout')) {
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
    } else if (url.includes('/api/v1/analytics/overview')) {
        res.writeHead(200);
        res.end(JSON.stringify(mockOverview));
    } else if (url.includes('/api/v1/dashboards')) {
        res.writeHead(200);
        res.end(JSON.stringify([]));
    } else if (url.includes('/api/v1/reports')) {
        res.writeHead(200);
        res.end(JSON.stringify([]));
    } else if (url.includes('/health')) {
        res.writeHead(200);
        res.end(JSON.stringify({ status: 'ok' }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 Mock API Server running at http://localhost:${PORT}`);
    console.log(`\n📊 Endpoints available:`);
    console.log(`   POST /api/v1/auth/login`);
    console.log(`   POST /api/v1/auth/me`);
    console.log(`   GET  /api/v1/analytics/overview`);
    console.log(`\n✅ You can now login with any email/password to see the dashboard!`);
});
