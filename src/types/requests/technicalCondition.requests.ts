import { IPaginationMeta } from 'types/common';
import { IGetTyById, ITechnicalCondition, ITyBody, ITyItem, ITyListQueryParams, ITypesTY } from 'types/entities';

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

export type IGetTyByIdParams = { applicationId: string };

export type ITypesTYResponse = ITypesTY[];
export type IITypesTYParams = void;
