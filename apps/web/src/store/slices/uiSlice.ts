import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarOpen: boolean;
  activeModal: 'createTask' | 'aiTask' | 'summarizeMeeting' | 'addMember' | null;
  notificationPanelOpen: boolean;
}

const initialState: UiState = {
  sidebarOpen: true,
  activeModal: null,
  notificationPanelOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    openModal: (state, action: PayloadAction<UiState['activeModal']>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    toggleNotificationPanel: (state) => {
      state.notificationPanelOpen = !state.notificationPanelOpen;
    },
  },
});

export const { toggleSidebar, openModal, closeModal, toggleNotificationPanel } = uiSlice.actions;
export default uiSlice.reducer;
