import axios from 'axios';
import config from '../config/config';

// Define the base URL for the API
const BASE_URL = `${config.apiUrl}`;

export async function moveJob(jobId, sourceId, targetId, token) {
    try {
      const response = await axios.post(
        `${BASE_URL}/columns/move-job`,
        { jobId, sourceId, targetId },
        { headers: { Authorization: token } }
      );
      return response.data;
    } catch (error) {
      throw new Error('Failed to move job');
    }
}
  
// export async function createColumn(columnData, token) {
//   try {
//     const response = await axios.post(`${BASE_URL}/columns`, columnData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to create column');
//   }
// }

// export async function getColumn(columnId, token) {
//   try {
//     const response = await axios.get(`${BASE_URL}/columns/${columnId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error('Column not found');
//   }
// }

// export async function updateColumn(columnData, token) {
//   try {
//     const response = await axios.put(`${BASE_URL}/columns`, columnData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to update column');
//   }
// }

// export async function deleteColumn(columnId, token) {
//   try {
//     await axios.delete(`${BASE_URL}/columns/${columnId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//   } catch (error) {
//     throw new Error('Failed to delete column');
//   }
// }
