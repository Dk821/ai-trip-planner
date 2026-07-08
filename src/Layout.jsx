import React, { Suspense } from "react";
import Header from "./components/custom/Header";
import { Outlet } from "react-router-dom";

function Layout() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="p-10 text-center text-lg font-semibold text-gray-600">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}

export default Layout;
