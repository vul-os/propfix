import { supabase } from '../supabase';  // Update the path to your Supabase client as necessary

export async function createInspection(inspection) {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .insert([inspection])
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating inspection:', error);
    return null;
  }
}

export async function updateInspection(inspectionId, inspectionData) {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .update(inspectionData)
      .eq('id', inspectionId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating inspection:', error);
    return null;
  }
}

export async function deleteInspection(inspectionId) {
  try {
    const { error } = await supabase
      .from('inspections')
      .delete()
      .eq('id', inspectionId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting inspection:', error);
  }
}

export async function getAllInspections(organizationId) {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return [];
  }
}

export async function getInspection(inspectionId) {
  try {
    const { data, error } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId);

    if (error) {
      throw error;
    }

    return data ? data[0] : null;
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return null;
  }
}
