export enum ScreenFormat {
  Landscape = "Landscape",
  Portrait = "Portrait",
  ThreeByTwo = "3:2",
  Widescreen = "Widescreen",
}

export type Target = {
  name: string;
  isColor: boolean;
  screenSize: string;
  format: ScreenFormat;
  radios: string[];
};

export const targets: Target[] = [
  {
    name: "c480x272.zip",
    isColor: true,
    screenSize: "480x272",
    format: ScreenFormat.Landscape,
    radios: [
      "Radiomaster TX16S",
      "Jumper T16",
      "Jumper T18",
      "Horus X10S",
      "Horus X12S",
      "most other color screen radios",
    ],
  },
  {
    name: "c480x320.zip",
    isColor: true,
    screenSize: "480x320",
    format: ScreenFormat.ThreeByTwo,
    radios: ["Flysky Paladin PL18", "Flysky Paladin PL18 EV"],
  },
  {
    name: "c320x480.zip",
    isColor: true,
    screenSize: "320x480",
    format: ScreenFormat.Portrait,
    radios: ["Flysky Nirvana NV14", "Flysky Elysium EL18"],
  },
  {
    name: "bw128x64.zip",
    isColor: false,
    screenSize: "128x64",
    format: ScreenFormat.Landscape,
    radios: [
      "Jumper T-Lite/T-Pro",
      "Radiomaster TX12",
      "Radiomaster Zorro",
      "FrSky QX7",
      "FrSky X9 Lite",
      "FrSky X-Lite",
      "BetaFPV LiteRadio 3 Pro",
      "iFlight Commando 8",
    ],
  },
  {
    name: "bw212x64.zip",
    isColor: false,
    screenSize: "212x64",
    format: ScreenFormat.Widescreen,
    radios: ["FrSky X9D Series"],
  },
];
