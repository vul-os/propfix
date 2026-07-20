import { supabase } from './supabase'; // Make sure the path is correct

export async function getBoard(organizationId) {
  const oId = organizationId === "" ? null : organizationId
  try {
    const { data, error } = await supabase.rpc('get_board', { org_id: oId });

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
