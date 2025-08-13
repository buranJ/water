import type { ExportEntity, ExportFilters, ExportFormat, ExportInclude } from 'types/entities/reports.entities';

export interface IExportReportsParams {
  export: ExportFormat;
  entity: ExportEntity;
  filters?: ExportFilters;
  ids?: number[];
  include?: ExportInclude;
  fields?: string[];
  filename?: string;
  include_pending?: boolean;
}

export interface IExportReportsResponse {
  blob: Blob;
  filename: string | null;
}
