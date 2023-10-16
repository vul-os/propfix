import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function getAllSettings(organizationId, idToken) {
  try {
    const params = [{ organizationId }];
    return await jsonRpcRequest('Settings.GetAllSettings', params, idToken);
  } catch (error) {
    console.error('Error fetching labels:', error);
    return [];
  }
}


