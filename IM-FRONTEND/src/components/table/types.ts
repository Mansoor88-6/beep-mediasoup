import { TableProps } from 'antd';

export interface ToolbarProps {
  onRefresh?: () => void;
  onDelete?: (selectedRows: any[]) => void;
  onSearch?: (searchText: string) => void;
  extraButtons?: React.ReactNode;
  selectedRows?: any[];
  searchPlaceholder?: string;
}

export interface CustomTableProps<T> extends Omit<TableProps<T>, 'rowSelection'> {
  toolbarProps?: ToolbarProps;
  enableSelection?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
}
