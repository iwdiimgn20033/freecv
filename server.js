const express = require('express');
const path = require('path');
const app = express();
app.use(express.json({ limit: '2mb' }));

// يخدم الموقع نفسه (public/index.html وأي ملفات أخرى بجانبه)
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.warn('تحذير: متغيّر البيئة ANTHROPIC_API_KEY غير مضبوط. أزرار الذكاء الاصطناعي ستفشل حتى تضبطه من لوحة تحكم المنصة.');
}

app.post('/api/claude', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'missing_api_key', message: 'ANTHROPIC_API_KEY غير مضبوط.' });
  }
  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'proxy_failed', message: String(err) });
  }
});

app.get('/healthz', (req, res) => res.send('ok'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('listening on ' + port));
