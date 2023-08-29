import axios from 'axios';
import config from '../../config/config';

const API_BASE_URL = `${config.apiUrl}`;

export async function jsonRpcRequest(method, params, idToken) {
  try {
    const response = await axios.post(
      API_BASE_URL,
      {
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      },
      { headers: { Authorization: idToken } }
    );

    if (response.data && response.data.result !== undefined) {
      return response.data.result;
    }

    if (response.data && response.data.error) {
      throw new Error(response.data.error.message);
    }

    throw new Error('Invalid JSON-RPC response');
  } catch (error) {
    console.error(`Error in JSON-RPC request (${method}):`, error);
    throw error;
  }
}
