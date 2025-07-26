import { Pagination as AntPagination } from 'antd';
import './styles.scss';

export const Pagination = () => {
  return (
    <div className='pagination-container'>
      <AntPagination total={50} />
    </div>
  );
};
