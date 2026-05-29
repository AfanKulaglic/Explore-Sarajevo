import { NextRequest, NextResponse } from 'next/server';
import { sc } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

export const dynamic = 'force-dynamic';

// GET all CRM clients (CMS authenticated)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await sc
      .from('crm_clients')
      .select(`
        *,
        contacts:crm_contacts(id, name, phone, email, position, is_primary),
        crm_brands(id, name, logo_url)
      `)
      .order('name', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching CRM clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

// POST create new CRM client
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { name, pdv_broj, id_broj, websites, notes, contacts } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create the client
    const { data: client, error: clientError } = await sc
      .from('crm_clients')
      .insert({
        name,
        pdv_broj: pdv_broj || null,
        id_broj: id_broj || null,
        websites: websites || [],
        notes: notes || null
      })
      .select()
      .single();

    if (clientError) throw clientError;

    // If contacts provided, insert them
    if (contacts && contacts.length > 0) {
      const contactsWithClientId = contacts.map((c: { name: string; phone?: string; email?: string; position?: string; is_primary?: boolean }) => ({
        ...c,
        client_id: client.id
      }));

      const { error: contactsError } = await sc
        .from('crm_contacts')
        .insert(contactsWithClientId);

      if (contactsError) {
        console.error('Error inserting contacts:', contactsError);
      }
    }

    // Fetch the complete client with relations
    const { data: fullClient, error: fetchError } = await sc
      .from('crm_clients')
      .select(`
        *,
        contacts:crm_contacts(id, name, phone, email, position, is_primary)
      `)
      .eq('id', client.id)
      .single();

    if (fetchError) throw fetchError;
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'create',
      entityType: 'crm_client',
      entityId: fullClient.id,
      entityName: fullClient.name,
    });

    return NextResponse.json(fullClient, { status: 201 });
  } catch (error) {
    console.error('Error creating CRM client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
