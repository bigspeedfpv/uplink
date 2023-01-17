import React from "react";
import { GetVersion } from "../../wailsjs/go/main/App";

export const VersionContext = React.createContext("");
let version: string = "develop";
GetVersion().then((v) => {
  version = v;
});

interface Props {
  children: React.ReactNode;
}

export const VersionProvider = ({ children }: Props) => {
  return (
    <VersionContext.Provider value={version}>
      {children}
    </VersionContext.Provider>
  );
};
