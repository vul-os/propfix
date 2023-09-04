import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function moveJob(sourceColumnId, destinationColumnId, jobId, newOrderIndex, idToken) {
  try {
    const params = {
      sourceColumnId,
      destinationColumnId,
      jobId,
      newOrderIndex
    };
    return await jsonRpcRequest('ColumnJobLinks.MoveJob', params, idToken);
  } catch (error) {
    console.error('Error moving job:', error);
    return false;
  }
}

export async function addJobToFirstColumn(organizationId, jobId, idToken) {
  try {
    const params = {
      organizationId,
      jobId
    };
    return await jsonRpcRequest('ColumnJobLinks.AddJobToFirstColumn', params, idToken);
  } catch (error) {
    console.error('Error adding job to first column:', error);
    return false;
  }
}

export async function removeJobs(columnId, jobIdsToRemove, idToken) {
  try {
    const params = {
      columnId,
      jobIdsToRemove
    };
    return await jsonRpcRequest('ColumnJobLinks.RemoveJobs', params, idToken);
  } catch (error) {
    console.error('Error removing jobs:', error);
    return false;
  }
}

export async function getAllColumns(organizationId, idToken) {
  try {
    const params = {
      organizationId
    };
    return await jsonRpcRequest('ColumnJobLinks.GetAllColumns', params, idToken);
  } catch (error) {
    console.error('Error fetching columns:', error);
    return [];
  }
}
