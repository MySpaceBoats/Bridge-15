export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  try {
    const { email, pdfBase64 } = await request.json();

    if (!email || !pdfBase64) {
      return new Response(JSON.stringify({ error: 'Champs manquants' }), { status: 400, headers: cors });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Adresse email invalide' }), { status: 400, headers: cors });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Réda Sebbani <rsebbani@myspace.boats>',
        to: email,
        subject: 'CV — Réda Sebbani',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#0f0d0a;line-height:1.6">
            <p>Bonjour,</p>
            <p>Veuillez trouver en pièce jointe le CV de <strong>Réda Sebbani</strong>, consultant Digital &amp; IT basé à Casablanca.</p>
            <p style="margin-top:24px">Cordialement,<br>Réda Sebbani<br>
              <a href="mailto:sebbani.reda@gmail.com" style="color:#b07d4a">sebbani.reda@gmail.com</a>
            </p>
          </div>
        `,
        attachments: [{ filename: 'CV-Reda-Sebbani.pdf', content: pdfBase64 }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('Resend error:', err);
      return new Response(JSON.stringify({ error: "Échec de l'envoi" }), { status: 500, headers: cors });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: cors });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Erreur interne' }), { status: 500, headers: cors });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
