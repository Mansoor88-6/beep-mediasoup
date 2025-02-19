import React from 'react';
import { Input, Grid } from 'antd';
import IInputProps from './types';

const { useBreakpoint } = Grid;

/**
 * Antd Customized Input component with scalability breakpoints
 * @param {IInputProps} props - Properties of the Input
 * @returns {React.FC} Input component
 */
const ScalableInput: React.FC<IInputProps> = (props: IInputProps) => {
  const { className, scalable, white, ...rest } = props;
  const { lg, md } = useBreakpoint();
  const classes = scalable
    ? lg
      ? 'lg-scalable-input'
      : md
      ? 'md-scalable-input'
      : 'sm-scalable-input'
    : '';
  const customClasses = className || '';
  const combinedClasses = `${classes} ${
    white ? 'white-background-input' : ''
  } input ${customClasses}`;
  return (
    <>
      {props.textarea ? (
        <Input.TextArea className={combinedClasses} />
      ) : props.password ? (
        <Input.Password className={combinedClasses} {...rest} />
      ) : props.search ? (
        <Input.Search
          /**
           * On sm, the inner icon and inout does not shrink
           * so a hack is to use size = small
           */
          {...(!md ? { size: 'small' } : {})}
          className={combinedClasses}
          {...rest}
        />
      ) : (
        <Input className={combinedClasses} {...rest} />
      )}
    </>
  );
};
ScalableInput.defaultProps = {
  scalable: true,
  white: false
};

export default ScalableInput;
