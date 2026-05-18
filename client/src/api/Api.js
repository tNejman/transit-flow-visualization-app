const API_BASE_URL = 'http://localhost:8080/api/v1/map'; // Update with your actual server host/port

// Helper handler to process responses and parse JSON or throw clean errors
async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function getNodes() {
  const response = await fetch(`${API_BASE_URL}/nodes`);
  return handleResponse(response);
}

export async function getNode(id) {
  const response = await fetch(`${API_BASE_URL}/nodes/${id}`);
  return handleResponse(response);
}

export async function getNetwork(dateISO) {
  const response = await fetch(`${API_BASE_URL}/segments?date=${dateISO}`);
  return handleResponse(response);
}

export async function getSegmentDetails(id, dateISO) {
  const response = await fetch(`${API_BASE_URL}/segments/${id}?date=${dateISO}`);
  return handleResponse(response);
}

export async function getSegmentsForNode(nodeId, dateISO) {
  const response = await fetch(`${API_BASE_URL}/nodes/${nodeId}/segments?date=${dateISO}`);
  return handleResponse(response);
}

export async function getStatus(dateISO) {
  const response = await fetch(`${API_BASE_URL}/status?date=${dateISO}`);
  return handleResponse(response);
}