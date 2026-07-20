import { supabase } from './supabase'; // Update the path as needed

export async function getAllSettings(organizationId) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching settings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
}

export async function createSetting(setting) {
  try {
    const { data, error } = await supabase.from('settings').upsert([setting]).select();

    if (error) {
      console.error('Error creating setting:', error);
      throw error; // You may choose to handle the error differently
    }

    return data?.id;
  } catch (error) {
    console.error('Error creating setting:', error);
    throw error; // You may choose to handle the error differently
  }
}

export async function updateSetting(setting) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .upsert([setting], { onConflict: ['id'] });

    if (error) {
      console.error('Error updating setting:', error);
      throw error; // You may choose to handle the error differently
    }

    return data[0];
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error; // You may choose to handle the error differently
  }
}

export async function deleteSetting(settingId) {
  try {
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('id', settingId);

    if (error) {
      console.error('Error deleting setting:', error);
      throw error; // You may choose to handle the error differently
    }

    return true;
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error; // You may choose to handle the error differently
  }
}

export async function getSetting(settingId) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', settingId);

    if (error) {
      console.error('Error fetching a setting:', error);
      throw error; // You may choose to handle the error differently
    }

    return data[0];
  } catch (error) {
    console.error('Error fetching a setting:', error);
    throw error; // You may choose to handle the error differently
  }
}
