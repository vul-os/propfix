import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function getAllSettings(organizationId, idToken) {
  try {
    const params = [{ organizationId }];
    return await jsonRpcRequest('Settings.GetAllSettings', params, idToken);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return [];
  }
}

export async function createSetting(setting, idToken) {
  try {
    return await jsonRpcRequest('Settings.CreateSetting', [{ setting }], idToken);
  } catch (error) {
    console.error('Error creating setting:', error);
    throw error; // You may choose to handle the error differently
  }
}

export async function updateSetting(setting, idToken) {
  try {
    return await jsonRpcRequest('Settings.UpdateSetting', [{ setting }], idToken);
  } catch (error) {
    console.error('Error updating setting:', error);
    throw error; // You may choose to handle the error differently
  }
}

export async function deleteSetting(settingId, idToken) {
  try {
    return await jsonRpcRequest('Settings.DeleteSetting', [{ id: settingId }], idToken);
  } catch (error) {
    console.error('Error deleting setting:', error);
    throw error; // You may choose to handle the error differently
  }
}

export async function getSetting(settingId, idToken) {
  try {
    return await jsonRpcRequest('Settings.GetSetting', [{ id: settingId }], idToken);
  } catch (error) {
    console.error('Error fetching a setting:', error);
    throw error; // You may choose to handle the error differently
  }
}
