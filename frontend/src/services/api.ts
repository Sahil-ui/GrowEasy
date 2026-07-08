import axios from 'axios';
import { APIResponse, ImportResponseData } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minute timeout for large CSV AI processing
});

export const importCSV = async (file: File): Promise<ImportResponseData> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<APIResponse>('/api/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  const body = response.data;

  if (!body.success) {
    throw new Error(body.error || 'Import failed');
  }

  return body.data;
};
