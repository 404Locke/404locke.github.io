const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, status: 'healthy' });
});

// Forward generic JSON-RPC POST requests
app.post('/jsonrpc', async (req, res) => {
  try {
    const { url, rpcBody, headers = {} } = req.body || {};
    if (!url || !rpcBody) {
      return res.status(400).json({ error: 'Missing url or rpcBody' });
    }
    const AbortCtl = global.AbortController || undefined;
    const controller = AbortCtl ? new AbortCtl() : { signal: undefined };
    const timeout = setTimeout(() => {
      if (AbortCtl && controller && controller.abort) controller.abort();
    }, 20000);
    console.log('[proxy] →', url, rpcBody.method);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: JSON.stringify(rpcBody),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
    console.log('[proxy] ←', url, response.status);
    res.status(response.status).json({ ok: response.ok, status: response.status, data: payload });
  } catch (err) {
    console.error('[proxy] error', err);
    res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`JSON-RPC proxy listening on :${PORT}`);
});


