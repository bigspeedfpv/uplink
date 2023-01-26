import React from "react";
import { createRoot } from "react-dom/client";

import { createHashRouter, RouterProvider } from "react-router-dom";

import Root from "./routes/Root";

import "./assets/main.css";
import Welcome from "./routes/Welcome";
import Flash from "./routes/Flash";
import SdCard from "./routes/SdCard";

const container = document.getElementById("root");

const root = createRoot(container!);

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        index: true,
        element: <Welcome />,
      },
      {
        path: "flash",
        element: <Flash />,
      },
      {
        path: "sdcard",
        element: <SdCard />,
      },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
