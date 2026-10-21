import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, interest, timeline, plotStatus, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone number are required.' },
        { status: 400 }
      );
    }

    const newLead = {
      id: `lead-${Date.now()}`,
      name: String(name).trim(),
      phone: String(phone).trim(),
      interest: String(interest || 'General Residential Consultation').trim(),
      timeline: timeline ? String(timeline).trim() : 'Immediate / Flexible',
      plot_status: plotStatus ? String(plotStatus).trim() : 'Freehold Land',
      message: message ? String(message).trim() : '',
      submitted_at: new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: 'short',
      }),
      status: 'new',
      notes: message ? `Customer message: ${message}` : 'New lead via website contact desk',
    };

    // Insert into Supabase 'leads' table
    const { data, error } = await supabaseServer
      .from('leads')
      .insert([newLead])
      .select()
      .single();

    if (error) {
      console.error('[Supabase Contact Error]:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry received and logged to Supabase CRM.',
        lead: data,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('[API /api/contact Exception]:', err);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, leads: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
