import { InputProps } from 'antd';

interface IInputProps extends InputProps {
  textarea?: boolean;
  password?: boolean;
  search?: boolean;
  rows?: number;
  scalable?: boolean;
  isRequired?: boolean;
  white?: boolean;
}

export default IInputProps;
