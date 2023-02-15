import React from "react";
import { LoadConfig } from "../../wailsjs/go/backend/App";
import { config as models } from "../../wailsjs/go/models";

export const ConfigContext = React.createContext({
  dark: true,
  expert: false,
});

let config: models.Config;
LoadConfig().then((c) => {
  config = c;
});

interface Props {
  children: React.ReactNode;
}

export function ConfigProvider({ children }: Props) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}
