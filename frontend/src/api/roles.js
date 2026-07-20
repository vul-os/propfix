import { supabase } from './supabase'; // Update the path as needed

export async function createRole(roleName) {
  try {
    const { data, error } = await supabase.from('roles').upsert([{ roleName }]);

    if (error) {
      console.error('Error creating role:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error creating role:', error);
    return null;
  }
}

export async function updateRole(role) {
  try {
    const { data, error } = await supabase
      .from('roles')
      .upsert([role], { onConflict: ['id'] });

    if (error) {
      console.error('Error updating role:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error updating role:', error);
    return null;
  }
}

export async function changeRole(roleId, userId, organizationId) {
  try {
    const { data, error } = await supabase
      .from('roles')
      .update({ user_id: userId })
      .eq('id', roleId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error updating role:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error updating role:', error);
    return null;
  }
}

export async function deleteRole(roleId) {
  try {
    const { error } = await supabase.from('roles').delete().eq('id', roleId);

    if (error) {
      console.error('Error deleting role:', error);
    }
  } catch (error) {
    console.error('Error deleting role:', error);
  }
}

export async function getAllRoles(organizationId) {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

export async function getRole(roleId, organizationId) {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching role:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching role:', error);
    return null;
  }
}

export async function addMember(roleId, userId) {
  try {
    const { data, error } = await supabase
      .from('role_members')
      .upsert([{ role_id: roleId, user_id: userId }]);

    if (error) {
      console.error('Error adding member to role:', error);
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error adding member to role:', error);
    return null;
  }
}

export async function removeMember(roleId, userId) {
  try {
    const { error } = await supabase
      .from('role_members')
      .delete()
      .eq('role_id', roleId)
      .eq('user_id', userId);

    if (error) {
      console.log('Error removing member from role:', error);
    }
  } catch (error) {
    console.log('Error removing member from role:', error);
  }
}

export async function getFirstRole(organizationId) {
  try {
    const { data, error } = await supabase
      .rpc('get_first_user_role_for_org', { org_id: organizationId });

    if (error) {
      console.log('Error fetching first role:', error);
      return null;
    }

    return data?.first_role_name || null;
  } catch (error) {
    console.log('Error fetching first role:', error);
    return null;
  }
}

