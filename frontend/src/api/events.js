import { supabase } from './supabase'; // Update the path as needed

// Function to create a new event
export async function createEvent(event) {
  try {
    const { data, error } = await supabase
      .from('events')
      .upsert([event])
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

// Function to update an existing event by ID
export async function updateEvent(eventId, eventData) {
  try {
    const { data, error } = await supabase
      .from('events')
      .upsert([eventData], { onConflict: ['id'] })
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
}

// Function to delete an event by ID
export async function deleteEvent(eventId) {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
    }
  } catch (error) {
    console.error('Error deleting event:', error);
  }
}

// Function to fetch all events for a job
export async function getAllEvents(jobId) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('jobId', jobId);

    if (error) {
      console.error('Error fetching events for job:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching events for job:', error);
    return [];
  }
}

// Function to fetch an event by ID
export async function getEvent(eventId) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId);

    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}
