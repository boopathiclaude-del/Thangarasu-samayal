import { NextRequest } from 'next/server';

// Runs server-side only — the OpenRouter key never reaches the browser.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MODEL = process.env.OPENROUTER_MODEL || 'openrouter/free';
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

// --- Business knowledge the agent reasons over -----------------------------
const MENU = [
  { id: 'mutton-sukka', name: 'Mutton Sukka', style: 'Chettinad', kind: 'non-veg', note: 'Slow-cooked signature with freshly ground spices.' },
  { id: 'kongunadu-chicken', name: 'Kongunadu Chicken', style: 'Kongunadu', kind: 'non-veg', note: 'Deep, aromatic, rooted in Kongunadu cooking.' },
  { id: 'chettinad-biryani', name: 'Chettinad Biryani', style: 'Chettinad', kind: 'non-veg', note: 'Fragrant rice, tender meat, layered spice — made for celebrations.' },
  { id: 'chicken-milakari', name: 'Chicken Milakari', style: 'Chettinad', kind: 'non-veg', note: 'Pepper-forward, slow-simmered and deeply aromatic.' },
  { id: 'pepper-fry', name: 'Chettinad Pepper Fry', style: 'Chettinad', kind: 'non-veg', note: 'Curry leaf, crushed pepper, slow-roasted masala.' },
  { id: 'erode-rasam', name: 'Erode Special Rasam', style: 'Kongunadu', kind: 'veg', note: 'Bright, comforting finish to the meal.' },
  { id: 'ghee-dosa', name: 'Ghee Roast Dosa', style: 'South Indian', kind: 'veg', note: 'Lace-thin, crisp, cooked fresh to order.' },
  { id: 'payasam', name: 'Payasam & Sweets', style: 'Traditional', kind: 'veg', note: 'Jaggery, ghee and slow-simmered milk to close the feast.' },
  { id: 'filter-coffee', name: 'Filter Coffee', style: 'South Indian', kind: 'veg', note: 'The frothy pour that ends every feast.' },
];

const PACKAGES: Record<string, { guests: string; highlight: string }> = {
  wedding: { guests: 'up to 5,000+', highlight: 'Full banana-leaf spread, live counters and traditional service.' },
  corporate: { guests: '100–1,000+', highlight: 'Punctual service, buffet or plated, menus tuned to the schedule.' },
  private: { guests: '50–500+', highlight: 'Intimate, chef-led menus for birthdays, housewarmings and family events.' },
};

// --- Agent tools -----------------------------------------------------------
const tools = [
  {
    type: 'function',
    function: {
      name: 'recommend_menu',
      description: "Suggest dishes from Thangarasu Samayal's menu for an occasion and preference.",
      parameters: {
        type: 'object',
        properties: {
          diet: { type: 'string', enum: ['veg', 'non-veg', 'both'], description: 'Dietary preference.' },
          occasion: { type: 'string', description: 'wedding, corporate, private or general.' },
        },
        required: ['diet'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_package',
      description: 'Get capacity and highlights for an event type.',
      parameters: {
        type: 'object',
        properties: { occasion: { type: 'string', enum: ['wedding', 'corporate', 'private'] } },
        required: ['occasion'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'capture_enquiry',
      description: 'Record an enquiry once you have at least a name and phone number, so the team can follow up. Confirm details with the guest before calling this.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          phone: { type: 'string' },
          occasion: { type: 'string' },
          date: { type: 'string' },
          guests: { type: 'string' },
          location: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['name', 'phone'],
      },
    },
  },
];

function runTool(name: string, args: Record<string, unknown>) {
  if (name === 'recommend_menu') {
    const diet = String(args.diet || 'both');
    const picks = MENU.filter((m) => diet === 'both' || m.kind === diet);
    return { dishes: picks.slice(0, 6).map((m) => ({ name: m.name, style: m.style, note: m.note })) };
  }
  if (name === 'get_package') {
    const key = String(args.occasion || '').toLowerCase();
    return PACKAGES[key] || { error: 'Unknown occasion. Options: wedding, corporate, private.' };
  }
  if (name === 'capture_enquiry') {
    const g = (k: string) => (args[k] ? String(args[k]).trim() : '');
    const who = g('name') || 'Guest';
    const phone = g('phone');
    const occ = g('occasion') || 'event';
    const date = g('date');
    const guests = g('guests');
    const location = g('location');
    const notes = g('notes');
    // Build a ready-to-send DRAFT. Nothing is sent from the server — the guest
    // taps WhatsApp/Email to review and send it themselves (manual send).
    const draft = [
      'Catering enquiry — Thangarasu Samayal',
      `Name: ${who}`,
      `Phone: ${phone}`,
      `Occasion: ${occ}`,
      date && `Date: ${date}`,
      guests && `Guests: ${guests}`,
      location && `Location: ${location}`,
      notes && `Notes: ${notes}`,
    ].filter(Boolean).join('\n');
    const enc = encodeURIComponent(draft);
    const subject = encodeURIComponent(`Catering enquiry — ${occ}${date ? ' on ' + date : ''}`);
    return {
      ok: true,
      draft,
      whatsapp: `https://wa.me/918012678719?text=${enc}`,
      mailto: `mailto:hello@thangarasusamayal.com?subject=${subject}&body=${enc}`,
      call: 'tel:8012678719',
      instruction:
        'Draft prepared. Nothing has been sent. Tell the guest their enquiry is drafted and ask them to tap the WhatsApp or Email button below to review and send it themselves, or call 8012678719. Do NOT claim you sent anything.',
    };
  }
  return { error: 'Unknown tool.' };
}

const SYSTEM = `You are "Samayal Concierge", the warm, concise catering assistant for Thangarasu Samayal — a traditional Kongunadu & Chettinad catering business in Appakudal, Erode, serving celebrations since 1999.

Facts you can rely on:
- 25+ years, 1,200+ events served, guest capacity from 500 up to 5,000+.
- Cuisine: Kongunadu and Chettinad, plus classic South Indian (dosa, filter coffee, payasam).
- Event types: weddings, corporate events, private celebrations.
- Contact: phone 8012678719, WhatsApp https://wa.me/918012678719.

How to behave:
- Be friendly, brief and specific. Answer in the guest's language when they don't use English.
- Use tools to recommend dishes and describe packages instead of guessing.
- Your goal is to help the guest plan and to prepare an enquiry. Gather occasion, approximate guest count, date and location naturally across the conversation.
- You cannot send messages yourself. Once you have at least a name and phone number and the guest is ready, call capture_enquiry to PREPARE a pre-filled WhatsApp and Email draft. Then tell the guest their enquiry is drafted and ask them to tap the WhatsApp or Email button (shown below your message) to review and send it themselves, or to call 8012678719. Never say you have sent, booked, or confirmed anything — sending is always manual by the guest.
- Never invent prices; say the team confirms pricing on a quick call. Keep replies to a few short sentences.`;

type Actions = { whatsapp?: string; mailto?: string; call?: string };

type Msg = { role: string; content: string; tool_calls?: unknown; tool_call_id?: string };

// Text protocol: the body streams plain reply tokens as they arrive; if an
// enquiry draft is produced, a final frame `\u0000{"actions":{...}}` is
// appended (the NUL byte never appears in normal reply text).
const ACTIONS_SEP = '\u0000';

export async function POST(req: NextRequest) {
  const key = process.env.OPENROUTER_API_KEY;
  const encoder = new TextEncoder();

  const streamText = (text: string) =>
    new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(text));
        controller.close();
      },
    }), { headers: STREAM_HEADERS });

  if (!key) {
    return streamText("I'm not fully switched on yet — the site owner needs to add an OPENROUTER_API_KEY. Meanwhile, call us on 8012678719 or use the enquiry form below and we'll plan your feast.");
  }

  let body: { messages?: Msg[] };
  try {
    body = await req.json();
  } catch {
    return new Response('Bad request', { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  // Keep only user/assistant turns, trim to the last 12 for a tight context.
  const history = incoming
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const convo: Msg[] = [{ role: 'system', content: SYSTEM }, ...history];

  const headers = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://thangarasu-samayal.example',
    'X-Title': 'Thangarasu Samayal',
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (t: string) => controller.enqueue(encoder.encode(t));
      let actions: Actions | null = null;
      try {
        // Agentic loop: tool-calling turns are consumed silently; the final
        // content-only turn is forwarded to the client token by token.
        for (let step = 0; step < 5; step++) {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers,
            body: JSON.stringify({ model: MODEL, messages: convo, tools, tool_choice: 'auto', temperature: 0.4, stream: true }),
          });

          if (!res.ok || !res.body) {
            const detail = await res.text().catch(() => '');
            console.error('[openrouter]', res.status, detail);
            send('Sorry, I had trouble connecting just now. Please try again, or call 8012678719.');
            controller.close();
            return;
          }

          // Fallback: some models ignore stream:true and return a normal JSON
          // completion. Detect that and handle it without SSE parsing.
          const ctype = res.headers.get('content-type') || '';
          if (!ctype.includes('text/event-stream')) {
            const data = await res.json().catch(() => null) as { choices?: { message?: { content?: string; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[] } | null;
            const msg = data?.choices?.[0]?.message;
            const jsonCalls = msg?.tool_calls || [];
            if (jsonCalls.length) {
              convo.push({ role: 'assistant', content: msg?.content || '', tool_calls: jsonCalls });
              for (const tc of jsonCalls) {
                let parsed: Record<string, unknown> = {};
                try { parsed = JSON.parse(tc.function.arguments || '{}'); } catch { /* ignore */ }
                const out = runTool(tc.function.name, parsed) as Record<string, unknown>;
                if (tc.function.name === 'capture_enquiry' && out.ok) {
                  actions = { whatsapp: out.whatsapp as string, mailto: out.mailto as string, call: out.call as string };
                }
                convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(out) });
              }
              continue;
            }
            send(msg?.content || 'How can I help you plan your feast?');
            break;
          }

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buf = '';
          let content = '';
          let sawTool = false;
          const toolAcc: Record<number, { id: string; name: string; args: string }> = {};
          let finished = false;

          while (!finished) {
            const { value, done } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop() || '';
            for (const line of lines) {
              const t = line.trim();
              if (!t.startsWith('data:')) continue;
              const payload = t.slice(5).trim();
              if (payload === '[DONE]') { finished = true; break; }
              let json: { choices?: { delta?: { content?: string; tool_calls?: { index?: number; id?: string; function?: { name?: string; arguments?: string } }[] } }[] };
              try { json = JSON.parse(payload); } catch { continue; }
              const delta = json.choices?.[0]?.delta;
              if (!delta) continue;
              if (delta.tool_calls) {
                sawTool = true;
                for (const tcd of delta.tool_calls) {
                  const idx = tcd.index ?? 0;
                  const acc = (toolAcc[idx] ||= { id: '', name: '', args: '' });
                  if (tcd.id) acc.id = tcd.id;
                  if (tcd.function?.name) acc.name += tcd.function.name;
                  if (tcd.function?.arguments) acc.args += tcd.function.arguments;
                }
              }
              // Only stream content on the final (non-tool) turn.
              if (delta.content) { content += delta.content; if (!sawTool) send(delta.content); }
            }
          }

          const toolList = Object.values(toolAcc);
          if (toolList.length) {
            convo.push({ role: 'assistant', content: content || '', tool_calls: toolList.map((tc) => ({ id: tc.id, type: 'function', function: { name: tc.name, arguments: tc.args } })) });
            for (const tc of toolList) {
              let parsed: Record<string, unknown> = {};
              try { parsed = JSON.parse(tc.args || '{}'); } catch { /* ignore */ }
              const out = runTool(tc.name, parsed) as Record<string, unknown>;
              // Surface the draft links to the client so it can show send buttons.
              if (tc.name === 'capture_enquiry' && out.ok) {
                actions = { whatsapp: out.whatsapp as string, mailto: out.mailto as string, call: out.call as string };
              }
              convo.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(out) });
            }
            continue;
          }

          if (!content) send('How can I help you plan your feast?');
          break;
        }
        if (actions) send(ACTIONS_SEP + JSON.stringify({ actions }));
        controller.close();
      } catch (err) {
        console.error('[chat] error', err);
        try { send('Something went wrong on my side. Please call 8012678719 or use the enquiry form.'); } catch { /* stream closed */ }
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: STREAM_HEADERS });
}

const STREAM_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
};
