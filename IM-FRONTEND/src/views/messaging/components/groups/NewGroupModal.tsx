import React, { useState } from 'react';
import { Form, Input, Select, Avatar } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'appRedux/store';
import { createGroup } from 'appRedux/actions/messageAction';
import { UserOutlined } from '@ant-design/icons';
import { ScalableModal } from 'components';

interface NewGroupModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Component that renders a modal for creating a new group
 * @param {NewGroupModalProps} props - Component props
 * @returns {React.FC} Returns NewGroupModal component
 */
const NewGroupModal: React.FC<NewGroupModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const availableParticipants = useSelector((state: RootState) => {
    return state.messages.availableParticipants;
  });

  // eslint-disable-next-line require-jsdoc
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await dispatch(
        createGroup({
          name: values.name,
          description: values.description,
          participantIds: selectedUsers
        })
      );
      form.resetFields();
      setSelectedUsers([]);
      onClose();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create group:', error);
    }
  };

  return (
    <ScalableModal
      title="Create New Group"
      open={visible}
      setModalVisibility={onClose}
      onOk={handleSubmit}
      onCancel={onClose}
      className="backdrop-filter backdrop-opacity-50 backdrop-green-100"
      okText="Create Group">
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Group Name"
          rules={[{ required: true, message: 'Please enter group name' }]}>
          <Input placeholder="Enter group name" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea placeholder="Enter group description" />
        </Form.Item>

        <Form.Item
          name="participants"
          label="Add Participants"
          rules={[{ required: true, message: 'Please select participants' }]}>
          <Select
            mode="multiple"
            placeholder="Select participants"
            onChange={setSelectedUsers}
            optionLabelProp="label">
            {availableParticipants.map((user) => {
              return (
                <Select.Option key={user._id} value={user._id} label={user.username}>
                  <div className="flex items-center">
                    <Avatar size="small" icon={<UserOutlined />} src={user.avatar} />
                    <span className="ml-2">{user.username}</span>
                  </div>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
      </Form>
    </ScalableModal>
  );
};

export default NewGroupModal;
