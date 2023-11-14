// notifications.js
import { supabase } from './supabase';

export async function createNotification(notification) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .upsert([notification])
      .single()
      .select();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

export async function getAllNotifications() {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*');

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}
