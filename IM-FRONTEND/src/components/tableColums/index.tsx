import { Tag } from 'antd';

import { ColumnType } from 'antd/es/table';
import { IUserTable } from './types';
import { humanize } from 'utils';
export const IUserColumns: ColumnType<IUserTable>[] = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => {
      return <Tag color={role === 'admin' ? 'green' : 'gray'}>{humanize(role)}</Tag>;
    }
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      return <Tag color={status ? 'green' : 'red'}>{status ? 'Active' : 'Inactive'}</Tag>;
    }
  },
  {
    title: 'Action',
    dataIndex: 'action',
    key: 'action'
  }
];
