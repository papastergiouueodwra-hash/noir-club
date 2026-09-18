import crypto from 'node:crypto';

function cookieValue(req, name) {
  const cookies = String(req.headers.cookie || '').split(';');
  const item = cookies.find(c => c.trim().startsWith(name + '='));
  return item ? decodeURIComponent(item.trim().slice(name.length + 1)) : '';
}

function signature(value) {
  return crypto.createHmac('sha256', process.env.CRM_SESSION_SECRET).update(value).digest('hex');
}

function isAuthenticated(req) {
  if (!process.env.CRM_PASSWORD || !process.env.CRM_SESSION_SECRET) return false;
  const token = cookieValue(req, 'noir_crm_session');
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !/^[0-9a-f]{64}$/.test(sig)) return false;
  const expected = signature(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    return data.exp > Date.now();
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!process.env.CRM_PASSWORD || !process.env.CRM_SESSION_SECRET) {
      return res.status(500).json({ error: 'CRM authentication is not configured.' });
    }
    if (!crypto.timingSafeEqual(Buffer.from(password), Buffer.from(process.env.CRM_PASSWORD))) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }

    const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
    const token = payload + '.' + signature(payload);
    res.setHeader('Set-Cookie', `noir_crm_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=43200`);
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'GET') {
    return res.status(200).json({ authenticated: isAuthenticated(req) });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'noir_crm_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
