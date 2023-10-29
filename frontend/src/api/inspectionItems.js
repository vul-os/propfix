import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createInspectionItem(item, idToken) {
  try {
    const params = [item];
    return await jsonRpcRequest('InspectionItems.CreateItem', params, idToken);
  } catch (error) {
    console.error('Error creating inspection item:', error);
    return null;
  }
}

export async function updateInspectionItem(itemId, itemData, idToken) {
  try {
    const params = [itemId, itemData];
    return await jsonRpcRequest('InspectionItems.UpdateItem', params, idToken);
  } catch (error) {
    console.error('Error updating inspection item:', error);
    return null;
  }
}

export async function deleteInspectionItem(itemId, idToken) {
  try {
    const params = [itemId];
    await jsonRpcRequest('InspectionItems.DeleteItem', params, idToken);
  } catch (error) {
    console.error('Error deleting inspection item:', error);
  }
}

export async function getAllInspectionItems(inspectionId, idToken) {
  try {
    const params = [{inspectionId}];
    return await jsonRpcRequest('InspectionItems.GetAllInspectionItems', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection items:', error);
    return [];
  }
}

export async function getInspectionItem(itemId, idToken) {
  try {
    const params = [itemId];
    return await jsonRpcRequest('InspectionItems.GetItem', params, idToken);
  } catch (error) {
    console.error('Error fetching inspection item:', error);
    return null;
  }
}
