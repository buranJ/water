import { IPaginationMeta } from 'types/common';
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
