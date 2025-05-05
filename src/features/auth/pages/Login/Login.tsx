import { FC, useState } from 'react';
import type { FormProps } from 'antd';
import { Button, Flex, Form, Input, Typography } from 'antd';
import { Link } from 'react-router';
import bg from 'assets/images/login-bg.png';
import logo from 'assets/images/logo.png';
import './style.scss';

const Login: FC = () => {
  const [form] = Form.useForm();
  const [isFormValid, setIsFormValid] = useState(false);

  const onFinish: FormProps['onFinish'] = (values) => {
    console.log('Form values:', values);
  };

  const onValuesChange: FormProps['onValuesChange'] = () => {
    form
      .validateFields()
      .then(() => {
        setIsFormValid(true);
        console.log('Форма валидна');
      })
      .catch((errors) => {
        setIsFormValid(false);
        console.log('Ошибки валидации:', errors);
      });
  };

  return (
    <Flex style={{ height: '100vh' }}>
      <div style={{ width: '50%', padding: '80px' }}>
        <Flex align='center'>
          <img src={logo} alt='' style={{ width: '38px', height: '38px' }} />
          <Typography.Title level={3} style={{ margin: '0 0 0 8px' }}>
            Бишкексууканал
          </Typography.Title>
        </Flex>

        <Typography.Title level={3} style={{ marginTop: '107px' }}>
          Добро пожаловать
        </Typography.Title>
        <Typography.Text type='secondary'>Введите ваш ID и пароль</Typography.Text>

        <Form
          form={form}
          variant='filled'
          name='validateOnly'
          layout='vertical'
          style={{ marginTop: '24px' }}
          onFinish={onFinish}
          onValuesChange={onValuesChange}
          validateTrigger='onBlur'
        >
          <Form.Item
            name='id'
            label='ID'
            rules={[
              { required: true, message: 'Введите ваш ID' },
              { type: 'string', min: 5, message: 'ID должен быть минимум 5 символов' }
            ]}
          >
            <Input placeholder='Введите ID' style={{ background: '#f0f1f2' }} size='large' />
          </Form.Item>
          <Form.Item
            name='password'
            label='Пароль'
            rules={[
              { required: true, message: 'Введите пароль' },
              { type: 'string', min: 5, message: 'Пароль должен быть минимум 5 символов' }
            ]}
          >
            <Input.Password placeholder='Введите пароль' style={{ background: '#f0f1f2' }} size='large' />
          </Form.Item>

          <div style={{ textAlign: 'right' }}>
            <Link to='/auth/forgot'>Забыли пароль?</Link>
          </div>

          <Form.Item style={{ marginTop: '24px' }}>
            <Button type='primary' htmlType='submit' size='large' style={{ width: '100%' }} disabled={!isFormValid}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div style={{ width: '50%' }}>
        <img src={bg} draggable='false' alt='' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </Flex>
  );
};

export default Login;
