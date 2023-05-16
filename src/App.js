import React from 'react';
import { createHashRouter, RouterProvider, Route } from 'react-router-dom';

import Home from './components/Home';
import Report from './components/reports/Report';

const router = createHashRouter([
  {
    path: '/',
    element: <Home />,
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
