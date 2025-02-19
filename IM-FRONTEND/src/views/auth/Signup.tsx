import React, { useState } from 'react';
import { LoginOutlined } from '@ant-design/icons';
import { register } from 'appRedux/actions/authAction';
import { IRegisterFormData } from 'types/ReduxTypes/auth';

import B33PLogo from 'assets/imgs/beep.png';
import AUTH_BG from 'assets/imgs/auth-bg.jpg';
import { Button, Form, Row, Col, Typography, Image } from 'antd';
import { InputLength } from 'types';
import { ScalableInput } from 'components';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'appRedux/store';
import { useNavigate } from 'react-router-dom';
import { resetFormFields } from 'utils';

const { Title } = Typography;
/**
 * SignUp component
 * @returns {React.FC} - returns
 */
const SignUp = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [buttonLoader, setButtonLoader] = useState(false);

  /**
   * @param {IRegisterFormData} values - prm
   * @returns {void} - return s
   */
  const onFinish = async (values: IRegisterFormData) => {
    setButtonLoader(true);
    if ((await dispatch(register(values))).payload) {
      resetFormFields(form);
      navigate('/');
    }
    setButtonLoader(false);
  };

  const fields = [
    {
      type: 'text',
      id: 'username',
      name: 'username',
      placeholder: 'Username',
      maxLength: InputLength.USERNAME_LENGTH,
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
  ];

  return (
    <div className="min-h-screen flex relative items-center justify-center bg-gradient-to-br from-green-600 to-green-800 p-4">
      <div className="absolute">
        <img
          src={AUTH_BG}
          alt="Pakistan-inspired background"
          className="opacity-25 w-[100vw] h-screen"
        />
      </div>
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-block p-2 rounded-full bg-green-100 mb-4">
            <Image
              src={B33PLogo}
              alt="Logo"
              width={80}
              height={80}
              preview={false}
              className="rounded-full object-contain"
            />
          </div>
          <Title level={2} className="text-green-800 m-0">
            Welcome
          </Title>
          <p className="text-green-600">Sign up to your account</p>
        </div>
        <Form layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish}>
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
              type="default"
              loading={buttonLoader}
              className="text-white hover:text-white hover:border-2 border-white bg-green-700 font-semibold hover:bg-green-600 flex items-center justify-center"
              htmlType="submit">
              <LoginOutlined /> Sign Up
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignUp;
