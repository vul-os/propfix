import { supabase } from './supabase'; // Update the path as needed

export async function createLabel(label) {
  try {
    const { data, error } = await supabase
      .from('labels')
      .upsert([label])
      .single()
      .select()

    if (error) {
      console.error('Error creating label:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating label:', error);
    return null;
  }
}

export async function updateLabel(label) {
  try {
    const { data, error } = await supabase
      .from('labels')
      .upsert([label], { onConflict: ['id'] })
      .single()
      .select()

    if (error) {
      console.error('Error updating label:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating label:', error);
    return null;
  }
}

export async function deleteLabel(id) {
  try {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting label:', error);
    }
  } catch (error) {
    console.error('Error deleting label:', error);
  }
}

export async function getAllLabels(organizationId) {
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching labels:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching labels:', error);
    return [];
  }
}

export async function getLabel(labelId, organizationId) {
  try {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('id', labelId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching label:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching label:', error);
    return null;
  }
}
