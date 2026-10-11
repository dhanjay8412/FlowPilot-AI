import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { OverviewPage } from './pages/OverviewPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { AllTasksPage } from './pages/AllTasksPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DailyReportsPage } from './pages/DailyReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: 'overview', element: <OverviewPage /> },
      { path: 'my-tasks', element: <MyTasksPage /> },
      { path: 'all-tasks', element: <AllTasksPage /> },
      { path: 'meetings', element: <MeetingsPage /> },
      { path: 'team', element: <TeamPage /> },
      { path: 'analytics', element: <AnalyticsPage /> },
      { path: 'daily-reports', element: <DailyReportsPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/overview" replace />,
  },
]);
