import { supabase } from '../supabase';  // Update the path to your Supabase client as necessary


export async function getAllInspection(inspectionId) {
  try {
    const { data, error } = await supabase.rpc('get_inspection_group_details', { p_inspection_id: inspectionId });

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