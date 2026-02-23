// ========================================
// LAND PARCEL TYPES
// ========================================

// Response types
export interface ILandParcel {
  id: number;
  title?: string;
  address?: string;
  kadastr_number?: string;
  purpose?: string;
  customer?: number;
  customer_name?: string; // ✅ НОВОЕ: имя заказчика
  creater?: number; // ✅ НОВОЕ: кто создал
  created_at?: string;
  updated_at?: string;
}

export interface ILandParcelsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ILandParcel[];
}

// Request params
export interface IGetAllLandParcelsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  customer?: number;
  kadastr_number?: string;
}

export interface ICreateLandParcelParams {
  title?: string;
  address?: string;
  kadastr_number?: string;
  purpose?: string;
  customer?: number;
}

export interface IGetLandParcelByIdParams {
  id: number | string;
}

export interface IUpdateLandParcelParams {
  id: number | string;
  body: Partial<ICreateLandParcelParams>;
}

export interface IDeleteLandParcelParams {
  id: number | string;
}
