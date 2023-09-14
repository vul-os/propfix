import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createLabel(label, idToken) {
  try {
    const params = [{label}];
    return await jsonRpcRequest('Labels.CreateLabel', params, idToken);
  } catch (error) {
    console.error('Error creating label:', error);
    return null;
  }
}

export async function updateLabel(label, idToken) {
  try {
    const params = [{label}];
    return await jsonRpcRequest('Labels.UpdateLabel', params, idToken);
  } catch (error) {
    console.error('Error updating label:', error);
    return null;
  }
}

export async function deleteLabel(id, idToken) {
  try {
    const params = [{id}];
    await jsonRpcRequest('Labels.DeleteLabel', params, idToken);
  } catch (error) {
    console.error('Error deleting label:', error);
  }
}

export async function getAllLabels(organizationId, idToken) {
  try {
    const params = [{ organizationId }];
    return await jsonRpcRequest('Labels.GetAllLabels', params, idToken);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return [];
  }
}

export async function getLabel(labelId, organizationId, idToken) {
  try {
    const params = [{ id: labelId, organizationId }, idToken];
    return await jsonRpcRequest('Labels.GetLabel', params, idToken);
  } catch (error) {
    console.error('Error fetching label:', error);
    return null;
  }
}
