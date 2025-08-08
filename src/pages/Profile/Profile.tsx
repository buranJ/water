import { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
// import type { RadioChangeEvent } from 'antd';
import { Button, Modal, Typography } from 'antd';
import { Radio } from 'antd';
import { FlagOutlined, UserOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components';
import './style.scss';

interface IProps {
  title: string;
}

export const Profile: FC<IProps> = ({ title }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('language');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.history.replaceState(null, '', '/');
    navigate('/', { replace: true });
  };

  const currentLang = i18n.language;

  return (
    <DashboardLayout title={title}>
      <div className='language-settings'>
        <aside className='language-settings__sidebar'>
          <ul>
            <div className={`language-settings__item ${activeTab === 'language' ? 'active' : ''}`} onClick={() => setActiveTab('language')}>
              <FlagOutlined style={{ fontSize: '20px' }} />
              <li>{t('profile.currentLang')}</li>
            </div>
            <div className={`language-settings__item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
              <UserOutlined style={{ fontSize: '20px' }} />
              <li>{t('profile.account')}</li>
            </div>
          </ul>
        </aside>

        <section className='language-settings__content'>
          {activeTab === 'language' && (
            <div>
              <h2 className='language-settings__title'>{t('profile.currentLang')}</h2>
              <div className='language-settings__box'>
                <h3>{t('profile.description')}</h3>
                <p className='language-settings__subtitle'>{t('profile.selectLanguageHint')}</p>
                <Radio.Group
                  onChange={(e) => changeLanguage(e.target.value)}
                  value={currentLang}
                  className='language-settings__radio-group'
                >
                  <Radio value='ru'>{t('profile.ru')}</Radio>
                  <Radio value='kg'>{t('profile.kg')}</Radio>
                  <Radio value='en'>{t('profile.en')}</Radio>
                </Radio.Group>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className='language-settings__account-group'>
              <h2 className='language-settings__title'>{t('profile.account')}</h2>
              <div className='account-settings__info'>
                <Typography.Text className='language-settings__account-group-item' strong>
                  Кайрат Буранов
                </Typography.Text>
                <Typography.Text className='language-settings__account-group-item' type='secondary'>
                  ID 4433954
                </Typography.Text>
                <Typography.Text className='language-settings__account-group-item' type='secondary'>
                  kairat.buranov@example.com
                </Typography.Text>
              </div>
              <Button className='logout-btn' onClick={() => setIsModalVisible(true)}>
                {t('profile.logout')}
              </Button>
            </div>
          )}
        </section>
      </div>

      <Modal
        title={t('profile.confirmTitle')}
        open={isModalVisible}
        onOk={handleLogout}
        onCancel={() => setIsModalVisible(false)}
        okText={t('profile.yes')}
        cancelText={t('profile.no')}
        centered
      >
        <p>{t('profile.confirmLogout')}</p>
      </Modal>
    </DashboardLayout>
  );
};
