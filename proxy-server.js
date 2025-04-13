const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Proxy API requests
app.use('/api', createProxyMiddleware({
  target: 'https://api.nova.singaicloud.com',
  changeOrigin: true,
  pathRewrite: { '^/api': '' },
}));

app.listen(8080, () => console.log('Proxy running on http://localhost:8080'));