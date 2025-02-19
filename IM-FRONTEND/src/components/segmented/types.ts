import { SegmentedProps } from 'antd';
import React from 'react';

interface ISegement {
  label: string | React.ReactElement;
  value: string | number;
  icon?: any;
  content: React.ReactElement;
  disabled?: boolean;
}

export interface ISegmentedProps extends SegmentedProps {
  options: Array<ISegement>;
}
