import { supabase } from './supabase'; // Make sure the path is correct

export async function executeQuery(name, templateDict, organizationId) {
  try {
    const { data, error } = await supabase.rpc('execute_query', {
      p_name: name, p_template_dict: templateDict, p_organization_id: organizationId 
    });

    if (error) {
      console.error('Error fetching board:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error fetching board:', error);
    return null;
  }
}
