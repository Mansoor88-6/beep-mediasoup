import React, { useEffect, useState } from 'react';
import CustomTable from '../../../components/table';
import { Button, Form } from 'antd';
import { useSelector } from 'react-redux';
import { UserSelector } from 'appRedux/reducers';
import { deleteUsers, getUsers } from 'appRedux/actions/userAction';
import { IUserColumns } from 'components/tableColums/index';
import { humanize } from 'utils';
import UserModal from './UserModal';
import { IUser } from 'types/ReduxTypes/user';
import { useAppDispatch } from 'appRedux/store';
import { EditOutlined } from '@ant-design/icons';
import { IUserTable } from 'components/tableColums/types';
/**
 * Render Users Management Page
 *
 * @returns {JSX.Element}
 **/
const AdminUsersView = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [loader, setLoader] = useState(false);
  const [modalVisibility, setModalVisibility] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dataSet, setDataSet] = useState<IUser | null | undefined>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { users, usersLoading } = useSelector(UserSelector);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);

  useEffect(() => {
    dispatch(getUsers());
  }, []);

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
    setLoader(true);
    await dispatch(getUsers());
    setLoader(false);
  };

  /**
   * Handle search in table
   *
   * @param searchText - Search text
   * @returns {void}
   */
  const handleSearch = (searchText: string) => {
    const filteredUsers = users?.filter((user) => {
      return user?.username?.toLowerCase().includes(searchText.toLowerCase());
    });
    setFilteredUsers(filteredUsers || []);
  };

  /**
   * Handle selected rows
   *
   * @param selectedRows - Array of selected row keys
   * @returns {void}
   */
  const handleSelection = (selectedRows: IUserTable[]) => {
    setSelectedIds(
      selectedRows.map((row: IUserTable) => {
        return row.key as string;
      })
    );
  };

  const tableData = filteredUsers?.map((user) => {
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
    <>
      <UserModal
        editMode={editMode}
        modalVisibility={modalVisibility}
        setModalVisibility={setModalVisibility}
        dataSet={dataSet}
        setDataSet={setDataSet}
      />
      <Form form={form} layout="vertical">
        <CustomTable
          columns={IUserColumns}
          dataSource={tableData}
          loading={usersLoading || loader}
          enableSelection
          onSelectionChange={handleSelection}
          toolbarProps={{
            onSearch: handleSearch,
            onRefresh: handleRefresh,
            onDelete:
              selectedIds.length > 0
                ? async () => {
                    setLoader(true);
                    await dispatch(deleteUsers(selectedIds));
                    await dispatch(getUsers());
                    setSelectedIds([]);
                    setLoader(false);
                  }
                : undefined
          }}
        />
      </Form>
    </>
  );
};

export default AdminUsersView;
