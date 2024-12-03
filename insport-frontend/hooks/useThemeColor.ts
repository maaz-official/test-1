/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';
import { Colors } from '@/themes/colors'; 

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light'; // 'light' or 'dark'
  const colorFromProps = props[theme]; 

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName]; // Return color based on the theme
  }
}

