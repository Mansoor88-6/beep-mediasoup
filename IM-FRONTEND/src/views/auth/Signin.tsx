import React, { useState } from 'react';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Typography, Checkbox, Image } from 'antd';
import { InputLength } from 'types';
import { Login } from 'appRedux/actions/authAction';
import { ScalableInput } from 'components';
import { useAppDispatch } from 'appRedux/store';
import B33PLogo from 'assets/imgs/beep.png';
import AUTH_BG from 'assets/imgs/auth-bg.jpg';
import { LogIn } from 'lucide-react';
const { Title } = Typography;

/**
 * SignIn component
 * @returns {React.FC} - returns
 */
const SignIn = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm();
  const [buttonLoader, setButtonLoader] = useState(false);

  /**
   * @param {any} values - prm
   * @returns {void} - return s
   */
  const onFinish = async (values: any) => {
    setButtonLoader(true);
    if (await dispatch(Login(values))) {
      setButtonLoader(false);
    }
  };

  const fields = [
    {
      type: 'email',
      id: 'email',
      name: 'email',
      placeholder: 'Email',
      icon: <UserOutlined className=" text-green-500" />,
      maxLength: InputLength.EMAIL_LENGTH,
      rules: [
        {
          required: true,
          message: `Please Enter the Email!`
        },
        {
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          message: `Invalid Email`
        }
      ]
    },
    {
      type: 'password',
      id: 'password',
      name: 'password',
      placeholder: 'Password',
      password: true,
      icon: <LockOutlined className=" text-green-500" />,
      maxLength: InputLength.PASSWORD_LENGTH,
      rules: [
        {
          required: true,
          message: `Please Enter the Password!`
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800 p-4">
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
          <Title level={2}>
            <span className="text-green-800 uppercase m-0">Welcome</span>
          </Title>
          {/* <p className="text-green-600">Sign in to your account</p> */}
        </div>
        <Form form={form} initialValues={{ remember: true }} onFinish={onFinish}>
          {fields.map((field, idx) => {
            return (
              <Form.Item key={idx} {...field}>
                <ScalableInput
                  {...field}
                  prefix={field.icon}
                  className="rounded-md border border-green-300"
                />
              </Form.Item>
            );
          })}

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-green-700">Remember me</Checkbox>
            </Form.Item>

            <a
              className="login-form-forgot float-right text-green-600 hover:text-green-800"
              href="">
              Forgot password
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={buttonLoader}
              icon={<LogIn className="w-4 h-4" />}
              className="w-full flex justify-center items-center bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700 rounded-md">
              Sign In
            </Button>
            {/* <p className="mt-3 w-fit ml-auto text-gray-400">
              {`if you don't have an account! `}
              <a href="/signup" className="text-green-600 hover:text-green-800">
                Sign Up!
              </a>
            </p> */}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;
