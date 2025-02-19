import React from 'react';
import { Modal } from 'antd';
import IModalProps from './types';
import { CloseOutlined } from '@ant-design/icons';

/**
 * Antd Customized Modal component
 * @param {IModalProps} props - Properties of the Modal component
 * @returns {React.FC} Modal component
 *
 * Please note that the component will by default have two buttons (ok, cance)
 * you will have to pass customized handler as well as text for ok and cancel
 * buttons OR you can completely customize footer (Buttons) by passing array of buttons
 * as footer prop
 *
 * NOTE: MUST apply className="modal-footer-left-btn" to all buttons except last button
 * if footer is customized e.g.
 * footer={[
          <Button key="back" onClick={handleCancel} className="modal-footer-left-btn">
            Return
          </Button>,
          <Button key="submit" type="primary" className="modal-footer-left-btn">
            Submit
          </Button>,
          <Button key="link" type="primary">
            Search on Google
          </Button>,
        ]}
 */
const ScalableModal: React.FC<IModalProps> = (props: IModalProps) => {
  const { className, open, onOk, onCancel, ...rest } = props;

  /**
   * If the modal is visible, run ok handler
   */
  const handleOk = props.onOk
    ? props.onOk
    : () => {
        props.setModalVisibility(false);
      };

  /**
   * If the modal is visible, run cancel handler
   */
  const handleCancel = props.onCancel
    ? props.onCancel
    : () => {
        props.setModalVisibility(false);
      };

  return (
    <Modal
      className={`${className}`}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ className: 'ml-auto' }}
      cancelButtonProps={{ className: 'mx-auto' }}
      /**
       * Sider is in 19.
       * Its is set as 20 so that
       * select is shown properly on
       * Modal
       */
      zIndex={20}
      closeIcon={<CloseOutlined />}
      {...rest}>
      {props.children}
    </Modal>
  );
};

export default ScalableModal;
