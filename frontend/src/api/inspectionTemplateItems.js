import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createInspectionTemplateItem(item, idToken) {
  try {
    const params = [{item}];
    return await jsonRpcRequest('InspectionTemplateItems.CreateInspectionTemplateItem', params, idToken);
  } catch (error) {
    console.error('Error creating inspection template item:', error);
    return null;
  }
}

export async function updateInspectionTemplateItem(item, idToken) {
  try {
    const params = [{item}];
    return await jsonRpcRequest('InspectionTemplateItems.UpdateInspectionTemplateItem', params, idToken);
  } catch (error) {
    console.error('Error updating inspection template item:', error);
    return null;
  }
}

export async function deleteInspectionTemplateItem(itemId, idToken) {
  try {
    const params = [itemId];
    await jsonRpcRequest('InspectionTemplateItems.DeleteItem', params, idToken);
  } catch (error) {
    console.error('Error deleting inspection template item:', error);
  }
}

export async function getAllInspectionTemplateItems(organizationId, idToken) {
  try {
    const params = [{organizationId}];
    return await jsonRpcRequest('InspectionTemplateItems.GetAllInspectionTemplateItem', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection template items:', error);
    return [];
  }
}

export async function getInspectionTemplateItem(itemId, idToken) {
  try {
    const params = [itemId];
    return await jsonRpcRequest('InspectionTemplateItems.GetItem', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection template item:', error);
    return null;
  }
}
