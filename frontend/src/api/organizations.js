import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client'; // Adjust the path based on your project's structure

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

// Function to fetch organization data by ID
export async function getOrganization(organizationId, idToken) {
  try {
    const params = [organizationId, idToken];
    return await jsonRpcRequest('Organizations.GetOrganization', params, idToken);
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
}

// Function to fetch all organizations
export async function getAllOrganizations(idToken) {
  try {
    const params = {};
    return await jsonRpcRequest('Organizations.GetAllOrganizations', [{}], idToken);
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}

// Function to accept a member invite
export async function acceptMemberInvite(organizationId, idToken) {
  try {
    const params = { organizationId };
    return await jsonRpcRequest('Organizations.AcceptMemberInvite', params, idToken);
  } catch (error) {
    console.error('Error accepting member invite:', error);
    return null;
  }
}

// Function to fetch all members and pending members for an organization
export async function getAllMembers(organizationId, idToken) {
  try {
    const params = { organizationId };
    return await jsonRpcRequest('Organizations.GetAllMembers', params, idToken);
  } catch (error) {
    console.error('Error fetching all members:', error);
    return [];
  }
}

// Function to invite a member to an organization
export async function inviteMember(email, organizationId, idToken) {
  try {
    const params = { email, organizationId };
    return await jsonRpcRequest('Organizations.InviteMember', params, idToken);
  } catch (error) {
    console.error('Error inviting a member:', error);
    return null;
  }
}

// Function to remove a member from an organization
export async function removeMember(userId, organizationId, idToken) {
  try {
    const params = { userId, organizationId };
    await jsonRpcRequest('Organizations.RemoveMember', params, idToken);

    // Log the removed member
    console.log(`Removed member with ID: ${userId}`);
  } catch (error) {
    console.error('Error removing member:', error);
  }
}


// Function to remove a pending member from an organization
export async function removePendingMember(email, organizationId, idToken) {
  try {
    const params = [{ email, organizationId }];
    await jsonRpcRequest('Organizations.RemovePendingMember', params, idToken);
  } catch (error) {
    console.error('Error removing pending member:', error);
  }
}

