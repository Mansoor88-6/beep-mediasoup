import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import ILoaderProps from './types';

/**
 * Antd loader component
 * @param {ILoaderProps} props - Properties of the loader
 * @returns {React.FC} loader component
 */
const Loader: React.FC<ILoaderProps> = (props: ILoaderProps) => {
  /**
   * space and spin size => small,middle,large
   * antIcon showing custom circle loader
   */
  const antIcon = <LoadingOutlined style={props.iconStyle} spin />;
  return <>{props.icon ? <Spin indicator={antIcon} /> : <Spin {...props} />}</>;
};

export default Loader;
