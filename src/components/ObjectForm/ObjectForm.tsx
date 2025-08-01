import { FC } from 'react';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import { CloseOutlined } from '@ant-design/icons';

const { Option } = Select;

export interface ObjectFormData {
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  customer: number;
  type?: string;
  usage_type?: string;
}

interface ObjectFormProps {
  onSubmit: (values: ObjectFormData) => void;
  onCancel: () => void;
  initialValues?: Partial<ObjectFormData>;
  loading?: boolean;
}

export const ObjectForm: FC<ObjectFormProps> = ({ onSubmit, onCancel, initialValues, loading = false }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values: ObjectFormData): void => {
    onSubmit(values);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 32,
          width: '100%',
          maxWidth: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          margin: 20
        }}
      >
        {/* Заголовок */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 32
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 600,
              color: '#1d1d1f'
            }}
          >
            Добавить объект
          </h2>
          <Button
            type='text'
            icon={<CloseOutlined />}
            onClick={onCancel}
            style={{
              border: 'none',
              padding: 0,
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          />
        </div>

        {/* Форма */}
        <Form
          form={form}
          layout='vertical'
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            customer: 1,
            type: 'Новостройка',
            usage_type: 'Жилой дом',
            ...initialValues
          }}
        >
          {/* Название объекта */}
          <Form.Item
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1d1d1f'
                }}
              >
                Название объекта
              </span>
            }
            name='title'
            rules={[{ required: true, message: 'Введите название объекта' }]}
          >
            <Input
              placeholder='Название объект'
              style={{
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#f5f5f7',
                padding: '12px 16px',
                fontSize: 16
              }}
            />
          </Form.Item>

          {/* Адрес */}
          <Form.Item
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1d1d1f'
                }}
              >
                Адрес
              </span>
            }
            name='address_street'
            rules={[{ required: true, message: 'Введите адрес' }]}
          >
            <Input
              placeholder='Адрес'
              style={{
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#f5f5f7',
                padding: '12px 16px',
                fontSize: 16
              }}
            />
          </Form.Item>

          {/* Номер дома */}
          <Form.Item
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1d1d1f'
                }}
              >
                Номер дома
              </span>
            }
            name='address_number'
          >
            <Input
              placeholder='Номер дома'
              style={{
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#f5f5f7',
                padding: '12px 16px',
                fontSize: 16
              }}
            />
          </Form.Item>

          {/* Кадастровый номер и Тип объекта */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#1d1d1f'
                    }}
                  >
                    Кадастровый номер
                  </span>
                }
                name='kadastr_number'
                rules={[{ required: true, message: 'Введите кадастровый номер' }]}
              >
                <Input
                  placeholder='01:001:1234567'
                  style={{
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#f5f5f7',
                    padding: '12px 16px',
                    fontSize: 16,
                    fontFamily: 'monospace'
                  }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item
                label={
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: '#1d1d1f'
                    }}
                  >
                    Тип объекта
                  </span>
                }
                name='type'
              >
                <Input
                  placeholder='Жилой дом'
                  style={{
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: '#f5f5f7',
                    padding: '12px 16px',
                    fontSize: 16
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Вид использования */}
          <Form.Item
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1d1d1f'
                }}
              >
                Вид использования
              </span>
            }
            name='usage_type'
          >
            <Input
              placeholder='Жилой дом'
              style={{
                borderRadius: 12,
                border: 'none',
                backgroundColor: '#f5f5f7',
                padding: '12px 16px',
                fontSize: 16
              }}
            />
          </Form.Item>

          {/* Статус */}
          <Form.Item
            label={
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#1d1d1f'
                }}
              >
                Статус
              </span>
            }
            name='status'
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select
              placeholder='Выберите статус'
              style={{
                borderRadius: 12
              }}
              dropdownStyle={{
                borderRadius: 12
              }}
            >
              <Option value='active'>Активен</Option>
              <Option value='inactive'>Неактивен</Option>
              <Option value='pending'>В ожидании</Option>
              <Option value='rejected'>Отклонен</Option>
            </Select>
          </Form.Item>

          {/* Скрытое поле для customer */}
          <Form.Item name='customer' hidden>
            <Input type='hidden' />
          </Form.Item>

          {/* Кнопки */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 32
            }}
          >
            <Button
              onClick={onCancel}
              style={{
                borderRadius: 12,
                padding: '8px 24px',
                height: 'auto',
                border: 'none',
                backgroundColor: '#f5f5f7',
                color: '#8e8e93'
              }}
            >
              Назад
            </Button>

            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              style={{
                borderRadius: 12,
                backgroundColor: '#007aff',
                borderColor: '#007aff',
                padding: '8px 24px',
                height: 'auto'
              }}
            >
              Добавить
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
