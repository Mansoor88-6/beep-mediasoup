import React, { useEffect, useRef, useState } from 'react';
import { Button, Col, Form, Row } from 'antd';
import { humanize } from 'utils';
import { ZERO } from 'constant';
import ScalableCard from 'components/card';
import { IUser } from 'types/ReduxTypes/user';
import UserModal from './components/UserModal';
import { EditOutlined } from '@ant-design/icons';
import { CustomTable, TableToolBar, TableColumns } from 'components';
// Redux
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'appRedux/store';
import { UserSelector } from 'appRedux/reducers';
import { deleteUsers, getUsers } from 'appRedux/actions/userAction';
/**
 * Render Users Management Page
 *
 * @returns {JSX.Element}
 **/
const AdminUsersView = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [editMode, setEditMode] = useState(false);
  const { users, usersLoading } = useSelector(UserSelector);
  const [refreshLoader, setRefreshLoader] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [dataSet, setDataSet] = useState<IUser | null | undefined>(null);

  const [deleteBtnDisabled, setDeleteBtnDisabled] = useState(true);
  const [search, setSearch] = useState<string>('');
  const searchRef = useRef(search);

  useEffect(() => {
    dispatch(getUsers());
  }, []);

  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  /**
   * Show the modal
   *
   * @returns {void}
   **/
  const showModal = (mode: string) => {
    mode === 'edit' ? setEditMode(true) : setEditMode(false);
    setModalVisibility(true);
  };

  /**
   * Handle refresh the table
   *
   * @returns {void}
   **/
  const handleRefresh = async () => {
    setRefreshLoader(true);
    await dispatch(getUsers());
    setRefreshLoader(false);
  };

  const tableData = users?.map((user) => {
    return {
      key: user._id,
      name: humanize(user.username),
      email: user.email,
      role: user.role,
      status: user.activate ? 'Active' : 'Inactive',
      action: (
        <Button
          className="bg-green-600"
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            showModal('edit');
            setDataSet(user);
            setModalVisibility(true);
          }}
        />
      )
    };
  });

  return (
    <Row>
      <Col span={24}>
        <UserModal
          editMode={editMode}
          modalVisibility={modalVisibility}
          setModalVisibility={setModalVisibility}
          dataSet={dataSet}
          setDataSet={setDataSet}
        />
        <ScalableCard limitwidth={false}>
          <Form form={form} layout="vertical">
            <TableToolBar
              search={true}
              refresh={true}
              add={true}
              deleteAll={true}
              deleteBtnDisabled={deleteBtnDisabled}
              deleteEventListener={async () => {
                await dispatch(deleteUsers(form.getFieldValue('users')));
                form.resetFields();
                dispatch(getUsers());
                setDeleteBtnDisabled(true);
              }}
              searchFieldHandler={(e) => {
                setSearch(e.target.value);
              }}
              refreshEventListener={handleRefresh}
              addEventListener={() => {
                return showModal('add');
              }}
            />
            <br />
            <Form
              onChange={() => {
                setDeleteBtnDisabled(
                  !(
                    Array.isArray(form.getFieldValue('users')) &&
                    form.getFieldValue('users').length > ZERO
                  )
                );
              }}
              layout="vertical"
              form={form}>
              <Form.Item name="users" hidden initialValue={[]} />

              <CustomTable
                form={{
                  formData: form,
                  key: 'users'
                }}
                dataSource={tableData}
                search={search}
                loading={refreshLoader || usersLoading}
                columns={TableColumns.IUserColumns}
                hasSelectedTitle={'Users'}
                setDeleteBtnDisabled={setDeleteBtnDisabled}
              />
            </Form>
          </Form>
        </ScalableCard>
      </Col>
    </Row>
  );
};

export default AdminUsersView;
