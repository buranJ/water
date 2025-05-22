import { FC } from 'react';
import { Button, Form, Input, Radio, Select, Typography } from 'antd';
import IndividualForm from './IndividualForm/Individual';
import LegalForm from './LegalForm/LegalForm';
import './styles.scss';

const { Option } = Select;
const { Title } = Typography;

export interface CustomerFormData {
  type: 'individual' | 'legal';
  inn: string;
  passportData: string;
  companyName?: string;
  contactData: string;
  address: string;
  status: 'active' | 'rejected';
}

interface CustomerFormProps {
  initialValues?: CustomerFormData;
  onSave: (values: CustomerFormData) => void;
  onCancel: () => void;
}

export const CustomerForm: FC<CustomerFormProps> = ({ initialValues, onSave, onCancel }) => {
  const [form] = Form.useForm<CustomerFormData>();

  const handleFinish = (values: CustomerFormData) => {
    onSave(values);
    form.resetFields();
  };

  return (
    <div className='customer-form'>
      <Title level={3}>Добавить заказчика</Title>
      <Form
        form={form}
        layout='vertical'
        name='customer_form'
        variant='filled'
        onFinish={handleFinish}
        initialValues={initialValues || { type: 'individual', status: 'active' }}
        requiredMark={false}
      >
        <Form.Item name='type' label='Выбор типа' rules={[{ required: true, message: 'Пожалуйста, выберите тип!' }]}>
          <Radio.Group size='large' block>
            <Radio.Button value='individual'>Физическое лицо</Radio.Button>
            <Radio.Button value='legal'>Юридическое лицо</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}>
          {({ getFieldValue }) => (getFieldValue('type') === 'individual' ? <IndividualForm /> : <LegalForm />)}
        </Form.Item>

        <Form.Item name='address' label='Адрес регистрации' rules={[{ required: true, message: 'Пожалуйста, введите адрес!' }]}>
          <Input size='large' placeholder='Введите адрес' />
        </Form.Item>

        <Form.Item name='status' label='Статус' rules={[{ required: true, message: 'Пожалуйста, выберите статус!' }]}>
          <Select size='large' placeholder='Выберите статус'>
            <Option value='active'>Активен</Option>
            <Option value='rejected'>Отклонен</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button size='large' type='primary' htmlType='submit' style={{ marginRight: 8 }}>
            Добавить
          </Button>
          <Button size='large' onClick={onCancel}>
            Назад
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
