import { SpinProps } from 'antd';
import { CSSProperties, ReactNode } from 'react';

interface ILoaderProps extends SpinProps {
  readonly icon?: ReactNode;
  readonly iconStyle?: CSSProperties;
  readonly style?: CSSProperties;
}

export default ILoaderProps;
