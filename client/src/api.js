import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
});

// Add a request interceptor to attach the token and workspace ID
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('wf_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // We assume the active workspace ID is stored in localStorage or passed directly.
    const activeWorkspaceId = localStorage.getItem('wf_workspace');
    if (activeWorkspaceId) {
      config.headers['x-workspace-id'] = activeWorkspaceId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

export const getTransactions = (workspaceId) => api.get('/transactions', { headers: { 'x-workspace-id': workspaceId } });
export const createTransaction = (data, workspaceId) => api.post('/transactions', data, { headers: { 'x-workspace-id': workspaceId } });
export const deleteTransaction = (id, workspaceId) => api.delete(`/transactions/${id}`, { headers: { 'x-workspace-id': workspaceId } });

export const getAccounts = (workspaceId) => api.get('/accounts', { headers: { 'x-workspace-id': workspaceId } });
export const createAccount = (data, workspaceId) => api.post('/accounts', data, { headers: { 'x-workspace-id': workspaceId } });
export const deleteAccount = (id, workspaceId) => api.delete(`/accounts/${id}`, { headers: { 'x-workspace-id': workspaceId } });
export const updateAccount = (id, data, workspaceId) => api.put(`/accounts/${id}`, data, { headers: { 'x-workspace-id': workspaceId } });

// Existing auth/workspace APIs if needed
export const getWorkspaces = () => api.get('/workspaces');
export const getBudgets = (workspaceId) => api.get('/budgets', { headers: { 'x-workspace-id': workspaceId } });

export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);
export const googleLogin = (token) => api.post('/auth/google', { token });
export const addTransaction = (data, ws) => createTransaction(data, ws);
export const updateTransaction = (id, data, ws) => api.put(`/transactions/${id}`, data, { headers: { 'x-workspace-id': ws } });
export const addBudget = (data, ws) => api.post('/budgets', data, { headers: { 'x-workspace-id': ws } });
export const updateBudget = (id, data, ws) => api.put(`/budgets/${id}`, data, { headers: { 'x-workspace-id': ws } });
export const deleteBudget = (id, ws) => api.delete(`/budgets/${id}`, { headers: { 'x-workspace-id': ws } });
export const getProfile = () => api.get('/user/profile');
export const updateProfile = (data) => api.put('/user/profile', data);
export const changePassword = (data) => api.put('/user/password', data);
export const getDashStats = (ws) => api.get('/dash/stats', { headers: { 'x-workspace-id': ws } });
export const requestOtp = () => api.post('/user/request-otp');
export const updateAvatar = (data) => api.put('/user/avatar', data);
export const verifyOtpProfileUpdate = (data) => api.post('/user/profile/verify-otp', data);
export const createWorkspace = (data) => api.post('/workspaces', data);
export const inviteToWorkspace = (id, data) => api.post(`/workspaces/${id}/invite`, data);
export const addAccount = (data, ws) => createAccount(data, ws);
