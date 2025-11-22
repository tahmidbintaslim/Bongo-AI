import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRegistry } from 'react-native';
import App from './App';

// Register the app
AppRegistry.registerComponent('BongoAI', () => App);

// Get root element
const rootTag = document.getElementById('root');

if (rootTag) {
  const root = createRoot(rootTag);
  root.render(<App />);
}
