import config from '../config/config';
import { jsonRpcRequest } from './jsonRpcHelper'; // Adjust the path based on your project's structure

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
