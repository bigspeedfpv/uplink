<p align="center">
    <picture>
        <source media="(prefers-color-scheme: dark)" srcset="./.github/assets/logo-full-dark.svg">
        <img src="./.github/assets/logo-full-light.svg" height="80" alt="Uplink Logo" />
    </picture>
</p>

[![Download](https://img.shields.io/github/downloads/bigspeedfpv/uplink/total?style=for-the-badge)](https://github.com/bigspeedfpv/uplink/releases) [![Last Commit](https://img.shields.io/github/last-commit/bigspeedfpv/uplink?style=for-the-badge)](https://github.com/bigspeedfpv/uplink/commits/) ![Go](https://img.shields.io/github/go-mod/go-version/bigspeedfpv/uplink?style=for-the-badge)

---

## UPLINK IS STILL A WORK IN PROGRESS. Expect things to be broken or missing. Do not use this to update any radios you care about until it is stable!

Uplink is an unofficial firmware flasher and SD card content manager for EdgeTX. It aims to be at feature parity with official EdgeTX tools, such as Flasher and/or Buddy.

Uplink is **NOT** affiliated with [EdgeTX](https://github.com/edgetx). It is not intended to be a replacement for official tools; it is just a passion project. While Uplink should mostly be stable (I am building it mainly for personal use), it may still have bugs. **I am not responsible for anything that happens to your radio as a result of using Uplink, but I am willing to help troubleshoot issues if any do arise.**

### Prebuilt Binaries

Prebuilt binaries will be released as Uplink becomes more finished. For now, refer to the Development section to build Uplink yourself.

## Features

- Easily flash EdgeTX firmware to your radio or update your radio's firmware
- Quickly select language packs and scripts to be installed on your radio's SD card

## Development

Uplink is built with [Wails](https://wails.app/) and [React](https://reactjs.org/). To get started, first ensure you have working Go (^1.18) and Node.js (^16) environments. Then, clone the repository and install the Node dependencies:

```bash
cd frontend && npm i
```

Then, you should be ready to start developing. To start the development server, change back to the project's root directory and run:

```bash
wails dev
```

The app should open and the development server will be available at http://localhost:34115.

### Building

To build Uplink, first install dependencies as outlined in the Development secion. Then, run:

```bash
wails build -ldflags "-X 'main.version=<version>'"
```

where `<version>` is your desired version tag. If `main.version` is not provided, the version will default to `develop`.
