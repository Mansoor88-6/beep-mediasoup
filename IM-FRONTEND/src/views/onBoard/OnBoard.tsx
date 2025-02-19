import React from 'react';
import { Avatar, Card, Col, Image, Row, Grid } from 'antd';
import { AntDesignOutlined, UserOutlined } from '@ant-design/icons';
import { THREE_HUNDRED, SIX_HUNDRED, ZERO } from 'constant';
import { Link } from 'react-router-dom';

import IMBannerIMG from 'assets/imgs/im-onboard.png';
import VCBannerIMG from 'assets/imgs/vc-onboard.jpg';

const { useBreakpoint } = Grid;
/**
 * Board im or vc selection
 * @returns {React.FC} - returns;
 */
const OnBoard = () => {
  const { lg } = useBreakpoint();

  const height = lg ? THREE_HUNDRED : SIX_HUNDRED;

  const cards = [
    {
      title: 'Instant Messaging',
      link: '/im',
      description:
        ' Secure, fast, and feature-rich messaging platform enabling seamless communication, file sharing, and collaboration for individuals and teams..',
      imgPath: IMBannerIMG
    },
    {
      title: 'Video Conferencing',
      link: '/vc',
      description:
        'High-quality video conferencing solution offering reliable connectivity, screen sharing, and advanced tools for effective virtual meetings.',
      imgPath: VCBannerIMG
    }
  ];

  return (
    <Row
      gutter={20}
      justify={'space-between'}
      className="min-h-screen bg-[#ffffff] w-full h-full p-0 m-0 flex justify-center items-center">
      {cards.map((card, idx) => {
        return (
          <Col key={idx} xs={24} sm={24} md={12} lg={6} xl={7} xxl={6}>
            <Link to={card.link}>
              <Card
                hoverable
                className={`rounded-2xl shadow-lg transition-transform relative duration-300 transform hover:translate-y-2 ${
                  idx === ZERO ? 'hover:-rotate-2' : 'hover:rotate-2'
                }`}
                cover={
                  <Image
                    className="object-contain"
                    height={height}
                    preview={false}
                    alt="onboard-img"
                    srcSet={card.imgPath}
                  />
                }>
                <Card.Meta title={card.title} description={card.description} />
                <div className="flex justify-end">
                  <Avatar.Group shape="circle">
                    <Avatar style={{ backgroundColor: '#fde3cf' }}>A</Avatar>
                    <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
                    <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
                    <Avatar style={{ backgroundColor: '#1677ff' }} icon={<AntDesignOutlined />} />
                  </Avatar.Group>
                </div>
              </Card>
            </Link>
          </Col>
        );
      })}

      {/* <Col xs={24} sm={24} md={12} lg={7} xl={7} xxl={6} flex={1}>
        <Card
          hoverable
          className="transition-transform duration-300 transform  hover:translate-y-2 hover:scale-70 hover:rotate-2"
          cover={
            <Image
              height={height}
              preview={false}
              alt="example"
              src="https://picsum.photos/200/300"
            />
          }>
          <div className="flex justify-between items-end">
            <Card.Meta title="Europe Street beat" description="www.instagram.com" />
            <Avatar.Group shape="circle">
              <Avatar style={{ backgroundColor: '#fde3cf' }}>A</Avatar>
              <Avatar style={{ backgroundColor: '#f56a00' }}>K</Avatar>
              <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
              <Avatar style={{ backgroundColor: '#1677ff' }} icon={<AntDesignOutlined />} />
            </Avatar.Group>
          </div>
        </Card>
      </Col> */}
    </Row>
  );
};

export default OnBoard;
