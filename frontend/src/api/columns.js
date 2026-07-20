import { supabase } from './supabase'; // Update the path as needed

// New function to move jobs between columns
export async function moveJobs(sourceColumnId, destinationColumnId, jobIds) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ columnId: destinationColumnId })
      .in('id', jobIds)
      .eq('columnId', sourceColumnId);

    if (error) {
      console.error('Error moving jobs:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error moving jobs:', error);
    return null;
  }
}
