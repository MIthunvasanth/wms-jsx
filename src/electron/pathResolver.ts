import path from 'path';
import { app } from 'electron';
import { isDev } from './util.js';

export function getPreloadPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? '' : '..', // Fixed path handling here
    'dist-electron/preload.cjs'  // Removed leading slash
  );
}

export function getUIPath() {
  return path.join(app.getAppPath(), 'dist-react', 'index.html'); // Fixed path to avoid leading slash
}

export function getAssetPath() {
  return path.join(
    app.getAppPath(),
    isDev() ? '' : '..', // Fixed path handling here
    'src/assets' // Removed leading slash
  );
}
