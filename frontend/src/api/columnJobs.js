import { supabase } from './supabase'; // Update the path as needed

// Function to move a job between columns
export async function moveJob(sourceColumnId, destinationColumnId, jobId, newOrderIndex, idToken) {
  try {
    // First, delete the job's link to the source column
    const { error: deleteError } = await supabase
      .from('column_jobs')
      .delete()
      .eq('column_id', sourceColumnId)
      .eq('job_id', jobId);
      
    if (deleteError) {
      console.error('Error deleting job link:', deleteError);
      return false;
    }

    // Then, insert a new link between the job and the destination column
    const { error: insertError } = await supabase
      .from('column_jobs')
      .insert({
        column_id: destinationColumnId,
        job_id: jobId,
        order_index: newOrderIndex,
      });

    if (insertError) {
      console.error('Error linking job to new column:', insertError);
      return false;
    }

    return true; // Successfully moved
  } catch (error) {
    console.error('Error moving job:', error);
    return false;
  }
}

// Function to add a job to the first column
export async function addJobToFirstColumn(organizationId, jobId, idToken) {
  try {
    const { data, error } = await supabase
      .from('column_jobs')
      .upsert([
        {
          organizationId,
          jobId,
          columnOrder: 0, // Assuming 0 is the index of the first column
        },
      ])
      .single();

    if (error) {
      console.error('Error adding job to first column:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error adding job to first column:', error);
    return false;
  }
}

// Function to remove jobs from a column
export async function removeJobs(columnId, jobIdsToRemove, idToken) {
  try {
    const { error } = await supabase
      .from('column_jobs')
      .delete()
      .in('jobId', jobIdsToRemove)
      .eq('columnId', columnId);

    if (error) {
      console.error('Error removing jobs:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing jobs:', error);
    return false;
  }
}

// Function to fetch all columns
export async function getAllColumns(organizationId, idToken) {
  try {
    const { data, error } = await supabase
      .from('column_jobs')
      .select('*')
      .eq('organizationId', organizationId);

    if (error) {
      console.error('Error fetching columns:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching columns:', error);
    return [];
  }
}
