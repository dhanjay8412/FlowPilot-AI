import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { router } from './router';
import { api } from './api/endpoints';
import { setCredentials } from './store/slices/authSlice';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('flowpilot_token');
    if (token) {
      api
        .getMe()
        .then((res) => {
          if (res.data) {
            dispatch(
              setCredentials({
                user: res.data.user,
                token,
                workspaces: res.data.workspaces,
                workspace: res.data.workspaces[0],
              })
            );
          }
        })
        .catch(() => {
          localStorage.removeItem('flowpilot_token');
        });
    }
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export const App: React.FC = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
};
