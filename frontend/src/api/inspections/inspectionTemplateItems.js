import { supabase } from '../supabase'; // Update the path as needed.

export async function createInspectionTemplateItem(item) {
  try {
    const { data, error } = await supabase
      .from('inspection_template_items')
      .insert([item])
      .single()
      .select();

    if (error) {
      console.error('Error creating inspection template item:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating inspection template item:', error);
    return null;
  }
}

export async function updateInspectionTemplateItem(item) {
  try {
    const { data, error } = await supabase
      .from('inspection_template_items')
      .upsert([item], { onConflict: 'id' })
      .single()
      .select();

    if (error) {
      console.error('Error updating inspection template item:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating inspection template item:', error);
    return null;
  }
}

export async function deleteInspectionTemplateItem(id) {
  try {
    const { error } = await supabase
      .from('inspection_template_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inspection template item:', error);
      return null;
    }

    return true;
  } catch (error) {
    console.error('Error deleting inspection template item:', error);
    return null;
  }
}


export async function getAllInspectionTemplateItems(inspectionTemplateGroupId) {
  try {
    // Fetch all inspection templates for the given group ID
    const { data: templates, error: templatesError } = await supabase
      .from('inspection_templates')
      .select('id')
      .eq('inspection_template_group_id', inspectionTemplateGroupId);

    if (templatesError) {
      console.error('Error fetching inspection templates:', templatesError);
      return [];
    }

    // If there are no templates for the given group, return an empty list
    if (!templates.length) return [];

    // Extract template IDs from the fetched templates
    const templateIds = templates.map(template => template.id);

    // Fetch all inspection template items that match the retrieved template IDs
    const { data: items, error: itemsError } = await supabase
      .from('inspection_template_items')
      .select('*')
      .in('inspection_template_id', templateIds);

    if (itemsError) {
      console.error('Error fetching inspection template items:', itemsError);
      return [];
    }

    return items; // directly return the list of items
  } catch (error) {
    console.error('Error fetching inspection template items by group:', error);
    return [];
  }
}

export async function getInspectionTemplateItem(itemId) {
  try {
    const { data, error } = await supabase
      .from('inspection_template_items')
      .select('*')
      .eq('id', itemId);

    if (error) {
      console.error('Error fetching inspection template item:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching inspection template item:', error);
    return null;
  }
}
