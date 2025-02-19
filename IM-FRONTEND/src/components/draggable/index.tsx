import React from 'react';
import Draggable from 'react-draggable';
import { IDraggableProps } from './types';

/**
 * Libray for dragging
 * @param {IDraggableProps} props - Properties of the Input
 * @returns {React.FC} Input component
 */
const ScalableDrag: React.FC<IDraggableProps> = (props: IDraggableProps) => {
  const { children, ...rest } = props;

  return (
    <Draggable defaultClassName="" {...rest}>
      {children}
    </Draggable>
  );
};

export default ScalableDrag;
