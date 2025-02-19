import React from 'react';
import { Card, Row, Col, Typography, Grid, Space, Statistic } from 'antd';
import ICardProps from './types';
import { FormatConfig, valueType } from 'antd/lib/statistic/utils';

const { useBreakpoint } = Grid;

/**
 * Custom antd card with theme classes
 *
 * @param {ICardProps} props - properties for card
 * @returns {React.FC} Card Component
 *
 * recommended breakpoints for card parent containers are
 * xs={24} sm={24} md={12} lg={8} xxl={4}
 */
const ScalableCard: React.FC<ICardProps> = (props: ICardProps) => {
  const { Text, Title } = Typography;
  const { xl } = useBreakpoint();
  const {
    icon,
    className,
    title,
    value,
    kind,
    colorproperty,
    theme,
    limitwidth,
    titlealign,
    children,
    footer,
    transparent,
    iconName,
    footerIcon,
    ...rest
  } = props;

  /**
   * Count up formatter
   *
   * @param {valueType} counter - number value to count to
   * @param {FormatConfig} config - config for countup element
   * @returns {React.React.ReactNode} returns react countup element
   */
  const formatter = (counter: valueType, config: FormatConfig | undefined): React.ReactNode => {
    return <Text>{counter}</Text>;
  };

  const propsForDefaultCard = { ...props };
  delete propsForDefaultCard.className;

  return (
    <React.Fragment>
      {kind === 'small' ? (
        <Card
          title={undefined}
          hoverable
          className={`${xl ? 'xl:p-6' : 'p-4'} ${className || ''} ${
            transparent ? 'bg-transparent' : ''
          }`}
          {...rest}>
          <Row>
            <Col span={24} className="flex flex-col">
              <div className="flex items-center mb-2">
                {iconName}
                <Text className={`font-medium ${iconName ? 'ml-2' : ''}`}>{title}</Text>
              </div>
              <div className="text-gray-600">{children}</div>
            </Col>
            <Col span={24}>
              {typeof value == 'string' ? (
                <Text className="text-2xl font-semibold">
                  <Statistic value={value} formatter={formatter} className="inline-block" />
                </Text>
              ) : (
                <>{value}</>
              )}
            </Col>
          </Row>
          {footer && (
            <Row
              align="bottom"
              justify={'start'}
              className={`mt-4 pt-4 border-t ${theme ? `text-${theme}-600` : ''}`}>
              <Col span={21}>
                <div className="text-sm">{footer}</div>
              </Col>
              <Col span={2}>
                <div className="text-sm">{footerIcon}</div>
              </Col>
            </Row>
          )}
        </Card>
      ) : kind === 'status' ? (
        <Card
          title={undefined}
          className={`${xl ? 'xl:p-6' : 'p-4'} ${className || ''} ${
            transparent ? 'bg-transparent' : ''
          }`}
          style={{ borderRadius: '0 0 12px 12px' }}
          bodyStyle={{ padding: 0, paddingTop: 10 }}
          {...rest}>
          {children}

          {footer && (
            <Row
              align="bottom"
              justify={'start'}
              className={`mt-4 pt-4 border-t ${theme ? `text-${theme}-600` : ''}`}>
              <Col span={21}>
                <div className="text-sm">{footer}</div>
              </Col>
              <Col span={2}>
                <div className="text-sm">{footerIcon}</div>
              </Col>
            </Row>
          )}
        </Card>
      ) : kind === 'admin' ? (
        <Card
          className={`${className} ${theme ? `text-${theme}-600` : ''} ${
            limitwidth ? 'max-w-md' : ''
          } ${transparent ? 'bg-transparent' : ''}`}
          {...rest}>
          <Space direction="vertical" className="flex flex-col items-center">
            <Text>{icon}</Text>
            <Title level={4}>{title}</Title>
            <Text className="text-2xl font-semibold">{value}</Text>
          </Space>
        </Card>
      ) : (
        <Card
          className={`p-6 ${className} ${titlealign === 'center' ? 'text-center' : ''} ${
            limitwidth ? 'max-w-md' : ''
          } ${transparent ? 'bg-transparent' : ''}`}
          {...propsForDefaultCard}>
          {children}
        </Card>
      )}
    </React.Fragment>
  );
};

ScalableCard.defaultProps = {
  kind: undefined,
  color: '#0000000',
  value: '0',
  theme: 'primary',
  limitwidth: true,
  transparent: false
};
export default ScalableCard;
