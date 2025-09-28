import type { ExportEntity, ExportFilters, ExportFormat, ExportInclude } from 'types/entities/reports.entities';

export interface IExportReportsParams {
  export: ExportFormat;
  entity: ExportEntity;
  // New: when exporting by query string (instead of preset_id/filters)
  query_string?: string;
  filters?: ExportFilters;
  ids?: number[];
  preset_id?: number;
  include?: ExportInclude;
  fields?: string[];
  filename?: string;
  include_pending?: boolean;
}

export interface IExportReportsResponse {
  blob: Blob;
  filename: string | null;
}
