import React, { useEffect, useState } from 'react';
import { PlusCircleFilled } from '@ant-design/icons';
import { Col, FloatButton, List, Row, Tooltip } from 'antd';
import moment from 'moment';
import { ZERO } from 'constant';
import RoomCard from './RoomCard';
import NewRoomModal from './NewRoomModal';
import { IRoom } from 'types/ReduxTypes/room';
// Redux
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'appRedux/store';
import { RoomSelector } from 'appRedux/reducers';
import { getRooms } from 'appRedux/actions/roomAction';
import { getRandomColor } from 'utils';

/**
 * Rooms
 * @returns {React.FC} - return
 */
const Rooms = () => {
  const [editRoom, setEditRoom] = useState<boolean>(false);
  const [dataSet, setDataSet] = useState<IRoom | null>();
  const [modalVisibility, setModalVisibility] = useState<boolean>(false);

  const dispatch = useAppDispatch();
  const { rooms, roomsLoading } = useSelector(RoomSelector);

  useEffect(() => {
    if (!rooms || roomsLoading) {
      dispatch(getRooms());
    }
  }, [rooms, roomsLoading]);

  /**
   * show modal based on edit or new
   * @param {string} modalMode - modal visibility for edit or new
   */
  const showModal = (modalMode: string) => {
    modalMode === 'edit' ? setEditRoom(true) : setEditRoom(false);
    setModalVisibility(true);
  };

  // const rooms = [
  //   {
  //     id: 5,
  //     title: 'Client Presentation',
  //     date: 'May 17, 2023',
  //     time: '11:00 AM - 12:00 PM',
  //     imageUrl: '/placeholder.svg?height=160&width=320',
  //     participants: 4,
  //     maxParticipants: 8,
  //     host: 'Mike Johnson',
  //     color: 'bg-green-500'
  //   }
  // ];

  /**
   * set edit data into state
   * @param {IRoom} obj - prm
   */
  const handleEdit = (obj: IRoom) => {
    setDataSet(obj);
    showModal('edit');
  };

  const formatRoomData = rooms?.map((room) => {
    const color = getRandomColor({ luminosity: 'light' });
    return {
      _id: room._id,
      title: room.title,
      date: moment(room.createdAt).format('ll'),
      time: moment(room.createdAt).format('hh:mm A'),
      imageUrl: '/placeholder.svg?height=160&width=320',
      participants: 6,
      hostname: room.hostname,
      isPrivate: room.isPrivate,
      color: color ? `bg-[${color}]` : 'bg-green-500',
      roomCode: room.roomCode,
      createdBy: room.createdAt,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
      lastSession: room.lastSession,
      joinParticipants: room.joinParticipants || ZERO,
      onEditButton: () => {
        handleEdit(room);
      }
    };
  });

  return (
    <Row className="flex-1 p-4 overflow-auto">
      <NewRoomModal
        edit={editRoom}
        dataSet={dataSet}
        setDataSet={setDataSet}
        modalVisibility={modalVisibility}
        setModalVisibility={setModalVisibility}
      />
      <Col span={24}>
        <List
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 2,
            lg: 3,
            xl: 4,
            xxl: 5
          }}
          pagination={{
            pageSize: 10,
            position: 'bottom',
            align: 'center'
          }}
          dataSource={formatRoomData}
          renderItem={(card, idx) => {
            return (
              <List.Item>
                <RoomCard key={idx} {...card} />
              </List.Item>
            );
          }}
        />
      </Col>

      <Tooltip title="Create a Room" placement="left">
        <FloatButton
          onClick={() => {
            return showModal('add');
          }}
          icon={<PlusCircleFilled className="text-green-800" />}
        />
      </Tooltip>
    </Row>
  );
};

export default Rooms;
