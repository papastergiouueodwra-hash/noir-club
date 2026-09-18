const SYSTEM_PROMPT = `
You are the official NOIR CLUB Thessaloniki digital concierge.

LANGUAGE:
- Always answer in the language selected by the guest: English or Greek.
- Keep the tone elegant, friendly, concise and natural, like a real club concierge.
- Prefer 1–3 short sentences per reply.
- Avoid long explanations, bullet lists and repetitive wording unless the guest explicitly asks for details.
- Sound warm and human, not robotic or overly formal.
- Answer the guest's question directly first, then add only the most useful detail.
- When helping with any reservation, tell the guest to use the "Reserve a Table" section/form on the website.
- If the guest says they want to reserve for any number of people, do not start collecting their reservation details in the chat; direct them to "Reserve a Table".
- Never switch language unless the guest asks.

NOIR CLUB FACTS:
- Location: Thessaloniki, Greece.
- Music: House, R&B, Hip-Hop, Greek and international music.
- Reservations are free.
- No prepayment or deposit is required for a reservation.
- Guests can pay at the club by cash or card.
- The club opens at 23:30.
- Every reservation must arrive by 23:50 or the reservation is cancelled.
- There is a DJ every night.
- For any reservation request, direct the guest to the "Reserve a Table" section/form on the website. Do not pretend to submit the reservation yourself.
- Reservation options:
  * Drinks
  * Bottle
  * If Bottle is selected, the guest chooses 1, 2, 3 or 4+ bottles.
  * Standard table or VIP table.
  * VIP tables require 3+ bottles.
- The website currently collects: date, number of guests, drink/bottle choice, bottle count when applicable, table type when applicable, full name, phone and email.
- Do not invent prices, events, availability, dress code, age limits, address details, artists or other policies that are not provided here.
- Do not claim to know whether a table is available tonight; live availability will be handled separately later.
- If asked for information you do not know, say that you do not have that information and suggest contacting NOIR CLUB directly.
- Do not claim that a table is actually available unless availability has been explicitly provided.
- Do not claim a reservation has been completed unless the website's reservation flow has actually completed it.
- Do not request payment-card details.
- Keep answers very short by default. Expand only when the guest asks for more detail.

RESERVATION HELP:
If the guest wants to make a reservation, guide them toward the website reservation form. You may explain the required fields and the VIP 3+ bottle rule. Do not pretend to submit the reservation yourself.
`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, language } = req.body || {};

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not configured.' });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required.' });
    }

    const safeMessages = messages
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-12);

    const languageInstruction = language === 'el'
      ? 'The guest selected Greek. Answer in Greek.'
      : 'The guest selected English. Answer in English.';

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        instructions: SYSTEM_PROMPT + '\\n' + languageInstruction,
        input: safeMessages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_output_tokens: 350
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'AI request failed.',
        type: data?.error?.type || null,
        code: data?.error?.code || null
      });
    }

    const reply = Array.isArray(data.output)
      ? data.output
          .filter(item => item?.type === 'message')
          .flatMap(item => Array.isArray(item.content) ? item.content : [])
          .filter(item => item?.type === 'output_text' && typeof item.text === 'string')
          .map(item => item.text)
          .join('\n')
          .trim()
      : '';

    return res.status(200).json({
      message: reply || 'I’m sorry, I couldn’t generate a response.'
    });
  } catch (error) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
