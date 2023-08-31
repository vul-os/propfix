import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}`;

// Existing functions
// ...

// New function to move jobs between columns
export async function moveJobs(sourceColumnId, destinationColumnId, jobIdsToMove, idToken) {
  try {
    const params = [
      {
        sourceColumnId,
        destinationColumnId,
        jobIdsToMove,
      },
      idToken
    ];
    return await jsonRpcRequest('Columns.MoveJobs', params, idToken);
  } catch (error) {
    console.error('Error moving jobs:', error);
    return null;
  }
}
