import React from 'react';
import { Button, Grid } from 'antd';
import IButtonProps from './types';

const { useBreakpoint } = Grid;

/**
 * Antd Customized button component with scalability breakpoints
 * @param {IButtonProps} props - Properties of the button
 * @returns {React.FC} Button component
 */
const ScalableButton: React.FC<IButtonProps> = (props: IButtonProps) => {
  const { lg, md } = useBreakpoint();
  const { className, scalable, info, ...rest } = props;
  const linkClasses = props.scalable
    ? lg
      ? 'lg-scalable-link' // convert to tailwind css
      : md
      ? 'md-scalable-link'
      : 'sm-scalable-link'
    : '';
  const btnClasses = scalable
    ? lg
      ? 'lg-scalable-btn'
      : md
      ? 'md-scalable-btn'
      : 'sm-scalable-btn'
    : '';
  const combinedClasses = `${props.type === 'link' ? `${linkClasses} link` : `${btnClasses} btn`} ${
    className || ''
  } ${info ? 'info' : ''}`;

  return (
    <Button className={combinedClasses} {...rest}>
      {props.children}
    </Button>
  );
};
ScalableButton.defaultProps = {
  scalable: true,
  info: false
};
export default ScalableButton;
