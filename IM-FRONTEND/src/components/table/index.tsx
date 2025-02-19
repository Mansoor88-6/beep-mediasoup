import React, { useState } from 'react';
import { Table, Button, Input, Row, Col } from 'antd';
import { ReloadOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { CustomTableProps, ToolbarProps } from './types';

/**
 * Table Toolbar Component
 *
 * @param {ToolbarProps} props
 * @returns {JSX.Element}
 **/
const TableToolbar: React.FC<ToolbarProps> = ({
  onRefresh,
  onDelete,
  onSearch,
  extraButtons,
  selectedRows = [],
  searchPlaceholder = 'Search...'
}) => {
  const [searchText, setSearchText] = useState<string>('');

  // Add debounced search
  React.useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch?.(searchText);
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [searchText, onSearch]);

  /**
   * Handles the search functionality
   */
  const handleSearch = () => {
    onSearch?.(searchText);
  };

  /**
   * Handles the key press event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Row gutter={[16, 16]} className="mb-3" justify="space-between" align="middle">
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Input
          size="large"
          placeholder={searchPlaceholder}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          style={{ width: '100%' }}
          suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={handleSearch} />}
        />
      </Col>
      <Col xs={24} sm={24} md={12} lg={12} xl={12}>
        <Row gutter={[8, 8]} justify="end">
          <Col>
            <Button type="dashed" icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          </Col>
          {selectedRows.length > 0 && (
            <Col>
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() => {
                  onDelete?.(selectedRows);
                }}>
                Delete Selected ({selectedRows.length})
              </Button>
            </Col>
          )}
          {extraButtons && <Col>{extraButtons}</Col>}
        </Row>
      </Col>
    </Row>
  );
};

/**
 * Custom Table Component
 *
 * @param {CustomTableProps} props
 * @returns {JSX.Element}
 **/
const CustomTable = <T extends object>({
  toolbarProps,
  enableSelection,
  onSelectionChange,
  ...tableProps
}: CustomTableProps<T>) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<T[]>([]);

  // Add useEffect to watch for delete operation
  React.useEffect(() => {
    if (toolbarProps?.onDelete) {
      const originalOnDelete = toolbarProps.onDelete;
      toolbarProps.onDelete = async (rows: T[]) => {
        await originalOnDelete(rows);
        // Clear selection after delete
        setSelectedRowKeys([]);
        setSelectedRows([]);
        onSelectionChange?.([]);
      };
    }
  }, [toolbarProps?.onDelete, onSelectionChange]);

  const rowSelection = enableSelection
    ? {
        selectedRowKeys,
        onChange: (selectedKeys: React.Key[], selected: T[]) => {
          setSelectedRowKeys(selectedKeys);
          setSelectedRows(selected);
          onSelectionChange?.(selected);
        }
      }
    : undefined;

  return (
    <div>
      {toolbarProps && <TableToolbar {...toolbarProps} selectedRows={selectedRows} />}
      <Table {...tableProps} rowSelection={rowSelection} />
    </div>
  );
};

export default CustomTable;
