import React, { FC, PropsWithChildren } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper: FC<PropsWithChildren<{ bg?: string }>> = ({ bg, children }) => {
    const { top } = useSafeAreaInsets();
    const paddingTop = top > 0 ? top + 5 : 30;

    return <View style={{ backgroundColor: bg, flex: 1, paddingTop }}>{children}</View>;
};

export default ScreenWrapper;
