import React from "react";
import { createRoot } from "react-dom/client";

import { createHashRouter, RouterProvider } from "react-router-dom";

import { Provider } from "react-redux";
import { store } from "./store";

import { VersionProvider } from "./context/version.context";

import Root from "./routes/Root";

import "./assets/main.css";
import Welcome from "./routes/Welcome";
import Flash from "./routes/Flash";
import SdCard from "./routes/SdCard";
import { CheckDfuStatus } from "../wailsjs/go/backend/App";
import { setDfuStatus } from "./features/connection/dfuSlice";
import { ConfigProvider } from "./context/config.context";

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

CheckDfuStatus().then((status) => {
  store.dispatch(setDfuStatus(status));
});

setInterval(() => {
  CheckDfuStatus().then((status) => {
    store.dispatch(setDfuStatus(status));
  });
}, 2500);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider>
        <VersionProvider>
          <RouterProvider router={router} />
        </VersionProvider>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);
