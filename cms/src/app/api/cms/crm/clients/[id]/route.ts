import { NextRequest, NextResponse } from 'next/server';
import { sc } from '@/lib/db/supabase';
import { verifyAuth } from '@/lib/auth';
import { logActivityServer } from '@/lib/server-activity-logger';

// GET single CRM client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await sc
      .from('crm_clients')
      .select(`
        *,
        contacts:crm_contacts(id, name, phone, email, position, is_primary, notes),
        crm_brands(id, name, logo_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching CRM client:', error);
    return NextResponse.json({ error: 'Failed to fetch client' }, { status: 500 });
  }
}

// PUT update CRM client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { name, pdv_broj, id_broj, websites, notes, contacts } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Update the client
    const { error: clientError } = await sc
      .from('crm_clients')
      .update({
        name,
        pdv_broj: pdv_broj || null,
        id_broj: id_broj || null,
        websites: websites || [],
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (clientError) throw clientError;

    // Handle contacts update if provided
    if (contacts !== undefined) {
      // Delete existing contacts
      await sc
        .from('crm_contacts')
        .delete()
        .eq('client_id', id);

      // Insert new contacts
      if (contacts && contacts.length > 0) {
        const contactsWithClientId = contacts.map((c: { name: string; phone?: string; email?: string; position?: string; is_primary?: boolean; notes?: string }) => ({
          name: c.name,
          phone: c.phone || null,
          email: c.email || null,
          position: c.position || null,
          is_primary: c.is_primary || false,
          notes: c.notes || null,
          client_id: parseInt(id)
        }));

        const { error: contactsError } = await sc
          .from('crm_contacts')
          .insert(contactsWithClientId);

        if (contactsError) {
          console.error('Error inserting contacts:', contactsError);
        }
      }
    }

    // Fetch the complete client with relations
    const { data: fullClient, error: fetchError } = await sc
      .from('crm_clients')
      .select(`
        *,
        contacts:crm_contacts(id, name, phone, email, position, is_primary, notes),
        crm_brands(id, name, logo_url)
      `)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'update',
      entityType: 'crm_client',
      entityId: Number(id),
      entityName: fullClient.name,
      metadata: { updatedFields: Object.keys(body) }
    });

    return NextResponse.json(fullClient);
  } catch (error) {
    console.error('Error updating CRM client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

// DELETE CRM client
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Get client name before deleting
    const { data: existingClient } = await sc
      .from('crm_clients')
      .select('name')
      .eq('id', id)
      .single();

    // Contacts will be deleted automatically due to CASCADE
    const { error } = await sc
      .from('crm_clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Log activity
    await logActivityServer({
      request,
      userId: String(user.id),
      userEmail: user.email,
      action: 'delete',
      entityType: 'crm_client',
      entityId: Number(id),
      entityName: existingClient?.name || 'Unknown',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting CRM client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
