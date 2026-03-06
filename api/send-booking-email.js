import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Endast tillåt POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, date, dayName, time, bookingId, laneNumber, activityType } = req.body;

  if (!email || !date || !dayName || !time || !bookingId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cancelUrl = `https://www.bokatargetarena.se/cancel?id=${bookingId}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Target Arena <noreply@bokatargetarena.se>',
      to: [email],
      subject: '🎯 Bokningsbekräftelse - Target Arena',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
          <div style="background: white; border-radius: 10px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #1a1f35; margin-bottom: 20px;">🎯 Bokningsbekräftelse</h1>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Din bokningsförfrågan är skapad! Bokningen blir genomförd först när Swish-betalningen är registrerad.
            </p>
            
            <div style="background: #e8f4f8; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="margin: 5px 0; font-size: 15px;"><strong>📅 Datum:</strong> ${date}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong>📆 Dag:</strong> ${dayName}</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong>🕒 Tid:</strong> ${time}</p>
              ${activityType ? `<p style="margin: 5px 0; font-size: 15px;"><strong>🎯 Aktivitet:</strong> ${activityType}</p>` : ''}
              ${laneNumber ? `<p style="margin: 5px 0; font-size: 15px;"><strong>🎯 Bana:</strong> ${laneNumber}</p>` : ''}
              <p style="margin: 5px 0; font-size: 15px;"><strong>💳 Betalning:</strong> Väntar på Swish (bokning blir aktiv först när betalning är klar)</p>
              <p style="margin: 5px 0; font-size: 15px;"><strong>📱 Swish:</strong> 123 178 54 92</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Vi ser fram emot att välkomna dig till Target Arena!
            </p>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${cancelUrl}" style="display: inline-block; padding: 12px 24px; background: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                Avboka bokning
              </a>
            </div>
            
            <p style="font-size: 12px; color: #999; text-align: center; margin-top: 10px;">
              Behöver du avboka? Klicka på knappen ovan eller använd denna länk:<br/>
              <a href="${cancelUrl}" style="color: #3b82f6;">${cancelUrl}</a>
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #999;">
              Om du har frågor, kontakta oss på info@targetarena.se
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
