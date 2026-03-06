import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "https://ertqitgfdttphtfhpuzy.supabase.co",
  process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_nwS9rRHd5mz4I7-GGL7oCg_3HpXjqqJ"
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { bookingId } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Booking ID is required' });
  }

  try {
    // First verify the booking exists
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: 'Bokningen hittades inte' });
    }

    // Delete the booking
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      console.error('Delete error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true, message: 'Bokningen har avbokats' });
  } catch (error) {
    console.error('Cancel error:', error);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
}
