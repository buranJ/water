import { FC, useEffect } from 'react';
import { Button, Form, Input, InputNumber, Modal } from 'antd';
import { FormulaItem } from 'types/entities';

export interface FormulaEditData {
  title: string;
  koefficent: number;
}

interface FormulaEditFormProps {
  visible: boolean;
  formula?: FormulaItem;
  loading?: boolean;
  onSubmit: (data: FormulaEditData) => Promise<void>;
  onCancel: () => void;
}

export const FormulaEditForm: FC<FormulaEditFormProps> = ({ visible, formula, loading = false, onSubmit, onCancel }) => {
  const [form] = Form.useForm<FormulaEditData>();
  useEffect(() => {
    if (visible && formula) {
      form.setFieldsValue({
        title: formula.title,
        koefficent: formula.koefficent
      });
    }
  }, [visible, formula, form]);

  const handleSubmit = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  const handleCancel = (): void => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title='Редактирование формулы'
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      centered
      destroyOnHidden
      styles={{
        header: {
          borderBottom: 'none',
          paddingBottom: 0
        },
        body: {
          paddingTop: 0
        }
      }}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} size='large' style={{ marginTop: 24 }}>
        <Form.Item
          name='title'
          label={<span style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f' }}>Название *</span>}
          rules={[
            { required: true, message: 'Введите название формулы' },
            { min: 2, message: 'Название должно содержать минимум 2 символа' },
            { max: 100, message: 'Название не должно превышать 100 символов' }
          ]}
          style={{ marginBottom: 24 }}
        >
          <Input
            placeholder='Заполните'
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              fontSize: 16
            }}
          />
        </Form.Item>

        <Form.Item
          name='koefficent'
          label={<span style={{ fontSize: 16, fontWeight: 500, color: '#1d1d1f' }}>Коэффициент *</span>}
          rules={[
            { required: true, message: 'Введите коэффициент' },
            { type: 'number', min: 0, message: 'Коэффициент не может быть отрицательным' },
            { type: 'number', max: 999999, message: 'Коэффициент слишком большой' }
          ]}
          style={{ marginBottom: 32 }}
        >
          <InputNumber
            placeholder='Заполните'
            step={0.1}
            precision={2}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              fontSize: 16
            }}
          />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <Button
            onClick={handleCancel}
            size='large'
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none',
              color: '#8e8e93',
              fontWeight: 500,
              fontSize: 16,
              minWidth: 100
            }}
          >
            Отмена
          </Button>

          <Button
            type='primary'
            htmlType='submit'
            loading={loading}
            size='large'
            style={{
              height: 48,
              borderRadius: 12,
              backgroundColor: '#007aff',
              borderColor: '#007aff',
              fontWeight: 500,
              fontSize: 16,
              minWidth: 120
            }}
          >
            Сохранить
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
