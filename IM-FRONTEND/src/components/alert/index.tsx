import { notification } from 'antd';
import React from 'react';
import { AuthErrors } from 'types';
import { IAlertProps } from './types';
import {
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'; // Importing Ant Design Icons
import { getAlertStyle } from 'colors';

// redux
import { useSelector } from 'react-redux';
import { AlertSelector, removeAlert } from 'appRedux/reducers/alertReducer';
import { IAlert } from 'types/ReduxTypes/alert';

const ignoreAlerts = [AuthErrors.LoginNeeded];

/**
 * antd notification
 * @param {IAlertProps} props - Properties of the notification
 * @returns {React.FC} notification component
 */
const Alert: React.FC<IAlertProps> = (props: IAlertProps) => {
  const AlertState = useSelector(AlertSelector);
  const { placement, duration } = props;
  const zero = 0;
  const one = 1;
  const three = 3;

  notification.config({
    placement: placement || 'top',
    duration: duration || three,
    rtl: false
  });

  const icons: { [key: string]: React.ReactNode } = {
    success: <CheckCircleOutlined style={{ fontSize: 30, color: '#52c41a' }} />, // Success icon from Ant Design
    info: <InfoCircleOutlined style={{ fontSize: 30, color: '#1890ff' }} />, // Info icon from Ant Design
    warning: <ExclamationCircleOutlined style={{ fontSize: 30, color: '#faad14' }} />, // Warning icon from Ant Design
    danger: <ExclamationCircleOutlined style={{ fontSize: 30, color: '#f5222d' }} /> // Danger icon, same as warning but red color
  };

  const key = `open${Date.now()}`;

  return (
    <>
      {AlertState !== null &&
        AlertState.length > zero &&
        AlertState.filter((alert: IAlert) => {
          return ignoreAlerts.indexOf(alert.message as AuthErrors) === -one;
        }).forEach((alert: IAlert, idx) => {
          notification.open({
            message: alert.type && icons[alert.type],
            description: alert.message,
            // btn: alert.url ? btn : undefined,
            key: `${key}-${idx}`,
            style: getAlertStyle(alert.type as string),
            onClose: () => {
              return removeAlert(alert.id as IAlert);
            }
          });
        })}
    </>
  );
};

export default Alert;
