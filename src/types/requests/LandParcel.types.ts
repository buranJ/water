// ========================================
// LAND PARCEL TYPES
// ========================================

// Response types
export interface ILandParcel {
  id: number;
  customer_name?: string;
  address?: string;
  purpose?: string;
  area?: string | number; // Площадь участка
  council_date?: string; // ✅ НОВОЕ
  request_number?: string; // ✅ НОВОЕ
  tech_council_date?: string; // ✅ НОВОЕ
  outgoing_number?: string; // Исходящий номер земельного участка
  outgoing_date?: string; // Исходящая дата земельного участка
  file?: string; // ✅ НОВОЕ
  comment?: string; // ✅ НОВОЕ
  customer?: number;
  creater?: number;
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
  request_number?: string; // ✅ ОБНОВЛЕНО: вместо kadastr_number
}

// ✅ ВСЕ ПОЛЯ ОПЦИОНАЛЬНЫЕ при создании
export interface ICreateLandParcelParams {
  address?: string;
  purpose?: string;
  area?: string | number; // Площадь участка
  council_date?: string; // ✅ НОВОЕ
  request_number?: string; // ✅ НОВОЕ
  tech_council_date?: string; // ✅ НОВОЕ
  outgoing_number?: string; // Исходящий номер земельного участка
  outgoing_date?: string; // Исходящая дата земельного участка
  file?: File; // ✅ НОВОЕ (тип File для загрузки)
  comment?: string; // ✅ НОВОЕ
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

export interface IGenerateLandParcelDocumentParams {
  id: number | string;
}

export interface IGenerateLandParcelDocumentResponse {
  detail: string;
  file_url: string;
}
export interface IGetAllLandParcelsParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  customer?: number;
  request_number?: string;
  customer_name?: string;
  address?: string;
  purpose?: string;
  council_date_start?: string;
  council_date_end?: string;
  tech_council_date_start?: string;
  tech_council_date_end?: string;
  outgoing_number?: string;
  outgoing_date_from?: string;
  outgoing_date_to?: string;
}
