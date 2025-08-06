import { FC } from 'react';
import { Avatar, Button, Flex, List, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { data } from './Notification.helpers';
import './styles.scss';

interface IProps {
  title: string;
}

export const Notification: FC<IProps> = ({ title }) => {
  const handleDelete = () => {
    console.log('delete');
  };

  return (
    <DashboardLayout title={title}>
      <div className='notification'>
        <FilterBar
          onFilterChange={(value) => console.log(value)}
          actionButtons={
            <>
              <Button>Активные</Button>
              <Button>Новые</Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />
            </>
          }
        />

        {data.map((section) => (
          <div key={section.date}>
            <Typography.Title level={5} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: 4 }}>
              {section.date}
            </Typography.Title>
            <List
              itemLayout='vertical'
              dataSource={section.items}
              renderItem={(item) => (
                <List.Item>
                  <Flex>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          shape='circle'
                          style={{ backgroundColor: '#2F80ED' }}
                          icon={<img src={item.icon} alt='document' style={{ width: 26, height: 26 }} />}
                        />
                      }
                      title={<strong>{item.title}</strong>}
                      description={item.text}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                      <Flex gap={12} style={{ marginTop: 8 }}>
                        <Button>Назначить ответственного</Button>
                        <Button type='primary'>Открыть ТУ</Button>
                      </Flex>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#8C8C8C', fontSize: 12 }}>неделю назад</span>
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: '#2F80ED',
                            borderRadius: '50%',
                            display: 'inline-block'
                          }}
                        />
                      </div>
                    </div>
                  </Flex>
                </List.Item>
              )}
            />
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};
