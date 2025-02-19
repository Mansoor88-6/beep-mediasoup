import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { InputLength } from 'types';
import { ScalableInput } from 'components';
import { useAppDispatch } from 'appRedux/store';
import { initFormFields, resetFormFields } from 'utils';
import { IChangePasswordFormData, IUserModalProps } from '../types';
import { changePassword } from 'appRedux/actions/userAction';
import { IChangePasswordFormActionData } from 'types/ReduxTypes/user/action';
/**
 * UserInfo component
 * @param {IUserModalProps} props - props
 * @returns {React.FC} - returns
 */
const UserInfo: React.FC<IUserModalProps> = (props: IUserModalProps) => {
  const { dataSet, setDataSet } = props;
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (dataSet) {
      if (dataSet._id) {
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

  /**
   * Handle submit the form
   *
   * @returns {void}
   **/
  const handleSubmit = async (values: IChangePasswordFormData) => {
    setLoading(true);
    const formData: IChangePasswordFormActionData = {
      clientId: dataSet?._id || '',
      newPassword: values.newPassword,
      confirmPassword: values.confirmPassword
    };
    if ((await dispatch(changePassword(formData))).payload) {
      resetFormFields(form);
      handleClose();
    }
    setLoading(false);
  };

  const fields = [
    {
      type: 'text',
      id: 'username',
      name: 'username',
      placeholder: 'Username',
      maxLength: InputLength.USERNAME_LENGTH,
      disabled: props.editMode,
      required: false,
      rules: [
        {
          required: true,
          message: `Please Enter the Username`
        },
        {
          pattern: /^[A-Za-z\s'-]+$/,
          message: `Invalid Username`
        }
      ]
    },
    {
      type: 'email',
      id: 'email',
      name: 'email',
      placeholder: 'Email',
      maxLength: InputLength.EMAIL_LENGTH,
      disabled: props.editMode,
      rules: [
        {
          required: true,
          message: `Please Enter the Email`
        },
        {
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: `Invalid Email`
        }
      ]
    }
  ];

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Form.Item name="clientId" initialValue={dataSet?._id} hidden></Form.Item>
      <Row gutter={10}>
        {fields.map((field, idx) => {
          return (
            <Col key={idx} xs={24} sm={24} md={24} lg={12}>
              <Form.Item
                label={field.placeholder}
                //   rules={[{ required: true, message: `${field.placeholder} is required!` }]}
                {...field}>
                <ScalableInput {...field} className="w-full" />
              </Form.Item>
            </Col>
          );
        })}
      </Row>

      {/* Submit Button */}
      <Form.Item>
        <Button
          block
          type="primary"
          htmlType="submit"
          loading={loading}
          className="text-white hover:text-white hover:border-2 border-white bg-green-700 font-semibold hover:bg-green-600 flex items-center justify-center">
          <UserAddOutlined /> {props.editMode ? 'Update User' : 'Create User'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserInfo;
