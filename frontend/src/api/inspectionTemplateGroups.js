import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function getAllInspectionTemplateGroups(organizationId, idToken) {
  try {
    const params = [{organizationId}]; 
    return await jsonRpcRequest('InspectionTemplateGroups.GetAllInspectionTemplateGroups', params, idToken);
  } catch (error) {
    console.error('Error fetching all inspection template groups:', error);
    return null;
  }
}

export async function updateInspectionTemplateGroup(inspectionTemplateGroup, idToken) {
  try {
    const params = [{group: inspectionTemplateGroup}];
    return await jsonRpcRequest('InspectionTemplateGroups.UpdateInspectionTemplateGroup', params, idToken);
  } catch (error) {
    console.error('Error updating inspection template group:', error);
    return null;
  }
}

export async function deleteInspectionTemplateGroup(inspectionTemplateGroupId, idToken) {
  try {
    const params = [{id: inspectionTemplateGroupId}]; // Assuming you just need the group ID to delete
    return await jsonRpcRequest('InspectionTemplateGroups.DeleteInspectionTemplateGroup', params, idToken);
  } catch (error) {
    console.error('Error deleting inspection template group:', error);
    return null;
  }
}

export async function createInspectionTemplateGroup(inspectionTemplateGroup, idToken) {
  try {
    const params = [{group: inspectionTemplateGroup}];
    return await jsonRpcRequest('InspectionTemplateGroups.CreateInspectionTemplateGroup', params, idToken);
  } catch (error) {
    console.error('Error creating inspection area:', error);
    return null;
  }
}
