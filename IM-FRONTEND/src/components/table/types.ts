import React from 'react';
import { TableProps } from 'antd';
import { FormInstance } from 'antd/lib/form/Form';

export interface ITableProps extends Partial<TableProps<any>> {
  nested?: boolean;
  selectable?: boolean;
  setDeleteBtnDisabled?: React.Dispatch<React.SetStateAction<boolean>>;
  search?: string;
  searchFilter?: Array<string | Record<string, string>>;
  form?: {
    formData: FormInstance<any>;
    key: string;
  };
  hasSelectedTitle?: string;
  showDrawer?: boolean;
  drawerState?: boolean;
  setDrawerState?: React.Dispatch<React.SetStateAction<boolean>>;
  drawerChildren?: React.ReactNode;
  drawerTitle?: React.ReactNode;
}
