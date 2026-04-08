const express = require('express');
const path = require('path');
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', true);
const PORT = process.env.PORT || 3000;

// Strip all Kubernetes-injected environment variables after reading what we need
const K8S_ENV_PREFIXES = ['KUBERNETES_', 'VILLAGE_CHRONICLES_SERVICE'];
for (const key of Object.keys(process.env)) {
  if (K8S_ENV_PREFIXES.some(prefix => key.startsWith(prefix))) {
    delete process.env[key];
  }
}

// HTTP request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // X-Forwarded-For can be comma-separated; take the first (originating) IP
    const xForwardedFor = req.headers['x-forwarded-for'];
    const clientIp = xForwardedFor ? xForwardedFor.split(',')[0].trim() : req.socket.remoteAddress;
    const log = {
      time: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: clientIp,
      ua: req.headers['user-agent'] || '-',
      ms: duration,
    };
    console.log(JSON.stringify(log));
    // Debug: log headers on first browser request
    if (req.headers['user-agent'] && req.headers['user-agent'].includes('Mozilla') && req.path === '/') {
      console.error('DEBUG: x-forwarded-for=' + (req.headers['x-forwarded-for'] || 'MISSING') + ', socket=' + req.socket.remoteAddress);
    }
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Village Chronicles running at http://localhost:${PORT}`);
});
