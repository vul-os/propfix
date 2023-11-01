import { snakeKeys } from 'js-convert-case';
import { supabase } from './supabase'; // Update the path as needed

// Function to create a new event
export async function createEvent(event) {
  try {
    const { data, error } = await supabase.rpc('create_event', { p_event: snakeKeys(event) });

    if (error) {
      console.error('Error fetching events:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    return null;
  }
}

// Function to fetch all events for a job
export async function getAllEvents(jobId) {
  try {
    const { data, error } = await supabase.rpc('get_events', { j_id: jobId });

    if (error) {
      console.error('Error fetching events:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error fetching events:', error);
    return null;
  }
}

