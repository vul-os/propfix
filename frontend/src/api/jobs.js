import { supabase } from './supabase'; // Update the path as needed

// Function to fetch job data by ID
export async function getJob(jobId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId);

      if (error) {
        console.error('Error fetching job:', error);
        return null;
      }
  
      return data[0] || null;
    } catch (error) {
      console.error('Error fetching job:', error);
      return null;
    }
  }
  
  // Function to create a new job
  export async function createJob(job) {
    try {
      console.log(job);
      const { data, error } = await supabase
        .from('jobs')
        .insert([job], { returning: 'representation' }) // returning the full row after insertion
        .single()
        .select()
  
      if (error) {
        console.error('Error creating job:', error);
        return null;
      }
  
      const jobId = data?.id;
      console.log(data);
  
    if (jobId) {
      // Get the ID of the "New Jobs" column
      const { data: columnData, error: columnError } = await supabase
        .from('columns')
        .select('id')
        .eq('name', 'New Jobs')
        .eq('organization_id', job.organization_id)
        .single()
        .select()

      if (columnError) {
        console.error('Error fetching column:', columnError);
        return jobId;  // We still return the jobId even if adding to column fails
      }

      const columnId = columnData?.id;

      if (columnId) {
        // Insert the job ID into the column_jobs table linking it to the "New Jobs" column
        const { error: linkError } = await supabase
          .from('column_jobs')
          .insert([{ column_id: columnId, job_id: jobId, order_index: 0}])
          .select()
        if (linkError) {
          console.error('Error linking job to column:', linkError);
          return jobId;  // We still return the jobId even if adding to column fails
        }
      }
    }

    return jobId;
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
}


// Function to update an existing job
export async function updateJob(job) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .upsert([job], { onConflict: ['id'] })
      .single();

    if (error) {
      console.error('Error updating job:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating job:', error);
    return null;
  }
}

// Function to delete a job by ID
export async function deleteJob(jobId) {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
    }
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}

// Function to close a job by ID
export async function closeJob(jobId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error closing job:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error closing job:', error);
    return null;
  }
}

// Function to reopen a job by ID
export async function reOpenJob(jobId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ status: 'open' })
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error reopening job:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error reopening job:', error);
    return null;
  }
}

// Function to add a pending tenant email to a job
export async function addPendingTenantEmail(email, jobId) {
  try {
    console.log()
    return null
  } catch (error) {
    console.error('Error adding pending tenant email:', error);
    return null;
  }
}

// Function to fetch all jobs
export async function getAllJobs(organizationId) {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('organizationId', organizationId);

    if (error) {
      console.error('Error fetching all jobs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
}

// Function to fetch the Kanban board for jobs
export async function getBoard(organizationId) {
  try {
    const { data, error } = await supabase
      .from('kanban_board')
      .select('*')
      .eq('organizationId', organizationId);

    if (error) {
      console.error('Error fetching Kanban board:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching Kanban board:', error);
    return [];
  }
}
