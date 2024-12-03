import React from 'react';
import Svg, { Path, SvgProps } from 'react-native-svg';

const Share = (props: SvgProps) => (
    <Svg color={'#000000'} fill={'none'} height={24} viewBox={'0 0 24 24'} width={24} {...props}>
        <Path
            d={
                'M18 7C18.7745 7.16058 19.3588 7.42859 19.8284 7.87589C21 8.99181 21 10.7879 21 14.38C21 17.9721 21 19.7681 19.8284 20.8841C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8841C3 19.7681 3 17.9721 3 14.38C3 10.7879 3 8.99181 4.17157 7.87589C4.64118 7.42859 5.2255 7.16058 6 7'
            }
            stroke={'currentColor'}
            strokeLinecap={'round'}
            strokeWidth={props.strokeWidth}
        />
        <Path
            d={
                'M12.0253 2.00052L12 14M12.0253 2.00052C11.8627 1.99379 11.6991 2.05191 11.5533 2.17492C10.6469 2.94006 9 4.92886 9 4.92886M12.0253 2.00052C12.1711 2.00657 12.3162 2.06476 12.4468 2.17508C13.3531 2.94037 15 4.92886 15 4.92886'
            }
            stroke={'currentColor'}
            strokeLinecap={'round'}
            strokeLinejoin={'round'}
            strokeWidth={props.strokeWidth}
        />
    </Svg>
);

export default Share;