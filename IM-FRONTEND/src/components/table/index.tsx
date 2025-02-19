import React, { useEffect, useState } from 'react';
import { Table, Drawer } from 'antd';
import { ITableProps } from './types';
import { UpOutlined, DownOutlined } from '@ant-design/icons';
import { RenderExpandIconProps } from 'rc-table/lib/interface';
import { searchInArrayOfObjectsandStrings } from 'utils';
// const { useBreakpoint } = Grid;
/**
 * expandable table icon props
 *
 * @param {RenderExpandIconProps<any>} props - table icon props
 * @returns {React.FC} return icon
 */
const ExpandIconRenderer: React.FC<RenderExpandIconProps<any>> = (
  props: RenderExpandIconProps<any>
) => {
  const { expanded, onExpand, record } = props;
  return expanded ? (
    <UpOutlined
      onClick={(e) => {
        return onExpand(record, e);
      }}
    />
  ) : (
    <DownOutlined
      onClick={(e) => {
        return onExpand(record, e);
      }}
    />
  );
};
/**
 * Component
 *
 * @param {ITableProps<any>} props - props for table component
 * @returns {React.FC} returns React.Component for table
 */
const CustomTable: React.FC<ITableProps> = (props: ITableProps) => {
  const {
    size,
    children,
    expandable,
    selectable,
    hasSelectedTitle,
    form,
    nested,
    dataSource,
    search,
    searchFilter,
    showDrawer,
    drawerState,
    setDrawerState,
    drawerChildren,
    drawerTitle,
    setDeleteBtnDisabled,
    ...rest
  } = props;
  // const screens = useBreakpoint();
  const zero = 0;
  // const mdOrUp = Boolean(screens.md);
  // const tableSize = mdOrUp ? 'large' : 'small';
  const tableSize = 'small';
  const [dataKeys, setDataKeys] = useState<Array<string | Record<string, string>>>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataRowIds, setDataRowIds] = useState<Array<string>>([]);

  const drawerContainerStyle: React.CSSProperties = {
    minHeight: '400px',
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'center'
  };

  /**
   * Close drawer
   */
  const onClose = () => {
    if (setDrawerState) {
      setDrawerState(false);
    }
  };

  useEffect(() => {
    if (form?.formData.getFieldValue(form.key)) {
      setSelectedRowKeys(form?.formData.getFieldValue(form.key));
    }
  }, []);

  /**
   * Change selected row keys
   *
   * @param {React.Key[]} newSelectedRowKeys - Selected rows key
   */
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    let newKeys: Array<React.Key> = Array.from(new Set(selectedRowKeys.concat(newSelectedRowKeys)));
    newKeys = newKeys.filter((key) => {
      if (dataRowIds.includes(key as string) && !newSelectedRowKeys.includes(key as string)) {
        return false;
      }
      return true;
    });

    setSelectedRowKeys(newKeys);
    if (setDeleteBtnDisabled) {
      setDeleteBtnDisabled(!(Array.isArray(newKeys) && newKeys.length > zero));
    }
    form && form.formData.setFieldValue(form.key, newKeys);
    form && form.formData.validateFields();
  };

  const rowSelection = {
    selectedRowKeys: selectedRowKeys,
    onChange: onSelectChange,
    selections: [Table.SELECTION_INVERT, Table.SELECTION_NONE]
  };

  useEffect(() => {
    /**
     * If search filter is available use it oterhwise
     * get datasource keys if available.
     */
    if (dataKeys?.length <= zero) {
      setDataKeys(
        searchFilter && searchFilter?.length > zero
          ? searchFilter
          : dataSource && dataSource?.length > zero
          ? Object.keys(dataSource[zero])
          : []
      );
    }
    setDataRowIds(
      dataSource?.map((source) => {
        return source?.key as string;
      }) || []
    );
  }, [searchFilter, dataSource]);

  useEffect(() => {
    /**
     * If data is updated e.g, some rows are deleted, update
     * setSelectedRowKeys states.
     */
    if (
      form?.formData.getFieldValue(form.key)?.length === zero &&
      selectedRowKeys?.length !== zero
    ) {
      setSelectedRowKeys([]);
    }
  }, [form?.formData.getFieldValue(form.key)]);

  /**
   * Render drawer component inside table if required
   *
   * @returns {React.FC} returns drawer component
   */
  const renderDrawer = () => {
    if (showDrawer && drawerChildren) {
      return (
        <Drawer
          width={500}
          title={drawerTitle || <></>}
          placement="right"
          closable={false}
          onClose={onClose}
          open={drawerState}
          getContainer={false}>
          {drawerChildren}
        </Drawer>
      );
    }
    return <></>;
  };

  const filteredData = search
    ? dataSource?.filter(searchInArrayOfObjectsandStrings(search, dataKeys))
    : dataSource;
  return (
    <>
      {!nested ? (
        !selectable ? (
          <div style={showDrawer ? drawerContainerStyle : undefined}>
            {showDrawer && renderDrawer()}
            <Table size={tableSize} dataSource={filteredData} {...rest} rowSelection={undefined}>
              {children}
            </Table>
          </div>
        ) : (
          <>
            <span>
              {selectedRowKeys?.length > zero
                ? `${selectedRowKeys?.length} ${hasSelectedTitle} Selected!`
                : ''}
            </span>
            <div style={showDrawer ? drawerContainerStyle : undefined}>
              {showDrawer && renderDrawer()}
              <Table size={'small'} dataSource={filteredData} rowSelection={rowSelection} {...rest}>
                {children}
              </Table>
            </div>
          </>
        )
      ) : !selectable ? (
        <div style={showDrawer ? drawerContainerStyle : undefined}>
          {showDrawer && renderDrawer()}
          <Table
            size={tableSize}
            rowSelection={undefined}
            expandable={{
              expandIcon: ({ expanded, onExpand, record, prefixCls }) => {
                return (
                  <ExpandIconRenderer
                    expanded={expanded}
                    onExpand={onExpand}
                    record={record}
                    prefixCls={prefixCls}
                    expandable={true}
                  />
                );
              },
              ...expandable
            }}
            dataSource={filteredData}
            {...rest}>
            {children}
          </Table>
        </div>
      ) : (
        <>
          <span>
            {selectedRowKeys?.length > zero
              ? `${selectedRowKeys?.length} ${hasSelectedTitle} Selected!`
              : ''}
          </span>
          <div style={showDrawer ? drawerContainerStyle : undefined}>
            {showDrawer && renderDrawer()}
            <Table
              size={tableSize}
              rowSelection={rowSelection}
              expandable={{
                expandIcon: ({ expanded, onExpand, record, prefixCls }) => {
                  return (
                    <ExpandIconRenderer
                      expanded={expanded}
                      onExpand={onExpand}
                      record={record}
                      prefixCls={prefixCls}
                      expandable={true}
                    />
                  );
                },
                ...expandable
              }}
              dataSource={filteredData}
              {...rest}>
              {children}
            </Table>
          </div>
        </>
      )}
    </>
  );
};
CustomTable.defaultProps = {
  scroll: { x: true },
  selectable: true,
  className: 'tbody-primary thead-primary',
  search: '',
  searchFilter: [],
  pagination: {
    position: ['bottomCenter'],
    showSizeChanger: true,
    defaultPageSize: 5,
    // eslint-disable-next-line no-magic-numbers
    pageSizeOptions: [5, 10, 20, 50]
  }
};

ExpandIconRenderer.defaultProps = {};
export default CustomTable;
