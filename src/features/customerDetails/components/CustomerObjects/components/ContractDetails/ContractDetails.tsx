import { Button, Tag, Typography } from 'antd';
import { IContract } from '../../types';

const { Text, Title } = Typography;
const statusColors: Record<IContract['status'], string> = {
  Активен: 'green',
  Отказано: 'red'
};

interface IContractDetailsProps {
  contract: IContract & {
    address?: string;
    area?: string;
    cost?: string;
    cadastralNumber?: string;
    tvStatus?: string;
    coordinates?: string;
  };
  onBack: () => void;
}

export const ContractDetails: React.FC<IContractDetailsProps> = ({ contract, onBack }) => {
  const details = [
    { label: 'Дата договор', value: contract.contractDate },
    { label: 'Тип', value: contract.type },
    { label: 'Адрес', value: contract.address || 'г. Белокуриха, ул. Алтая, 45' },
    { label: 'Кадастровый номер', value: contract.cadastralNumber || '01:001:1234567' },
    { label: 'Статус заявок и выдачи ТУ', value: contract.tvStatus || 'ТУ выдано, подключение в процессе' },
    { label: 'Географические координаты', value: contract.coordinates || '42.8746° N, 74.6122° E' },
    { label: 'Площадь жилого дома', value: contract.area || 'Квартира: 150 м²' },
    { label: 'Статус', value: <Tag color={statusColors[contract.status]}>{contract.status}</Tag> },
    { label: 'Стоимость по договору', value: contract.cost || '42 879 874, 7812 ₽' }
  ];

  const leftColumnSize = 7;
  const leftColumn = details.slice(0, leftColumnSize);
  const rightColumn = details.slice(leftColumnSize);

  return (
    <>
      <Title level={4}>{contract.name}</Title>
      <div className='box-wrapper'>
        <div>
          <Button onClick={onBack}>Назад</Button>
        </div>
        <div style={{ display: 'flex', gap: '32px', marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            {leftColumn.map((item, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Title level={5}>{item.label}: </Title>
                <Text>{item.value}</Text>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {rightColumn.map((item, index) => (
              <div key={index} style={{ marginBottom: 8 }}>
                <Title level={5}>{item.label}: </Title>
                <Text>{item.value}</Text>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
