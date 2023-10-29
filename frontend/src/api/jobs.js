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

export async function getJobAttachments(jobId) {
  try {
    const { data, error } = await supabase
      .from('job_attachments')
      .select()
      .eq('job_id', jobId);

      if (error) {
        console.error('Error fetching job attachments:', error);
        return null;
      }
  
      return data || null;
    } catch (error) {
      console.error('Error fetching job attachments:', error);
      return null;
    }
}
// Function to create a new job
export async function createJob(job) {
    try {
      const { data, error } = await supabase.rpc('create_job', { p_job: job });
  
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


export async function updateJob(job) {
  console.log(job)
  try {
    const {
      id,
      name,
      description,
      rentPaid,
      hours,
      cost,
      priority,
      organizationId,
      unitIdentifier,
      labelIds,
      buildingId,
      assigneeIds,
      attachments,
      pendingTennantEmails,
      tenantIds
    } = job;
    const updateObj = { 
      j_id: id,
      'name': name,
      'description': description,
      rent_paid: rentPaid,
      'hours': hours,
      'cost': cost,
      'priority': priority,
      organization_id: organizationId,
      unit_identifier: unitIdentifier,
      building_id: buildingId,
      label_ids: labelIds,
      assignee_ids: assigneeIds,
      tenant_emails: pendingTennantEmails,
      tenant_ids: tenantIds,
      'attachments': attachments,
    }
    // Use map to convert undefined values to null
    const updatedObj = Object.fromEntries(
      Object.keys(updateObj).map((key) => [key, updateObj[key] === undefined ? null : updateObj[key]])
    );

    console.log("updateObj: ", updatedObj)
    const { data, error } = await supabase.rpc('update_job', updatedObj);

    if (error || !data) {
      console.error('Error fetching board:', error);
      return null;
    }
    return {"success": true} || null;
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
