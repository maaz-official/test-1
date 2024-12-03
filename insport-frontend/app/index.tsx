// app/index.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/themes/colors';
import { Stack } from 'expo-router';
import { Loading } from '@/components';

const index: FC = () => {
  const backgroundColor = useThemeColor({ light: Colors.light.white, dark: Colors.dark.white }, 'white');
  const textColor = useThemeColor({ light: Colors.light.blueNCS, dark: Colors.dark.blueNCS }, 'viridian');

    return (
        <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Loading />
        </View>
    );
};

export default index;
``;
