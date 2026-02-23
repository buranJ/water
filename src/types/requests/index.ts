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
export type {
  ICreateLandParcelParams,
  IDeleteLandParcelParams,
  IGetAllLandParcelsParams,
  IGetLandParcelByIdParams,
  ILandParcel,
  ILandParcelsListResponse,
  IUpdateLandParcelParams
} from './LandParcel.types';
export type { IGetObjectChangeHistoryParams, IGetObjectChangeHistoryResponse } from './object.requests';
export type { IFilterPreset, IFilterPresetRequest, IGetPresetsParams, IGetPresetsResponse, PresetTarget } from './presets.requests';
export type { IExportReportsParams, IExportReportsResponse } from './reports.requests';
export type {
  IActTyResponse,
  IAddLoadParams,
  // New: Balance Acceptance
  IBalanceAcceptance,
  // act_ty
  ICreateActTyParams,
  ICreateBalanceAcceptanceParams,
  ICreateBalanceAcceptanceResponse,
  ICreateTechnicalConditionParams,
  ICreateTechnicalConditionRequest,
  IDeleteBalanceAcceptanceParams,
  IDeleteTechnicalConditionParams,
  IDeleteTechnicalConditionResponse,
  IDownloadTyPdfParams,
  IDownloadTyPdfResponse,
  IForkMinimalParams,
  IForkMinimalResponse,
  IGetAllTechnicalConditionParams,
  IGetAllTechnicalConditionResponse,
  IGetBalanceAcceptanceParams,
  IGetBalanceAcceptanceResponse,
  IGetLoadIncreasesParams,
  IGetLoadIncreasesResponse,
  IGetTechnicalConditionByIdParams,
  IGetTechnicalConditionByIdResponse,
  IGetTyHistoryParams,
  IGetTyHistoryResponse,
  IITypesTYParams,
  // New: Load increase DOCX
  ILoadIncreaseDocxParams,
  ILoadIncreaseDocxResponse,
  IPatchActTyParams,
  IPatchBalanceAcceptanceParams,
  IPatchBalanceAcceptanceResponse,
  IPatchTechnicalConditionParams,
  IPatchTechnicalConditionResponse,
  IProtocolDocxParams,
  IProtocolDocxResponse,
  IPutBalanceAcceptanceParams,
  IPutBalanceAcceptanceResponse,
  ITypesTYResponse,
  IUpdateTechnicalConditionParams,
  IUpdateTechnicalConditionResponse
} from './technicalCondition.requests';
