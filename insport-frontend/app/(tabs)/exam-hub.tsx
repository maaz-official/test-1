import React from 'react';
import {Text, StyleSheet } from 'react-native';
import { ScreenWrapper } from '@/components';

const ExamHubScreen = () => {
  return (
    <ScreenWrapper bg={'white'}>
      <Text style={styles.title}>Exam Hub</Text>
      <Text style={styles.content}>Welcome to the Exam Hub! Manage your exams and study resources here.</Text>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ExamHubScreen;
