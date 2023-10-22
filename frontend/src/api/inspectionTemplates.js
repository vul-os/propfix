import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createInspectionTemplate(template, idToken) {
  try {
    const params = [{template}];
    return await jsonRpcRequest('InspectionTemplates.CreateInspectionTemplate', params, idToken);
  } catch (error) {
    console.error('Error creating inspection template:', error);
    return null;
  }
}

export async function updateInspectionTemplate(templateId, templateData, idToken) {
  try {
    const params = [templateId, templateData];
    return await jsonRpcRequest('InspectionTemplates.UpdateTemplate', params, idToken);
  } catch (error) {
    console.error('Error updating inspection template:', error);
    return null;
  }
}

export async function deleteInspectionTemplate(id, idToken) {
  try {
    const params = [{id}];
    await jsonRpcRequest('InspectionTemplates.DeleteInspectionTemplate', params, idToken);
  } catch (error) {
    console.error('Error deleting inspection template:', error);
  }
}

export async function getAllInspectionTemplates(organizationId, idToken) {
  try {
    const params = [{organizationId}];
    return await jsonRpcRequest('InspectionTemplates.GetAllInspectionTemplates', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection templates:', error);
    return [];
  }
}

export async function getInspectionTemplate(templateId, idToken) {
  try {
    const params = [templateId];
    return await jsonRpcRequest('InspectionTemplates.GetTemplate', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection template:', error);
    return null;
  }
}
