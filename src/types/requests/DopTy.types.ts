export interface IGetDopTyParams {
  ty_id: string;
}

export interface IGetDopTyResponse {
  id: number;
  file: string;
  status: 'draft' | 'review' | 'approved' | 'done';
  ty: number;
}

export interface IGenerateDopTyParams {
  ty_id: string;
}

export interface IGenerateDopTyResponse {
  detail: string;
  file_url: string;
}
export interface IUploadDopTyParams {
  ty_id: string;
  file: File;
}
