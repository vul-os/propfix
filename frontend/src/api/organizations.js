import { supabase } from './supabase'; // Update the path as needed

// Function to fetch organization data by ID
export async function getOrganization(organizationId) {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId);

    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }

    return data[0] || null;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

// Function to fetch all organizations
export async function getAllOrganizations() {
  try {
    const { data, error } = await supabase.from('organizations').select('*');

    if (error) {
      console.error('Error fetching all organizations:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}

// Function to accept a member invite
export async function acceptMemberInvite(organizationId) {
  try {
    const { data, error } = await supabase.rpc('accept_invite', { org_id: organizationId });

    if (error) {
      console.error('Error accepting invite:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error fetching board:', error);
    return null;
  }
}

// Function to fetch all members and pending members for an organization
export async function getAllMembers(organizationId) {
  try {
    console.log(organizationId)
    const { data, error } = await supabase.rpc('get_all_members', { org_id: organizationId });

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


// Function to invite a member to an organization
export async function inviteMember(email, organizationId, roleId) {
  try {
    console.log(organizationId)
    const { data, error } = await supabase.rpc('email_invite_to_org', { 
      org_id: organizationId,
      user_email: email,
      r_id: roleId
    });

    if (error) {
      console.error('Error fetching board:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Unexpected error inviting member:', error);
    return null;
  }
}

// Function to remove a member from an organization
export async function removeMember(userId, organizationId) {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error removing member:', error);
    } else {
      // Log the removed member
      console.log(`Removed member with ID: ${userId}`);
    }
  } catch (error) {
    console.error('Error removing member:', error);
  }
}

// Function to remove a pending member from an organization
export async function removePendingMember(email, organizationId) {
  try {
    const { error } = await supabase
      .from('pending_members')
      .delete()
      .eq('email', email)
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error removing pending member:', error);
    }
  } catch (error) {
    console.error('Error removing pending member:', error);
  }
}
