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

// Function to fetch all organizations
export async function acceptMemberInvite(organizationId, idToken) {
  try {
    const params = {organizationId};
    return await jsonRpcRequest('Organizations.AcceptMemberInvite', params, idToken);
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}

export async function getAllMembers(organizationId, idToken) {
  try {
    const params = {organizationId};
    return await jsonRpcRequest('Organizations.GetAllMembers', params, idToken);
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}

export async function inviteMember(email, organizationId, idToken) {
  try {
    const params = {email, organizationId};
    return await jsonRpcRequest('Organizations.InviteMember', params, idToken);
  } catch (error) {
    console.error('Error fetching all organizations:', error);
    return [];
  }
}