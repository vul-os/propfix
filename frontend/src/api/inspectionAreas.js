import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createInspectionArea(inspectionArea, idToken) {
  try {
    const params = [inspectionArea];
    return await jsonRpcRequest('InspectionAreas.CreateArea', params, idToken);
  } catch (error) {
    console.error('Error creating inspection area:', error);
    return null;
  }
}

export async function updateInspectionArea(areaId, areaData, idToken) {
  try {
    const params = [areaId, areaData];
    return await jsonRpcRequest('InspectionAreas.UpdateArea', params, idToken);
  } catch (error) {
    console.error('Error updating inspection area:', error);
    return null;
  }
}

export async function deleteInspectionArea(areaId, idToken) {
  try {
    const params = [areaId];
    await jsonRpcRequest('InspectionAreas.DeleteArea', params, idToken);
  } catch (error) {
    console.error('Error deleting inspection area:', error);
  }
}

export async function getAllInspectionAreas(idToken) {
  try {
    const params = [];
    return await jsonRpcRequest('InspectionAreas.GetAllAreas', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection areas:', error);
    return [];
  }
}

export async function getInspectionArea(areaId, idToken) {
  try {
    const params = [areaId];
    return await jsonRpcRequest('InspectionAreas.GetArea', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection area:', error);
    return null;
  }
}
