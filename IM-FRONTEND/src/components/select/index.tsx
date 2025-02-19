import React from 'react';
import IDropdownProps from './types';
import { Select, Grid } from 'antd';

const { useBreakpoint } = Grid;

/**
 *
 * @param {IDropdownProps} props - props for dropdown
 * @returns {React.FC} DropDown component
 */
const ScalableSelect: React.FC<IDropdownProps> = (props: IDropdownProps) => {
  const { lg, md } = useBreakpoint();
  const { className, showSearch, showArrow, white, maxTagCount, ...rest } = props;
  const classes = props.scalable
    ? lg
      ? 'lg-scalable-dropdown'
      : md
      ? 'md-scalable-dropdown'
      : 'sm-scalable-dropdown'
    : '';
  const combinedClasses = `${classes} select ${white ? 'white-background-select' : ''} ${
    className || ''
  }`;
  return (
    <Select
      showSearch={showSearch}
      showArrow={showArrow}
      className={combinedClasses}
      maxTagCount={maxTagCount}
      {...rest}
    />
  );
};
ScalableSelect.defaultProps = {
  scalable: true,
  loading: false,
  white: false,
  maxTagCount: 'responsive',
  showSearch: true,
  showArrow: true,
  filterOption: (inputValue, option) => {
    const label = option && option.label;
    if (label === null || label === undefined) {
      /**
       * Exclude 0
       */
      return false;
    }
    return label.toString().toLowerCase().includes(inputValue.toLowerCase());
  }
};

export default ScalableSelect;
