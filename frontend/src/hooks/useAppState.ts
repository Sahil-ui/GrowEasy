'use client';

import { useReducer, useCallback } from 'react';
import { AppState, AppAction, AppStep, ParsedCSV, ImportResponseData } from '../types';
import { parseCSVFile, validateFile } from '../utils/csvUtils';
import { importCSV } from '../services/api';

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  step: 'IDLE',
  file: null,
  parsedCSV: null,
  importResult: null,
  error: null,
  isProcessing: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'FILE_SELECTED':
      return {
        ...state,
        file: action.payload,
        step: 'FILE_SELECTED',
        parsedCSV: null,
        importResult: null,
        error: null,
        isProcessing: true,
      };

    case 'CSV_PARSED':
      return {
        ...state,
        parsedCSV: action.payload,
        step: 'PREVIEWING',
        isProcessing: false,
        error: null,
      };

    case 'PARSE_ERROR':
      return {
        ...state,
        step: 'ERROR',
        error: action.payload,
        isProcessing: false,
        parsedCSV: null,
        file: null,
      };

    case 'IMPORT_START':
      return {
        ...state,
        step: 'PROCESSING',
        isProcessing: true,
        error: null,
      };

    case 'IMPORT_SUCCESS':
      return {
        ...state,
        step: 'RESULTS',
        importResult: action.payload,
        isProcessing: false,
        error: null,
      };

    case 'IMPORT_ERROR':
      return {
        ...state,
        step: 'ERROR',
        error: action.payload,
        isProcessing: false,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAppState = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const handleFileSelect = useCallback(async (file: File) => {
    // Client-side validation first
    const validationError = validateFile(file);
    if (validationError) {
      dispatch({ type: 'PARSE_ERROR', payload: validationError.message });
      return;
    }

    dispatch({ type: 'FILE_SELECTED', payload: file });

    // Begin client-side CSV parsing for preview
    try {
      const parsed = await parseCSVFile(file);
      dispatch({ type: 'CSV_PARSED', payload: parsed });
    } catch (err: any) {
      dispatch({ type: 'PARSE_ERROR', payload: err.message });
    }
  }, []);

  const handleConfirmImport = useCallback(async (file: File) => {
    dispatch({ type: 'IMPORT_START' });
    try {
      const result = await importCSV(file);
      dispatch({ type: 'IMPORT_SUCCESS', payload: result });
    } catch (err: any) {
      const message =
        err?.response?.data?.error || err?.message || 'An unexpected error occurred.';
      dispatch({ type: 'IMPORT_ERROR', payload: message });
    }
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return { state, handleFileSelect, handleConfirmImport, handleReset };
};
