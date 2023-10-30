import { supabase } from '../supabase'; // Update the path as needed.

export async function getAllInspectionTemplateGroups(organizationId) {
  try {
    const { data, error } = await supabase
      .from('inspection_template_groups')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching inspection template groups:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching inspection template groups:', error);
    return null;
  }
}

export async function updateInspectionTemplateGroup(inspectionTemplateGroup) {
  try {
    const { data, error } = await supabase
      .from('inspection_template_groups')
      .upsert([inspectionTemplateGroup], { onConflict: 'id' })
      .single()
      .select();

    if (error) {
      console.error('Error updating inspection template group:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating inspection template group:', error);
    return null;
  }
}

export async function deleteInspectionTemplateGroup(inspectionTemplateGroupId) {
  try {
    const { error } = await supabase
      .from('inspection_template_groups')
      .delete()
      .eq('id', inspectionTemplateGroupId);

    if (error) {
      console.error('Error deleting inspection template group:', error);
      return null;
    }

    return true;
  } catch (error) {
    console.error('Error deleting inspection template group:', error);
    return null;
  }
}

export async function createInspectionTemplateGroup(inspectionTemplateGroup) {
  try {
    const { data, error } = await supabase
      .from('inspection_template_groups')
      .insert([inspectionTemplateGroup])
      .single()
      .select();

    if (error) {
      console.error('Error creating inspection template group:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating inspection template group:', error);
    return null;
  }
}
