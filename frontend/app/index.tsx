// frontend/app/index.tsx
// Root redirect element that redirects unauthenticated users to /login

import React from 'react';
import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  return <Redirect href="/login" />;
}
