import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;


export async function getBoard(idToken, organizationId) {
  try {
    const params = [{organizationId}];

    return await jsonRpcRequest('Board.GetKanbanBoard', params, idToken);
  } catch (error) {
    console.error('Error fetching all jobs:', error);
    return [];
  }
}
