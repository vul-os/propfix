import { snakeKeys } from 'js-convert-case';
import { supabase } from './supabase'; // Update the path as needed

// Function to create a new event
export async function createEvent(event) {
  console.log(snakeKeys(event))
  try {
    const { data, error } = await supabase
      .from('events')
      .upsert([snakeKeys(event)])
      .single()
      .select()

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

// Function to fetch all events for a job
export async function getAllEvents(jobId) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('job_id', jobId)

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

