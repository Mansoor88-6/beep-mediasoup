import React from 'react';
import { Row, Typography, Space, Image } from 'antd';
import NotFound from 'assets/imgs/not-found.gif';
import { useNavigate } from 'react-router-dom';
import ScalableButton from 'components/button';

const { Text } = Typography;
/**
 * Not Found Component
 * @returns {React.FC} Component
 */
const NotFoundLayout = () => {
  const navigate = useNavigate();
  return (
    <Row className="h-screen" justify={'center'} align="middle">
      <Space direction="vertical" align="center">
        <Image className="mix-blend-color-burn" height={300} src={NotFound} preview={false} />
        <Text className="text-red-700 font-bold">404 - PAGE NOT FOUND</Text>
        <Text className="text-red-700 text-center size-9 font-semibold justify-center">
          The page you are looking for might have been removed <br />
          has its name changed or is temporarily unavailable 😒!
        </Text>
        <ScalableButton
          className="bg-green-400"
          onClick={() => {
            navigate('/');
          }}
          type="primary">
          GO TO HOMEPAGE
        </ScalableButton>
      </Space>
    </Row>
  );
};

export default NotFoundLayout;
