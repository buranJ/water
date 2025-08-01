import { IPaginationMeta } from 'types/common';
import { IGetTyById, ITechnicalCondition, ITyBody, ITyItem, ITyListQueryParams } from 'types/entities';

export type IGetAllTechnicalConditionResponse = IPaginationMeta & {
  results: ITechnicalCondition[];
};
export type IGetAllTechnicalConditionParams = ITyListQueryParams;

export type ICreateTechnicalConditionRequest = ITyItem;
export type ICreateTechnicalConditionParams = ITyBody;

export type IGetTechnicalConditionByIdParams = { applicationId: string };
export type IGetTechnicalConditionByIdResponse = IGetTyById;

export interface IUpdateTechnicalConditionParams {
  id: number;
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
