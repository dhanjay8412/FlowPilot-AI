import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Workspace } from '@flowpilot/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isAuthenticated: boolean;
}

const getStorageItem = (key: string): string | null => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    localStorage.removeItem(key);
  }
};

const initialToken = getStorageItem('flowpilot_token');

const initialState: AuthState = {
  user: null,
  token: initialToken,
  currentWorkspace: null,
  workspaces: [],
  isAuthenticated: !!initialToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string; workspace?: Workspace; workspaces?: Workspace[] }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (action.payload.workspace) {
        state.currentWorkspace = action.payload.workspace;
      }
      if (action.payload.workspaces) {
        state.workspaces = action.payload.workspaces;
      }
      setStorageItem('flowpilot_token', action.payload.token);
      if (state.currentWorkspace) {
        setStorageItem('flowpilot_workspace_id', state.currentWorkspace.id);
      }
    },
    setCurrentWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.currentWorkspace = action.payload;
      setStorageItem('flowpilot_workspace_id', action.payload.id);
    },
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
      if (!state.currentWorkspace && action.payload.length > 0) {
        state.currentWorkspace = action.payload[0];
        setStorageItem('flowpilot_workspace_id', action.payload[0].id);
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.currentWorkspace = null;
      state.workspaces = [];
      state.isAuthenticated = false;
      removeStorageItem('flowpilot_token');
      removeStorageItem('flowpilot_workspace_id');
    },
  },
});

export const { setCredentials, setCurrentWorkspace, setWorkspaces, logout } = authSlice.actions;
export default authSlice.reducer;
