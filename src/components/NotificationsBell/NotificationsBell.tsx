import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Alert, Avatar, Badge, Button, Divider, Flex, List, Popover, Spin, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import type { INotification } from 'types/entities';
import archiverIcon from 'assets/icons/archive.svg';
import documentIcon from 'assets/icons/document.svg';
import './styles.scss';

import {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useLazyGetUnreadCountQuery,
  useMarkAllAsReadMutation
} from 'api/Notifications.api';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNotificationsWS } from 'hooks/useNotificationsWS';

const getIconByType = (type: string) => {
  switch (type) {
    case 'tu_created':
      return archiverIcon;
    case 'application_created':
      return documentIcon;
    default:
      return documentIcon;
  }
};

export const NotificationsBell = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data, isLoading, isError, error } = useGetNotificationsQuery();
  const [refetchList] = useLazyGetNotificationsQuery();
  const [refetchCount] = useLazyGetUnreadCountQuery();
  const [markAllAsRead, { isLoading: isMarkingAll }] = useMarkAllAsReadMutation();

  const ws = useNotificationsWS({
    enabled: true,
    onNotification: () => {
      refetchList({ ordering: '-created_at' });
      refetchCount();
    },
    onUnreadList: (list) => {
      console.log('[WS->UI] onUnreadList size:', Array.isArray(list) ? list.length : 0);
      refetchList({ ordering: '-created_at' });
      refetchCount();
    }
  });

  const results = useMemo<INotification[]>(() => data?.results ?? [], [data?.results]);
  const unreadCount = results.filter((n) => !n.is_read).length;

  const itemsToShow = useMemo(() => {
    // показываем до 5 последних
    return [...results].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)).slice(0, 5);
  }, [results]);

  const errorMsg = useMemo(() => {
    if (!isError || !error) return '';
    if ('status' in error) {
      const e = error as FetchBaseQueryError;
      if (typeof e.data === 'string') return e.data;
      try {
        return JSON.stringify(e.data);
      } catch {
        return 'Request error';
      }
    }
    const e = error as SerializedError;
    return e.message || 'Request error';
  }, [isError, error]);

  const handleMarkAll = async () => {
    console.log('[UI] Mark all as read clicked');
    ws.sendMarkAllAsRead();
    try {
      await markAllAsRead().unwrap();
      console.log('[REST] markAllAsRead: success');
    } catch (e) {
      console.log('[REST] markAllAsRead: failed', e);
    }
    refetchList({ ordering: '-created_at' });
    refetchCount();
  };

  const content = (
    <div className='notif-popover'>
      <Flex align='center' justify='space-between' className='notif-popover__header'>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('routers.notifications')}
        </Typography.Title>
        <Button type='link' onClick={handleMarkAll} loading={isMarkingAll}>
          {t('notification.markAllAsRead')}
        </Button>
      </Flex>

      {isLoading && (
        <Flex justify='center' style={{ padding: 16 }}>
          <Spin />
        </Flex>
      )}

      {isError && <Alert type='error' showIcon message={t('common.errorPrefix')} description={errorMsg} style={{ marginTop: 8 }} />}

      {!isLoading && !isError && (
        <>
          <List
            itemLayout='horizontal'
            dataSource={itemsToShow}
            locale={{ emptyText: t('common.noData') }}
            renderItem={(item) => (
              <List.Item className='notif-popover__item'>
                <Flex align='start' justify='space-between' style={{ width: '100%' }}>
                  <Flex gap={12}>
                    <Avatar
                      shape='circle'
                      style={{ backgroundColor: '#2F80ED' }}
                      icon={<img src={getIconByType(item.type)} alt='icon' style={{ width: 22, height: 22 }} />}
                    />
                    <div>
                      <Typography.Text strong className='notif-popover__title'>
                        {item.title}
                      </Typography.Text>
                      <div className='notif-popover__message'>{item.message}</div>
                      <div className='notif-popover__time'>
                        {formatDistanceToNow(parseISO(item.created_at), { addSuffix: true, locale: ru })}
                      </div>
                    </div>
                  </Flex>
                  {!item.is_read && <span className='notif-popover__dot' />}
                </Flex>
              </List.Item>
            )}
          />

          <Divider style={{ margin: '8px 0 12px' }} />
          <div style={{ textAlign: 'center' }}>
            <Button
              type='link'
              onClick={() => {
                setOpen(false);
                navigate('/dashboard/notifications');
              }}
            >
              {t('notification.seeAll')}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover
      placement='bottomRight'
      trigger='click'
      open={open}
      onOpenChange={setOpen}
      overlayClassName='notif-popover__overlay'
      content={content}
    >
      <Badge dot={unreadCount > 0}>
        <Button icon={<BellOutlined />} />
      </Badge>
    </Popover>
  );
};
