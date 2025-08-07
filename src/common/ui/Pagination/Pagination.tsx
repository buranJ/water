import { FC } from 'react';
import { Pagination as AntPagination, PaginationProps } from 'antd';
import './styles.scss';

type IProps = PaginationProps & {
  handlePageChange?: (page: number, pageSize?: number) => void;
};

export const Pagination: FC<IProps> = (props) => {
  return (
    <div className='pagination-container'>
      <AntPagination {...props} align='center' />
    </div>
  );
};
