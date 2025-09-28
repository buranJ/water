/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table as AntdTable, type TableProps } from 'antd';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import './styles.scss';

type ExtraTableProps<T = any> = Omit<TableProps<T>, 'components'> & {
  // Enable/disable resizable headers (default: true)
  resizable?: boolean;
  // Optional stable key to persist widths in localStorage (fallback: location.pathname)
  tableId?: string;
  // Min/max widths for columns
  minColWidth?: number;
  maxColWidth?: number;
  // Persist widths to localStorage (default: true)
  persist?: boolean;
  // Allow passing dataSource/columns with proper typing (defaults to any)
  dataSource?: readonly T[];
  columns?: ColumnsType<T>;
  components?: any;
};

type WidthMap = Record<string, number>;

type ResizableHeaderProps = React.ThHTMLAttributes<HTMLTableCellElement> & {
  width?: number;
  onResize?: (w: number) => void;
};

// Safely read/write localStorage
const readLS = (key: string): WidthMap => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as WidthMap) : {};
  } catch {
    return {};
  }
};
const writeLS = (key: string, value: WidthMap) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/security errors
  }
};

export function Table<T = any>(props: ExtraTableProps<T>) {
  const { t } = useTranslation();
  const {
    locale,
    columns,
    resizable = false,
    tableId,
    minColWidth = 15,
    maxColWidth = 1000,
    persist = true,
    components: userComponents,
    ...rest
  } = props;

  const mergedLocale = {
    emptyText: t('objectDetail.noData'),
    ...locale
  };

  const storageKey =
    (typeof window !== 'undefined' ? window.location.pathname : 'table') +
    '::' +
    (tableId || (columns ? columns.map((c: any, i: number) => String(c.key ?? (c as any).dataIndex ?? i)).join('|') : 'default'));

  const [widths, setWidths] = useState<WidthMap>(() => (persist ? readLS(`tableWidths:${storageKey}`) : {}));

  useEffect(() => {
    if (!persist) return;
    writeLS(`tableWidths:${storageKey}`, widths);
  }, [persist, storageKey, widths]);

  const updateWidth = (colKey: string, w: number) => {
    setWidths((prev) => {
      if (prev[colKey] === w) return prev;
      const next = { ...prev, [colKey]: w };
      return next;
    });
  };

  // Resizable header cell component (created inside to capture min/max/updateWidth)
  const ResizableHeaderCell: React.FC<ResizableHeaderProps> = (cellProps) => {
    const { width, onResize, children, style, ...restProps } = cellProps;
    const thRef = useRef<HTMLTableCellElement>(null);
    const startX = useRef(0);
    const startW = useRef<number>(width ?? 0);
    const resizing = useRef(false);

    const onMouseDown: React.MouseEventHandler<HTMLSpanElement> = (e) => {
      // prevent sort/drag
      e.preventDefault();
      e.stopPropagation();
      if (!thRef.current) return;
      resizing.current = true;
      startX.current = e.clientX;
      // compute current width from DOM if missing
      startW.current = width ?? thRef.current.getBoundingClientRect().width;

      const onMove = (ev: MouseEvent) => {
        if (!resizing.current) return;
        const delta = ev.clientX - startX.current;
        let next = Math.max(minColWidth, startW.current + delta);
        if (maxColWidth) next = Math.min(maxColWidth, next);
        onResize?.(Math.round(next));
      };
      const onUp = () => {
        resizing.current = false;
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        document.body.classList.remove('resizing-col');
      };

      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      document.body.classList.add('resizing-col');
    };

    return (
      <th {...restProps} ref={thRef} style={{ ...(style as React.CSSProperties), width }}>
        <div className='resizable-th-inner'>
          <div className='resizable-th-content'>{children}</div>
          <span className='resizable-handle' onMouseDown={onMouseDown} />
        </div>
      </th>
    );
  };

  // Enhance columns with onHeaderCell + width from state
  const enhancedColumns: ColumnsType<T> | undefined = useMemo(() => {
    if (!resizable || !columns) return columns;

    const titleToString = (t: unknown, fallback: string) => (typeof t === 'string' ? t : fallback);

    return columns.map((col: any, index: number) => {
      const colKey = String((col as ColumnType<T>).key ?? (col as ColumnType<T>).dataIndex ?? index);
      const userOnHeaderCell = (col as ColumnType<T>).onHeaderCell;
      const initialWidth =
        widths[colKey] ?? (typeof (col as ColumnType<T>).width === 'number' ? ((col as ColumnType<T>).width as number) : undefined);

      const nextCol: any = {
        ...col,
        width: initialWidth,
        onHeaderCell: (column: any) => ({
          ...(userOnHeaderCell ? userOnHeaderCell(column) : {}),
          width: initialWidth,
          'data-col-key': colKey,
          'data-col-title': titleToString((col as any).title, colKey),
          onResize: (w: number) => updateWidth(colKey, w)
        })
      };

      return nextCol as ColumnType<T>;
    });
  }, [columns, resizable, widths]);

  // Merge components to use our header cell
  const mergedComponents = useMemo(() => {
    if (!resizable) return userComponents;
    return {
      ...(userComponents || {}),
      header: {
        ...(userComponents?.header || {}),
        cell: ResizableHeaderCell as any
      }
    };
  }, [resizable, userComponents]);

  // If resizable and widths exist but table has no horizontal scroll, consider keeping as-is.
  // Consumers can still pass scroll prop if needed.

  return (
    <AntdTable
      {...(rest as TableProps<T>)}
      tableLayout='fixed'
      className={[resizable ? 'resizable-table' : undefined, (rest as TableProps<T>).className].filter(Boolean).join(' ')}
      style={{ ...((rest as TableProps<T>).style as React.CSSProperties) }}
      columns={enhancedColumns}
      components={mergedComponents}
      locale={mergedLocale}
    />
  );
}
