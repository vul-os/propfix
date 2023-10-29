import { supabase } from './supabase'; // Update the path as needed

// Function to create a new building
export async function createBuilding(building) {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .upsert([building])
      .single();

    if (error) {
      console.error('Error creating building:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error creating building:', error);
    return null;
  }
}

// Function to update an existing building by ID
export async function updateBuilding(building) {
  try {
    const { data, error } = await supabase
      .from('buildings')
      .upsert([building], { onConflict: ['id'] })
      .eq('id', building.id)
      .single();

    if (error) {
      console.error('Error updating building:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error updating building:', error);
    return null;
  }
}

// Function to delete a building by ID
export async function deleteBuilding(id) {
  try {
    const { error } = await supabase
      .from('buildings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting building:', error);
    }
  } catch (error) {
    console.error('Error deleting building:', error);
  }
}

// Function to fetch all buildings based on parameters
export async function getAllBuildings(latitude, longitude, search, organizationId) {
  try {
    const query = supabase.from('buildings').select('*').like('name', `%${search}%`); // Assuming 'name' is the field to search

    if (organizationId) {
      query.eq('organization_id', organizationId);
    }

    if (latitude && longitude) {
      query
        .gte('latitude', latitude - 0.01) // Example range for latitude
        .lte('latitude', latitude + 0.01)
        .gte('longitude', longitude - 0.01) // Example range for longitude
        .lte('longitude', longitude + 0.01);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching buildings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return [];
  }
}

// Function to fetch a building by ID
export async function getBuilding(buildingId, organizationId) {
  try {
    const query = supabase.from('buildings').select('*').eq('id', buildingId);

    if (organizationId) {
      query.eq('organizationId', organizationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching building:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching building:', error);
    return null;
  }
}
