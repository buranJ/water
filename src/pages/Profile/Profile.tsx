import { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Typography } from 'antd';
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
    // Очистка токенов
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // Очистка кэша браузера
    window.history.replaceState(null, '', '/');
    // Редирект на главную страницу
    navigate('/', { replace: true });
  };

  const currentLang = i18n.language;

  return (
    <DashboardLayout title={t(title)}>
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

                <div className='language-settings__radio-group'>
                  <label>
                    <input type='radio' name='language' value='ru' checked={currentLang === 'ru'} onChange={() => changeLanguage('ru')} />
                    {t('profile.ru')}
                  </label>
                  <label>
                    <input type='radio' name='language' value='kg' checked={currentLang === 'kg'} onChange={() => changeLanguage('kg')} />
                    {t('profile.kg')}
                  </label>
                  <label>
                    <input type='radio' name='language' value='en' checked={currentLang === 'en'} onChange={() => changeLanguage('en')} />
                    {t('profile.en')}
                  </label>
                </div>
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
