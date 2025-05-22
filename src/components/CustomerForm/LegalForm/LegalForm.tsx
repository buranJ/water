import { FC } from 'react';
import { Form, Input } from 'antd';

const LegalForm: FC = () => {
  return (
    <>
      <Form.Item
        name='companyName'
        label='Название компании'
        rules={[{ required: true, message: 'Пожалуйста, введите название компании!' }]}
      >
        <Input size='large' placeholder='Название компании' />
      </Form.Item>

      <Form.Item name='ogrn' label='ОГРН' rules={[{ required: true, message: 'Пожалуйста, введите ОГРН!' }]}>
        <Input size='large' placeholder='789010' />
      </Form.Item>

      <Form.Item
        name='contactData'
        label='Контактные данные'
        rules={[{ required: true, message: 'Пожалуйста, введите контактные данные!' }]}
      >
        <Input size='large' placeholder='0999700700' />
      </Form.Item>
    </>
  );
};

export default LegalForm;
