import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function DashboardLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
    </>
  );
}
