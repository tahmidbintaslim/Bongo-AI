import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { I18nextProvider } from 'react-i18next';
import i18n from '@bongo-ai/i18n';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </I18nextProvider>
    </Provider>
  );
};

export default App;
