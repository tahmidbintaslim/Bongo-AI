import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button, Card } from '@bongo-ai/ui-components';

const App: React.FC = () => {
  const handleGetStarted = () => {
    // TODO: Implement navigation to getting started screen
  };

  return (
    <View style={styles.container}>
      <Card title="স্বাগতম বঙ্গো এআই">
        <Text style={styles.text}>
          বাংলাদেশের জন্য বাংলা স্টাডি অ্যাসিস্ট্যান্ট
        </Text>
        <Text style={styles.subtitle}>
          Bengali Study Assistant for Bangladesh
        </Text>
        <View style={styles.buttonContainer}>
          <Button
            title="শুরু করুন"
            onPress={handleGetStarted}
            variant="primary"
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
  },
});

export default App;
