import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function PUT(req: NextRequest) {
  try {
    const { projectId, units, unitInventory } = await req.json();

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'projectId is required' }, { status: 400 });
    }

    // 1. Update headline string in projects table
    const { error: projError } = await supabaseServer
      .from('projects')
      .update({ units })
      .eq('id', projectId);

    if (projError) {
      return NextResponse.json({ success: false, error: projError.message }, { status: 500 });
    }

    // 2. Synchronize unitInventory in project_units table
    if (Array.isArray(unitInventory)) {
      await supabaseServer.from('project_units').delete().eq('project_id', projectId);

      const mapped = unitInventory.map((u: any) => ({
        id: u.id,
        project_id: projectId,
        unit_number: u.unitNumber,
        type: u.type,
        size: u.size,
        status: u.status,
        price: u.price,
        floor: u.floor,
        facing: u.facing,
      }));

      const { error: unitsError } = await supabaseServer.from('project_units').insert(mapped);
      if (unitsError) {
        return NextResponse.json({ success: false, error: unitsError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Real-time units inventory updated in Supabase.',
      projectId,
      units,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
