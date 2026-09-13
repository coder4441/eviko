#!/usr/bin/env node
// Phusion Passenger / cPanel Node.js App uchun server
// Bu fayl "Application startup file" sifatida ko'rsatiladi

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error handling request:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> EVIKO POS Ready on http://${hostname}:${port}`);
        console.log(`> Environment: ${process.env.NODE_ENV}`);
    });
}).catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
