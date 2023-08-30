import config from '../config/config';
import { jsonRpcRequest } from './jsonrpc/client';

const API_BASE_URL = `${config.apiUrl}`;

export async function createEvent(eventData, idToken) {
  try {
    const params = [eventData, idToken];
    return await jsonRpcRequest('Events.CreateEvent', params, idToken);
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

export async function updateEvent(eventId, eventData, idToken) {
  try {
    const params = [eventId, eventData, idToken];
    return await jsonRpcRequest('Events.UpdateEvent', params, idToken);
  } catch (error) {
    console.error('Error updating event:', error);
    return null;
  }
}

export async function deleteEvent(eventId, idToken) {
  try {
    const params = [eventId, idToken];
    await jsonRpcRequest('Events.DeleteEvent', params, idToken);
  } catch (error) {
    console.error('Error deleting event:', error);
  }
}

export async function getAllEvents(jobId, idToken) {
  try {
    const params = [{ jobId }];
    return await jsonRpcRequest('Events.GetAllEvents', params, idToken);
  } catch (error) {
    console.error('Error fetching events for job:', error);
    return [];
  }
}

export async function getEvent(eventId, idToken) {
  try {
    const params = [{ id: eventId }];
    return await jsonRpcRequest('Events.GetEvent', params, idToken);
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}
