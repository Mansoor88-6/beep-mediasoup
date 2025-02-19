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
 * ChangePassword component
 * @param {IUserModalProps} props - props
 * @returns {React.FC} - returns
 */
const ChangePassword: React.FC<IUserModalProps> = (props: IUserModalProps) => {
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
      type: 'password',
      password: true,
      id: 'password',
      name: 'newPassword',
      placeholder: 'New Password',
      hasFeedback: true,
      maxLength: InputLength.PASSWORD_LENGTH
    },
    {
      type: 'password',
      password: true,
      id: 'confirmPassword',
      name: 'confirmPassword',
      placeholder: 'Confirm Password',
      dependencies: ['password'],
      hasFeedback: true,
      maxLength: InputLength.PASSWORD_LENGTH
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
                rules={
                  field.name === 'confirmPassword'
                    ? [
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => {
                          return {
                            validator: (_, value) => {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Passwords do not match!'));
                            }
                          };
                        }
                      ]
                    : [{ required: true, message: `${field.placeholder} is required!` }]
                }
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
          <UserAddOutlined /> {props.editMode ? 'Update Password' : 'Create User'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ChangePassword;
