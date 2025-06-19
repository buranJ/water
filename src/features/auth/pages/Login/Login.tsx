import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Form, Input, Typography } from 'antd';
import logo from 'assets/icons/logo.svg';
import bg from 'assets/images/login-bg.png';
import './style.scss';

import { useLoginMutation } from 'api/Auth.api';

const Login: FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isFormValid, setIsFormValid] = useState(false);
  const [login, { isLoading, isError, error }] = useLoginMutation();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const response = await login(values).unwrap();
      if (response?.access) {
        localStorage.setItem('access_token', JSON.stringify(response.access));
      }
      if (response?.refresh) {
        localStorage.setItem('refresh_token', JSON.stringify(response.refresh));
      }
      navigate('/dashboard/geo');
    } catch (e) {
      console.error('Ошибка авторизации', e);
    }
  };

  const onValuesChange = () => {
    form
      .validateFields()
      .then(() => {
        setIsFormValid(true);
      })
      .catch(() => {
        setIsFormValid(false);
      });
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '50%', padding: '80px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt='' style={{ width: '38px', height: '38px' }} />
          <Typography.Title level={3} style={{ marginLeft: '8px' }}>
            Бишкексууканал
          </Typography.Title>
        </div>
        <Typography.Title level={3} style={{ marginTop: '107px' }}>
          Добро пожаловать
        </Typography.Title>
        <Typography.Text type='secondary'>Введите ваш ID и пароль</Typography.Text>
        <Form
          form={form}
          name='validateOnly'
          layout='vertical'
          style={{ marginTop: '24px' }}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          validateTrigger='onBlur'
        >
          <Form.Item
            name='email'
            label='email'
            rules={[
              { required: true, message: 'Введите ваш email' },
              { min: 5, message: 'Email должен быть минимум 5 символов' }
            ]}
          >
            <Input placeholder='Введите Email' size='large' style={{ background: '#f0f1f2' }} />
          </Form.Item>
          <Form.Item
            name='password'
            label='Пароль'
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 5, message: 'Пароль должен быть минимум 5 символов' }
            ]}
          >
            <Input.Password placeholder='Введите пароль' size='large' style={{ background: '#f0f1f2' }} />
          </Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Link to='/auth/forgot'>Забыли пароль?</Link>
          </div>
          <Form.Item style={{ marginTop: '24px' }}>
            <Button type='primary' htmlType='submit' size='large' style={{ width: '100%' }} disabled={!isFormValid || isLoading}>
              {isLoading ? 'Входим...' : 'Войти'}
            </Button>
          </Form.Item>
          {isError && <Typography.Text type='danger'>Произошла ошибка при авторизации: {JSON.stringify(error)}</Typography.Text>}
        </Form>
      </div>
      <div style={{ width: '50%' }}>
        <img src={bg} alt='' draggable='false' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export default Login;
