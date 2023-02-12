import React from "react";
import { LoadConfig } from "../../wailsjs/go/backend/App";
import { config as models } from "../../wailsjs/go/models";

export const ConfigContext = React.createContext({
  dark: true,
  expert: false,
});

let config: models.Config;
LoadConfig().then((c) => {
  console.log(`Loaded config: ${JSON.stringify(c)}`);
  config = c;
});

interface Props {
  children: React.ReactNode;
}

export const ConfigProvider = ({ children }: Props) => {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
