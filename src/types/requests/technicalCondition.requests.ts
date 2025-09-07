import { IActEnum, IPaginationMeta } from 'types/common';
import { IGetTyById, IHistory, ILoadIncreases, ITechnicalCondition, ITyBody, ITyItem, ITyListQueryParams, ITypesTY } from 'types/entities';

export type IGetAllTechnicalConditionResponse = IPaginationMeta & {
  results: ITechnicalCondition[];
};
export type IGetAllTechnicalConditionParams = ITyListQueryParams;

export type ICreateTechnicalConditionRequest = ITyItem;
export type ICreateTechnicalConditionParams = Omit<ITyBody, 'request_date' | 'payment_deadline'> & {
  request_date: string;
  payment_deadline: string;
};

export type IGetTechnicalConditionByIdParams = { tyId: string };
export type IGetTechnicalConditionByIdResponse = IGetTyById;

export interface IUpdateTechnicalConditionParams {
  id: string;
  body: ITyBody;
}
export type IUpdateTechnicalConditionResponse = ITyItem;

export interface IPatchTechnicalConditionParams {
  id: number;
  body: Partial<ITyBody>;
}
export type IPatchTechnicalConditionResponse = ITyItem;

export type IDeleteTechnicalConditionParams = number;
export type IDeleteTechnicalConditionResponse = void;

export type ITypesTYResponse = ITypesTY[];
export type IITypesTYParams = void;

export type IGetTyHistoryResponse = IPaginationMeta & {
  results: IHistory[];
};
export type IGetTyHistoryParams = { tyId: string; page?: number; page_size?: number };

export interface IAddLoadParams {
  ty_id: string;
  water_required: string;
  pressure_required: string;
  sewage_amount: string;
  comment?: string;
  files?: File[];
}

export type IGetLoadIncreasesResponse = ILoadIncreases[];
export type IGetLoadIncreasesParams = { tyId: string };

export type IDownloadTyPdfResponse = { blob: Blob; filename: string | null };
export type IDownloadTyPdfParams = { tyId: string };

export type IProtocolDocxResponse = { blob: Blob; filename: string | null };
export type IProtocolDocxParams = { tyId: string };

export interface ICreateActTyParams {
  ty: number | string;
  status?: IActEnum;
  file?: File | string;
}

export interface IActTyResponse {
  id: number;
  file: string;
  status: IActEnum;
  ty: number;
}

/**
 * PATCH act_ty: id must be the ACT id (not TU id). Body includes ONLY status (no file).
 */
export interface IPatchActTyParams {
  id: number | string; // ACT id
  body: {
    status: IActEnum;
  };
}
