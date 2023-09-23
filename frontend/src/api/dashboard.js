import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function executeQuery(name, templateDict, organizationId, idToken) {
  try {
    const params = [{name, templateDict, organizationId}];
    return await jsonRpcRequest('Dashboard.ExecuteQuery', params, idToken);
  } catch (error) {
    console.error('Error creating label:', error);
    return null;
  }
}
