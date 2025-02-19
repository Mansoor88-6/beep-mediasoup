import { ModalProps } from 'antd';

interface IModalProps extends ModalProps {
  setModalVisibility(value: boolean): void;
  open: boolean;
}

export default IModalProps;
