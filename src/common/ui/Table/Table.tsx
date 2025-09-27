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
type CollapsedMap = Record<string, boolean>;

const readCollapsedLS = (key: string): CollapsedMap => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as CollapsedMap) : {};
  } catch {
    return {};
  }
};
const writeCollapsedLS = (key: string, value: CollapsedMap) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota/security errors
  }
};

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
    resizable = true,
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
  const [collapsed, setCollapsed] = useState<CollapsedMap>(() => (persist ? readCollapsedLS(`tableCollapsed:${storageKey}`) : {}));

  useEffect(() => {
    if (!persist) return;
    writeLS(`tableWidths:${storageKey}`, widths);
  }, [persist, storageKey, widths]);

  useEffect(() => {
    if (!persist) return;
    writeCollapsedLS(`tableCollapsed:${storageKey}`, collapsed);
  }, [persist, storageKey, collapsed]);

  const updateWidth = (colKey: string, w: number) => {
    setWidths((prev) => {
      if (prev[colKey] === w) return prev;
      const next = { ...prev, [colKey]: w };
      return next;
    });
  };

  const collapsedWidth = 26;
  const toggleCollapsed = (colKey: string) => {
    setCollapsed((prev) => ({ ...prev, [colKey]: !prev[colKey] }));
  };

  // Resizable header cell component (created inside to capture min/max/updateWidth)
  const ResizableHeaderCell: React.FC<ResizableHeaderProps> = (cellProps) => {
    const { width, onResize, children, style, ...restProps } = cellProps;
    const colKey = (restProps as any)['data-col-key'] as string | undefined;
    const isCollapsed = Boolean((restProps as any)['data-collapsed']);
    const titleStr = (restProps as any)['data-col-title'] as string | undefined;
    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (colKey) toggleCollapsed(colKey);
    };
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
          <span className='collapse-toggle' onClick={handleToggle} title={isCollapsed ? 'Expand' : 'Collapse'}>
            {isCollapsed ? '⮞' : '⮜'}
          </span>
          {isCollapsed ? (
            <div className='collapsed-label' title={titleStr || ''}>
              {titleStr || ''}
            </div>
          ) : (
            <>
              <div className='resizable-th-content'>{children}</div>
              <span className='resizable-handle' onMouseDown={onMouseDown} />
            </>
          )}
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

      const isCollapsed = !!collapsed[colKey];
      const computedWidth = isCollapsed ? collapsedWidth : initialWidth;

      const nextCol: any = {
        ...col,
        width: computedWidth,
        className: [col.className, isCollapsed ? 'collapsed-col-body' : ''].filter(Boolean).join(' '),
        onHeaderCell: (column: any) => ({
          ...(userOnHeaderCell ? userOnHeaderCell(column) : {}),
          width: computedWidth,
          className: isCollapsed ? 'collapsed-col' : undefined,
          'data-col-key': colKey,
          'data-collapsed': isCollapsed,
          'data-col-title': titleToString((col as any).title, colKey),
          onResize: isCollapsed ? undefined : (w: number) => updateWidth(colKey, w)
        })
      };

      return nextCol as ColumnType<T>;
    });
  }, [columns, resizable, widths, collapsed]);

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
      className={['resizable-table', (rest as TableProps<T>).className].filter(Boolean).join(' ')}
      style={{ ...((rest as TableProps<T>).style as React.CSSProperties) }}
      columns={enhancedColumns}
      components={mergedComponents}
      locale={mergedLocale}
    />
  );
}
