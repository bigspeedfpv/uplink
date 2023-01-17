# WORK IN PROGRESS

<img src="./.github/assets/logo-full.svg" height="80" alt="Uplink Logo" />

---

Uplink is an unofficial firmware flasher and SD card content manager for EdgeTX. Uplink is not affiliated with EdgeTX. **USE AT YOUR OWN RISK!**

## Features

- Easily flash EdgeTX firmware to your radio or update your radio's firmware
- Quickly select language packs and scripts to be installed on your radio's SD card

---

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
