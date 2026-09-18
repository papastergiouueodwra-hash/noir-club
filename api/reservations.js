import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

import crypto from 'node:crypto';

function authenticated(req) {
  if (!process.env.CRM_SESSION_SECRET) return false;
  const cookie = String(req.headers.cookie || '').split(';').find(c => c.trim().startsWith('noir_crm_session='));
  const token = cookie ? decodeURIComponent(cookie.trim().slice('noir_crm_session='.length)) : '';
  const [payload, sig] = token.split('.');
  if (!payload || !sig || !/^[0-9a-f]{64}$/.test(sig)) return false;
  const expected = crypto.createHmac('sha256', process.env.CRM_SESSION_SECRET).update(payload).digest('hex');
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); }
  catch { return false; }
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeReservation(body) {
  const date = clean(body?.date);
  const guests = clean(body?.guests);
  const drink = clean(body?.drink);
  const bottles = clean(body?.bottles);
  const tableType = clean(body?.table);
  const name = clean(body?.name);
  const phone = clean(body?.phone);
  const email = clean(body?.email);

  if (!date || !guests || !drink || !name || !phone || !email) {
    return { error: 'Please complete all required fields.' };
  }

  if (!['Drinks', 'Bottle'].includes(drink)) {
    return { error: 'Invalid drink selection.' };
  }

  if (drink === 'Bottle') {
    if (!['1', '2', '3', '4+'].includes(bottles)) {
      return { error: 'Please select the number of bottles.' };
    }
    if (!['Standard', 'VIP'].includes(tableType)) {
      return { error: 'Please select a table type.' };
    }
    if (tableType === 'VIP' && !['3', '4+'].includes(bottles)) {
      return { error: 'VIP tables require 3+ bottles.' };
    }
  }

  return {
    date,
    guests,
    drink,
    bottles: drink === 'Bottle' ? bottles : null,
    tableType: drink === 'Bottle' ? tableType : null,
    name,
    phone,
    email
  };
}

function reservationFromRow(row) {
  return {
    id: String(row.id),
    date: row.date,
    guests: row.guests,
    drink: row.drink,
    bottles: row.bottles,
    table: row.table_type,
    name: row.name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    createdAt: row.created_at
  };
}

export default async function handler(req, res) {
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
  }

  try {
    if (req.method === 'GET') {
      if (!authenticated(req)) return res.status(401).json({ error: 'CRM authentication required.' });
      const rows = await sql`
        SELECT id, date::text AS date, guests, drink, bottles, table_type, name, phone, email, status, created_at
        FROM reservations
        ORDER BY date ASC, created_at ASC
      `;
      return res.status(200).json({ reservations: rows.map(reservationFromRow) });
    }

    if (req.method === 'POST') {
      const data = normalizeReservation(req.body || {});
      if (data.error) return res.status(400).json({ error: data.error });

      const rows = await sql`
        INSERT INTO reservations
          (date, guests, drink, bottles, table_type, name, phone, email, status)
        VALUES
          (${data.date}, ${data.guests}, ${data.drink}, ${data.bottles}, ${data.tableType}, ${data.name}, ${data.phone}, ${data.email}, 'Confirmed')
        RETURNING id, date::text AS date, guests, drink, bottles, table_type, name, phone, email, status, created_at
      `;

      return res.status(201).json({ reservation: reservationFromRow(rows[0]) });
    }

    if (!authenticated(req)) return res.status(401).json({ error: 'CRM authentication required.' });

    const id = clean(req.query?.id);
    if (!id) return res.status(400).json({ error: 'Reservation id is required.' });

    if (req.method === 'PATCH') {
      const nextStatus = clean(req.body?.status);
      if (!['Confirmed', 'Pending', 'Cancelled'].includes(nextStatus)) {
        return res.status(400).json({ error: 'Invalid status.' });
      }

      const rows = await sql`
        UPDATE reservations
        SET status = ${nextStatus}
        WHERE id = ${id}
        RETURNING id, date::text AS date, guests, drink, bottles, table_type, name, phone, email, status, created_at
      `;

      if (!rows.length) return res.status(404).json({ error: 'Reservation not found.' });
      return res.status(200).json({ reservation: reservationFromRow(rows[0]) });
    }

    if (req.method === 'DELETE') {
      const rows = await sql`DELETE FROM reservations WHERE id = ${id} RETURNING id`;
      if (!rows.length) return res.status(404).json({ error: 'Reservation not found.' });
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Reservations API error:', error);
    return res.status(500).json({ error: 'Something went wrong with the reservation system.' });
  }
}
