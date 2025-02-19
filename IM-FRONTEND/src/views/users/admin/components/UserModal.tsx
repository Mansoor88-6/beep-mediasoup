import React from 'react';
import { Form, Tabs } from 'antd';
import { ScalableModal } from 'components';
import { initFormFields, resetFormFields } from 'utils';
import { IUserModalProps } from '../types';
import UserInfo from './UserInfo';
import ChangePassword from './ChangePassword';
/**
 * UserModal component
 * @param {IUserModalProps} props - props
 * @returns {React.FC} - returns
 */
const UserModal: React.FC<IUserModalProps> = (props: IUserModalProps) => {
  const { dataSet, setDataSet } = props;
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (dataSet) {
      if (dataSet?._id) {
        initFormFields(dataSet as unknown as Record<string, unknown>, form);
      }
    }
  }, [dataSet]);

  /**
   * Handle close the modal
   *
   * @returns {void}
   **/
  const handleClose = () => {
    props.setModalVisibility(false);
    resetFormFields(form);
    setDataSet(null);
  };

  return (
    <ScalableModal
      title={props.editMode ? 'Change Password' : 'Create User'}
      open={props.modalVisibility}
      onCancel={handleClose}
      footer={false}
      setModalVisibility={props.setModalVisibility}>
      <Tabs>
        <Tabs.TabPane tab="User Info" key="1">
          <UserInfo
            form={form}
            dataSet={dataSet}
            editMode={props.editMode}
            handleClose={handleClose}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Change Password" key="2">
          <ChangePassword
            form={form}
            dataSet={dataSet}
            editMode={props.editMode}
            handleClose={handleClose}
          />
        </Tabs.TabPane>
      </Tabs>
    </ScalableModal>
  );
};

export default UserModal;
