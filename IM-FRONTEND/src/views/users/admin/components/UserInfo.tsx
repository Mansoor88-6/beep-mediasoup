import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'antd';
import { InputLength, UserRoles } from 'types';
import { UserAddOutlined } from '@ant-design/icons';
import { ScalableInput, ScalableSelect } from 'components';
import { ICreateUserFormData, IUserInfoProps } from '../types';
import { useAppDispatch } from 'appRedux/store';
import { updateUser } from 'appRedux/actions/userAction';
import { register } from 'appRedux/actions/authAction';
/**
 * UserInfo component
 * @param {IUserInfoProps} props - props
 * @returns {React.FC} - returns
 */
const UserInfo: React.FC<IUserInfoProps> = (props: IUserInfoProps) => {
  const { form, dataSet, handleClose } = props;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);

  /**
   * Handle submit the form
   *
   * @returns {void}
   **/
  const handleSubmit = async (values: ICreateUserFormData) => {
    setLoading(true);
    const updateData = {
      username: values.username,
      email: values.email,
      userRole: values.role,
      activate: values.activate,
      _id: values._id
    };
    if (dataSet?._id) {
      if ((await dispatch(updateUser(updateData))).payload) {
        handleClose();
      }
    } else {
      const registerData = {
        username: values.username,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword
      };
      if ((await dispatch(register(registerData))).payload) {
        handleClose();
      }
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
    },
    {
      id: 'role',
      type: 'select',
      name: 'role',
      placeholder: 'Role',
      options: [
        { label: 'Admin', value: UserRoles.Admin },
        { label: 'Client', value: UserRoles.Client }
      ].map((role) => {
        return {
          label: role.label,
          value: role.value
        };
      })
    },
    {
      id: 'activate',
      type: 'select',
      name: 'activate',
      placeholder: 'Status',
      options: [
        { label: 'Activate', value: true },
        { label: 'Deactivate', value: false }
      ].map((status) => {
        return {
          label: status.label,
          value: status.value
        };
      }) as any
    },
    // Only show password fields when creating a new user
    ...(!dataSet?._id && !props.editMode
      ? [
          {
            type: 'password',
            password: true,
            id: 'password',
            name: 'password',
            placeholder: 'Password',
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
        ]
      : [])
  ];

  return (
    <Form layout="vertical" form={form} onFinish={handleSubmit}>
      <Form.Item name="_id" initialValue={dataSet?._id} hidden></Form.Item>
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
                              if (!value || getFieldValue('password') === value) {
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
                {field.type === 'select' ? (
                  <ScalableSelect
                    {...field}
                    value={form.getFieldValue(field.name)}
                    options={field.options}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <ScalableInput {...field} placeholder={field.placeholder} className="w-full" />
                )}
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
