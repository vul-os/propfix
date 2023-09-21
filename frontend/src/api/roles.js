// roles.js

import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}/api/authenticated`;

export async function createRole(roleName, idToken) {
  try {
    const params = [{ roleName }];
    return await jsonRpcRequest('Roles.CreateRole', params, idToken);
  } catch (error) {
    console.error('Error creating role:', error);
    return null;
  }
}

export async function updateRole(roleName, idToken) {
  try {
    const params = [{ roleName }];
    return await jsonRpcRequest('Roles.UpdateRole', params, idToken);
  } catch (error) {
    console.error('Error updating role:', error);
    return null;
  }
}

export async function deleteRole(roleId, idToken) {
  try {
    const params = [{ roleId }];
    await jsonRpcRequest('Roles.DeleteRole', params, idToken);
  } catch (error) {
    console.error('Error deleting role:', error);
  }
}

export async function getAllRoles(organizationId, idToken) {
  try {
    const params = [{ organizationId }];
    return await jsonRpcRequest('Roles.GetAllRoles', params, idToken);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

export async function getRole(roleId, organizationId, idToken) {
  try {
    const params = [{ roleId, organizationId }, idToken];
    return await jsonRpcRequest('Roles.GetRole', params, idToken);
  } catch (error) {
    console.error('Error fetching role:', error);
    return null;
  }
}

export async function addMember(roleId, userId, idToken) {
    try {
      const params = [{ roleId, userId }];
      return await jsonRpcRequest('Roles.AddMember', params, idToken);
    } catch (error) {
      console.error('Error adding member to role:', error);
      return null;
    }
  }
  
  export async function removeMember(roleId, userId, idToken) {
    try {
      const params = [{ roleId, userId }];
      return await jsonRpcRequest('Roles.RemoveMember', params, idToken);
    } catch (error) {
      console.error('Error removing member from role:', error);
      return null;
    }
  }

  export async function getFirstRole(organizationId, idToken) {
    try {
      const params = [{ organizationId }];
      return await jsonRpcRequest('Roles.GetFirstRole', params, idToken);
    } catch (error) {
      console.error('Error removing member from role:', error);
      return null;
    }
  }