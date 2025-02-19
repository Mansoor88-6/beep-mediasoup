import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Grid, Row, Typography } from 'antd';
// Others
import { IRoomModalProps } from './types';
import { ScalableInput, ScalableModal } from 'components';
import { IRoom } from 'types/ReduxTypes/room';
// Redux
import { useAppDispatch } from 'appRedux/store';
import { createRoom } from 'appRedux/actions/roomAction';
import { initFormFields, resetFormFields } from 'utils';

const { Title } = Typography;
const { useBreakpoint } = Grid;
/**
 * New Room Component
 * @param {IRoomModalProps} props - prm
 * @returns {React.FC} - return
 */
const NewRoomModal: React.FC<IRoomModalProps> = (props: IRoomModalProps) => {
  const { dataSet, setDataSet } = props;
  const [form] = Form.useForm();
  const { sm } = useBreakpoint();
  const dispatch = useAppDispatch();
  const [buttonLoader, setButtonLoader] = useState(false);

  useEffect(() => {
    /**
     * Init form.
     */
    if (dataSet) {
      if (dataSet._id) {
        initFormFields(dataSet as unknown as Record<string, unknown>, form);
      }
      form.setFieldsValue({
        _id: dataSet._id,
        title: dataSet.title
      });
    }
  }, [dataSet]);

  /**
   * close modal
   * after form submit
   */
  const handleClose = () => {
    props.setModalVisibility(false);
    resetFormFields(form);
    setDataSet(null);
  };

  /**
   * submit handler
   * @param {Pick<IRoom, 'title'>} values - prm
   * form submittion
   */
  const submitHandler = async (values: Pick<IRoom, 'title'>) => {
    setButtonLoader(true);
    if (await dispatch(createRoom(values))) {
      setButtonLoader(false);
      handleClose();
    }
  };

  const fields = [
    {
      name: 'title',
      label: 'Title',
      type: 'text',
      placeholder: 'Enter room title',
      required: true,
      validation: { required: 'Title is required' }
    }
    // {
    //   name: 'participants',
    //   label: 'Participants',
    //   type: 'select',
    //   placeholder: 'Enter number of participants',
    //   required: false,
    //   validation: {
    //     required: 'Participants number is required',
    //     min: { value: 1, message: 'Participants must be at least 1' },
    //     max: { value: 10, message: 'Participants must be at least 10' }
    //   }
    // },
    // {
    //   name: 'maxParticipants',
    //   label: 'Max Participants',
    //   type: 'number',
    //   placeholder: 'Enter maximum number of participants',
    //   required: false,
    //   validation: {
    //     required: 'Max participants is required',
    //     min: { value: 1, message: 'Max Participants must be at least 1' },
    //     max: { value: 10, message: 'Max Participants must be at least 10' }
    //   }
    // },
    // {
    //   name: 'host',
    //   label: 'Host',
    //   type: 'text',
    //   placeholder: 'Enter host name',
    //   required: false,
    //   validation: { required: 'Host name is required' }
    // }
  ];

  return (
    <ScalableModal
      title={
        <Title level={4}>
          <span className={props.edit ? 'text-red-900' : 'text-green-900'}>
            {props.edit ? `Edit Room` : 'New Room'}
          </span>
        </Title>
      }
      centered
      closable={true}
      footer={null}
      destroyOnClose={true}
      onCancel={handleClose}
      width={!sm ? '100%' : '30%'}
      open={props.modalVisibility}
      setModalVisibility={props.setModalVisibility}>
      <Form form={form} layout="vertical" onFinish={submitHandler}>
        <Row justify={'center'} gutter={10}>
          {fields.map((field, idx) => {
            return (
              <Col key={idx} xs={24} sm={24} md={24} lg={24}>
                <Form.Item
                  rules={[
                    { required: field.required, message: `${field.placeholder} is required!` }
                  ]}
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
            type="link"
            loading={buttonLoader}
            className="text-white bg-green-700 font-semibold hover:bg-green-600 flex items-center justify-center"
            htmlType="submit">
            {props.edit ? `Update Room` : 'Submit'}
          </Button>
        </Form.Item>
      </Form>
    </ScalableModal>
  );
};

export default NewRoomModal;
