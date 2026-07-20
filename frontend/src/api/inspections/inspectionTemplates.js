import { supabase } from '../supabase'; // Update the path as needed.

export async function createInspectionTemplate(template) {
  try {
    const { data, error } = await supabase
      .from('inspection_templates')
      .insert([template])
      .single()
      .select();

    if (error) {
      console.error('Error creating inspection template:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating inspection template:', error);
    return null;
  }
}

export async function updateInspectionTemplate(templateId, templateData) {
  try {
    const { data, error } = await supabase
      .from('inspection_templates')
      .update(templateData)
      .eq('id', templateId)
      .single()
      .select();

    if (error) {
      console.error('Error updating inspection template:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating inspection template:', error);
    return null;
  }
}

export async function deleteInspectionTemplate(id) {
  try {
    const { error } = await supabase
      .from('inspection_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inspection template:', error);
      return null;
    }

    return true;
  } catch (error) {
    console.error('Error deleting inspection template:', error);
    return null;
  }
}

export async function getAllInspectionTemplates(inspectionTemplateGroupId) {
  try {
    const { data, error } = await supabase
      .from('inspection_templates')
      .select('*')
      .eq('inspection_template_group_id', inspectionTemplateGroupId);

    if (error) {
      console.error('Error fetching inspection templates:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching inspection templates:', error);
    return [];
  }
}

export async function getInspectionTemplate(templateId) {
  try {
    const { data, error } = await supabase
      .from('inspection_templates')
      .select('*')
      .eq('id', templateId);

    if (error) {
      console.error('Error fetching inspection template:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching inspection template:', error);
    return null;
  }
}
