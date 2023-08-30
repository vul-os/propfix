import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}`;

export async function createBuilding(buildingData, idToken) {
  try {
    const params = [buildingData, idToken];
    return await jsonRpcRequest('Buildings.CreateBuilding', params, idToken);
  } catch (error) {
    console.error('Error creating building:', error);
    return null;
  }
}

export async function updateBuilding(buildingId, buildingData, idToken) {
  try {
    const params = [buildingId, buildingData, idToken];
    return await jsonRpcRequest('Buildings.UpdateBuilding', params, idToken);
  } catch (error) {
    console.error('Error updating building:', error);
    return null;
  }
}

export async function deleteBuilding(buildingId, idToken) {
  try {
    const params = [buildingId, idToken];
    await jsonRpcRequest('Buildings.DeleteBuilding', params, idToken);
  } catch (error) {
    console.error('Error deleting building:', error);
  }
}

export async function getAllBuildings(idToken) {
  try {
    const params = [idToken];
    return await jsonRpcRequest('Buildings.GetAllBuildings', params, idToken);
  } catch (error) {
    console.error('Error fetching all buildings:', error);
    return [];
  }
}

export async function getBuilding(buildingId, organizationId, idToken) {
  try {
    const params = [{ id: buildingId, organizationId }, idToken];
    return await jsonRpcRequest('Buildings.GetBuilding', params, idToken);
  } catch (error) {
    console.error('Error fetching building:', error);
    return null;
  }
}
