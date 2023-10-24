import { supabase } from './supabase'; // Make sure the path is correct

export async function getBoard(organizationId) {
  try {
    console.log(organizationId)
    const { data, error } = await supabase.rpc('get_board', { org_id: organizationId });

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
