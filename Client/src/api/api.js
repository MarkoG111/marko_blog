export const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiClient(path, options = {}) {
    const {
        method = 'GET',
        body,
        skipAuth = false,
        ...rest
    } = options;

    const token = !skipAuth ? localStorage.getItem("token") : null;

    let headers = {};

    // If FormData, do not send Content-Type
    if (body instanceof FormData) {
        delete rest.headers?.["Content-Type"];
    }

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    let requestBody = body;

    // If NOT FormData send JSON
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
    }

    const finalHeaders = {
        ...(rest.headers || {}),
        ...headers
    };

    const response = await fetch(`${API_BASE}${path}`, {
        method,
        headers: finalHeaders,
        body: requestBody,
        ...rest
    });

    if (!response.ok) throw await parseError(response);

    if (response.status === 204) return null;

    return parseResponse(response);
}

async function parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
        return await response.json();
    }

    return response.text();
}

async function parseError(response) {
    const contentType = response.headers.get('content-type');
    let message = `API Error: ${response.status} ${response.statusText}`;
    let details = null;

    if (contentType?.includes('application/json')) {
        details = await response.json();
        message = details.message || details.error || message;
    } else {
        const text = await response.text();
        if (text) {
            message = text;
        }
    }

    const err = new Error(message);
    err.status = response.status;
    err.details = details;
    return err;
}

export const api = {
    get: (path, opts) => apiClient(path, { ...opts, method: 'GET' }),
    post: (path, body, opts) => apiClient(path, { ...opts, method: 'POST', body }),
    put: (path, body, opts) => apiClient(path, { ...opts, method: 'PUT', body }),
    patch: (path, body, opts) => apiClient(path, { ...opts, method: 'PATCH', body }),
    delete: (path, opts) => apiClient(path, { ...opts, method: 'DELETE' })
};
