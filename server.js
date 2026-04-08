const express = require('express');
const path = require('path');
const app = express();
app.disable('x-powered-by');
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
    const log = {
      time: new Date().toISOString(),
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      ua: req.headers['user-agent'] || '-',
      ms: duration,
    };
    console.log(JSON.stringify(log));
  });
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Village Chronicles running at http://localhost:${PORT}`);
});
