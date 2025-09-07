export type {
  IApplication,
  IGetApplicationHistoryParams,
  IGetApplicationHistoryResponse,
  IGetApplicationsParams
} from './application.requests';
export type {
  IContractCustomerType,
  IDownloadContractDocxParams,
  IDownloadContractDocxResponse,
  IGetInvoicesByProtocolTyParams,
  IGetInvoicesByProtocolTyResponse
} from './buhgalteria.requests';
export type {
  IGetCustomerChangeHistoryParams,
  IGetCustomerChangeHistoryResponse,
  IGetCustomerParams,
  IGetCustomerResponse
} from './customer.requests';
export type {
  ICreateFolderParams,
  ICreateFolderResponse,
  IFileListResponse,
  IGetFileFolderFoldersParams,
  IGetFileFolderFoldersResponse,
  IGetFileListParams,
  IUploadFileParams
} from './fileFolder.requests';
export type { IGetObjectChangeHistoryParams, IGetObjectChangeHistoryResponse } from './object.requests';
export type { IExportReportsParams, IExportReportsResponse } from './reports.requests';
export type {
  IAddLoadParams,
  ICreateTechnicalConditionParams,
  ICreateTechnicalConditionRequest,
  IDeleteTechnicalConditionParams,
  IDeleteTechnicalConditionResponse,
  IDownloadTyPdfParams,
  IDownloadTyPdfResponse,
  IGetAllTechnicalConditionParams,
  IGetAllTechnicalConditionResponse,
  IGetLoadIncreasesParams,
  IGetLoadIncreasesResponse,
  IGetTechnicalConditionByIdParams,
  IGetTechnicalConditionByIdResponse,
  IGetTyHistoryParams,
  IGetTyHistoryResponse,
  IITypesTYParams,
  IPatchTechnicalConditionParams,
  IPatchTechnicalConditionResponse,
  IProtocolDocxParams,
  IProtocolDocxResponse,
  ITypesTYResponse,
  IUpdateTechnicalConditionParams,
  IUpdateTechnicalConditionResponse,
  // act_ty
  ICreateActTyParams,
  IActTyResponse,
  IPatchActTyParams
} from './technicalCondition.requests';
