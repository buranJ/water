import { FC } from 'react';
import { Flex, Form, Input } from 'antd';

const Individual: FC = () => {
  return (
    <>
      <Form.Item name='fio' label='ФИО' rules={[{ required: true, message: 'Пожалуйста, введите ИНН!' }]}>
        <Input size='large' placeholder='ФИО' />
      </Form.Item>

      <Form.Item name='inn' label='ИНН' rules={[{ required: true, message: 'Пожалуйста, введите ИНН!' }]}>
        <Input size='large' placeholder='123456789010' />
      </Form.Item>

      <Flex gap={16}>
        <Form.Item
          name='passportData'
          label='Паспортные данные'
          rules={[{ required: true, message: 'Пожалуйста, введите паспортные данные!' }]}
        >
          <Input size='large' placeholder='14 марта 2025' />
        </Form.Item>

        <Form.Item
          name='contactData'
          label='Контактные данные'
          rules={[{ required: true, message: 'Пожалуйста, введите контактные данные!' }]}
        >
          <Input size='large' placeholder='0999700700' />
        </Form.Item>
      </Flex>
    </>
  );
};

export default Individual;
