export interface ICustomer {
  id: number;
  inn: string;
  full_name: string;
  category: '1' | '0';
  pasport: string;
  address: string;
  contact: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface ICustomerParams {
  category?: 1 | 0;
  ordering?: string;
  search?: string;
  status?: 'active' | 'rejected';
  page: number;
  page_size: number;
}
