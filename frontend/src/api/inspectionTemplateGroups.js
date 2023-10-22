import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createInspectionTemplateGroup(inspectionTemplateGroup, idToken) {
  try {
    const params = [{inspectionTemplateGroup}];
    return await jsonRpcRequest('InspectionTemplateGroups.CreateInspectionGroup', params, idToken);
  } catch (error) {
    console.error('Error creating inspection area:', error);
    return null;
  }
}
