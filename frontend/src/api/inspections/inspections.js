import config from '../../config/config';
import { jsonRpcRequest } from '../jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createInspection(inspection, idToken) {
  try {
    const params = [inspection];
    return await jsonRpcRequest('Inspections.CreateInspection', params, idToken);
  } catch (error) {
    console.error('Error creating inspection:', error);
    return null;
  }
}

export async function updateInspection(inspectionId, inspectionData, idToken) {
  try {
    const params = [inspectionId, inspectionData];
    return await jsonRpcRequest('Inspections.UpdateInspection', params, idToken);
  } catch (error) {
    console.error('Error updating inspection:', error);
    return null;
  }
}

export async function deleteInspection(inspectionId, idToken) {
  try {
    const params = [inspectionId];
    await jsonRpcRequest('Inspections.DeleteInspection', params, idToken);
  } catch (error) {
    console.error('Error deleting inspection:', error);
  }
}

export async function getAllInspections(organizationId, idToken) {
  try {
    const params = [{organizationId}];
    return await jsonRpcRequest('Inspections.GetAllInspections', params, idToken);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return [];
  }
}

export async function getInspection(inspectionId, idToken) {
  try {
    const params = [inspectionId];
    return await jsonRpcRequest('Inspections.GetInspection', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    return null;
  }
}
