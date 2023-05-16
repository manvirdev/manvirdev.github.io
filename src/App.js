import React from 'react';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import Home from './components/Home';
import Report from './components/reports/Report';

const router = createHashRouter([
  {
    path: '/',
    element: <Report />,
  },
  {
    path: '/report',
    element: <Report />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
