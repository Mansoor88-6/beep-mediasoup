/* eslint-disable no-magic-numbers */
import React from 'react';
import { Row, Col, Grid, Popconfirm } from 'antd';
import { EditOutlined, SearchOutlined } from '@ant-design/icons';
import { ITableToolBarProps } from './types';
import { ScalableButton, ScalableInput } from 'components';
import { InputLength } from 'types';
import { DeleteIcon, PlusIcon, RefreshCcw } from 'lucide-react';

const { useBreakpoint } = Grid;
/**
 * This is table header component
 *
 * @param {ITableToolBarProps} props - Input
 * @returns {React.FC} TableHeader component
 */
const TableToolBar: React.FC<ITableToolBarProps> = (props: ITableToolBarProps) => {
  const {
    search,
    searchFieldHandler,
    searchPlaceHolder,
    childrenBoxColProps,
    searchBoxColProps,
    refresh,
    deleteAll,
    deleteMessage,
    wildCardOperator,
    wildCardFieldHandler,
    edit,
    children,
    add,
    justifyParent,
    gutter,
    utilityBtnsColProps,
    reportDelete,
    forceRerender,
    inputWhite
  } = props;
  const { sm } = useBreakpoint();
  /*
   As edit || refresh || add || deleteAll use 4 flex
   so if all of them are not available, we have 4 ramaining
   flex. If one of them is present we set it to 24 to go to next line
   */
  return (
    <Row
      className="toolbar-container"
      justify={justifyParent}
      key={forceRerender}
      align="middle"
      gutter={gutter}>
      {search && (
        <Col {...searchBoxColProps}>
          <Row justify="space-evenly">
            {props.SearchNode ? (
              <>{props.SearchNode}</>
            ) : (
              <ScalableInput
                onChange={(e) => {
                  if (searchFieldHandler) {
                    return searchFieldHandler(e);
                  }
                  return undefined;
                }}
                white={inputWhite}
                placeholder={searchPlaceHolder}
                className="toolbar-search"
                suffix={<SearchOutlined />}
                maxLength={InputLength.TABLE_TOOLBAR_SEARCH_LENGTH}
              />
            )}
          </Row>
        </Col>
      )}

      {(edit || refresh || add || deleteAll) && (
        <Col {...(utilityBtnsColProps || { xs: 24, sm: 16 })}>
          <Row justify="space-around">
            {edit && (
              <ScalableButton
                onClick={props.editEventListener ? props.editEventListener : () => {}}
                type="primary"
                icon={<EditOutlined />}>
                Edit
              </ScalableButton>
            )}
            {refresh && (
              <ScalableButton
                type="link"
                className="flex justify-center items-center text-green-800"
                onClick={props.refreshEventListener ? props.refreshEventListener : () => {}}
                icon={<RefreshCcw />}>
                Refresh
              </ScalableButton>
            )}
            {add && (
              <ScalableButton
                type="link"
                className="flex justify-center items-center text-green-800"
                onClick={props.addEventListener ? props.addEventListener : () => {}}
                icon={<PlusIcon />}>
                Add
              </ScalableButton>
            )}
            {wildCardOperator && wildCardFieldHandler && (
              <ScalableButton
                onClick={props.wildCardFieldHandler ? props.wildCardFieldHandler : () => {}}>
                {wildCardOperator}
              </ScalableButton>
            )}
            {deleteAll &&
              (reportDelete ? (
                <Popconfirm
                  title={deleteMessage || 'Delete Report(s) with all of its history?'}
                  placement="left"
                  onConfirm={() => {
                    return props.deleteEventListener
                      ? props.deleteEventListener?.('all')
                      : () => {};
                  }}
                  onCancel={() => {
                    return props.deleteEventListener
                      ? props.deleteEventListener?.('single')
                      : () => {};
                  }}
                  // onCancel={() => {}}
                  okText="All"
                  cancelText="Single">
                  <ScalableButton
                    type="link"
                    className="flex justify-center items-center text-green-800"
                    icon={<DeleteIcon />}
                    disabled={props.deleteBtnDisabled || false}
                    danger></ScalableButton>
                </Popconfirm>
              ) : (
                <Popconfirm
                  title={
                    deleteMessage || (
                      <>
                        Please confirm delete <br />
                        (This is irreversible)
                      </>
                    )
                  }
                  onConfirm={() => {
                    return props.deleteEventListener ? props.deleteEventListener?.() : () => {};
                  }}
                  placement="left"
                  onCancel={() => {}}
                  okText="Yes"
                  cancelText="No">
                  <ScalableButton
                    className="flex justify-center items-center text-green-800"
                    icon={<DeleteIcon />}
                    disabled={props.deleteBtnDisabled || false}
                    danger>
                    Delete
                  </ScalableButton>
                </Popconfirm>
              ))}
          </Row>
        </Col>
      )}
      {children && (
        <Col className={!sm ? 'toolbar-additional-xs-col' : ''} {...childrenBoxColProps}>
          {children}
        </Col>
      )}
    </Row>
  );
};

TableToolBar.defaultProps = {
  gutter: 0,
  justifyParent: 'start',
  searchPlaceHolder: 'Search',
  searchBoxColProps: {
    xs: 24,
    sm: 8
  },
  childrenBoxColProps: {
    xs: 24,
    sm: 8
  },
  SearchNode: undefined
};

export default TableToolBar;
