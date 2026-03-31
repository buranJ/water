export interface IGenerateActTyParams {
  ty_id: string;
  type: 'default_act' | 'multi_act';
}

export interface IGenerateActTyResponse {
  detail: string;
  file_url: string;
}
