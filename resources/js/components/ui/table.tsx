import * as React from "react";

import { cn } from "@/lib/shared/utils";

type TableSection = "header" | "body" | "footer" | "other";

interface TableContextValue {
    headers: Record<number, string>;
    registerHeader: (index: number, label: string) => void;
}

interface TableRowContextValue {
    getNextColumnIndex: () => number;
    reset: () => void;
}

const TableContext = React.createContext<TableContextValue | null>(null);
const TableRowContext = React.createContext<TableRowContextValue | null>(null);
const TableSectionContext = React.createContext<TableSection>("other");

function extractText(node: React.ReactNode): string {
    if (node === null || node === undefined || typeof node === "boolean") {
        return "";
    }

    if (typeof node === "string" || typeof node === "number") {
        return String(node).trim();
    }

    if (Array.isArray(node)) {
        return node.map(extractText).filter(Boolean).join(" ").trim();
    }

    if (React.isValidElement(node)) {
        const element = node as React.ReactElement<{ children?: React.ReactNode }>;
        return extractText(element.props.children ?? null);
    }

    return "";
}

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, children, ...props }, ref) => {
    const [headers, setHeaders] = React.useState<Record<number, string>>({});

    const registerHeader = React.useCallback((index: number, label: string) => {
        setHeaders((prev) => {
            const trimmed = label.trim();
            if (!trimmed) {
                return prev;
            }

            if (prev[index] === trimmed) {
                return prev;
            }

            return {
                ...prev,
                [index]: trimmed,
            };
        });
    }, []);

    const contextValue = React.useMemo<TableContextValue>(
        () => ({
            headers,
            registerHeader,
        }),
        [headers, registerHeader]
    );

    return (
        <TableContext.Provider value={contextValue}>
            <div className="relative w-full lg:overflow-x-auto">
                <table
                    ref={ref}
                    className={cn("block w-full caption-bottom text-sm lg:table", className)}
                    {...props}
                >
                    {children}
                </table>
            </div>
        </TableContext.Provider>
    );
});
Table.displayName = "Table";

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
    <TableSectionContext.Provider value="header">
        <thead
            ref={ref}
            className={cn("hidden lg:table-header-group [&_tr]:border-b", className)}
            {...props}
        >
            {children}
        </thead>
    </TableSectionContext.Provider>
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
    <TableSectionContext.Provider value="body">
        <tbody
            ref={ref}
            className={cn(
                "flex flex-col gap-4 lg:table-row-group lg:[&_tr:last-child]:border-0",
                className
            )}
            {...props}
        >
            {children}
        </tbody>
    </TableSectionContext.Provider>
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
    <TableSectionContext.Provider value="footer">
        <tfoot
            ref={ref}
            className={cn(
                "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
                className
            )}
            {...props}
        >
            {children}
        </tfoot>
    </TableSectionContext.Provider>
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, children, ...props }, ref) => {
    const section = React.useContext(TableSectionContext);
    const columnIndexRef = React.useRef(0);

    const rowContext = React.useMemo<TableRowContextValue>(
        () => ({
            getNextColumnIndex: () => {
                const index = columnIndexRef.current;
                columnIndexRef.current += 1;
                return index;
            },
            reset: () => {
                columnIndexRef.current = 0;
            },
        }),
        []
    );

    rowContext.reset();

    const bodyBaseClass =
        "flex flex-col gap-3 rounded-2xl border border-neutral-200/70 bg-white p-4 shadow-sm transition-colors duration-150 hover:border-neutral-300 hover:bg-neutral-50/70 data-[state=selected]:border-primary-300 data-[state=selected]:bg-primary-50/40 lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:border-neutral-200/70 lg:bg-transparent lg:p-0 lg:shadow-none lg:hover:bg-muted/50";

    const otherBaseClass =
        "border-b transition-colors data-[state=selected]:bg-muted";

    return (
        <TableRowContext.Provider value={rowContext}>
            <tr
                ref={ref}
                className={cn(section === "body" ? bodyBaseClass : otherBaseClass, className)}
                {...props}
            >
                {children}
            </tr>
        </TableRowContext.Provider>
    );
});
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => {
    const table = React.useContext(TableContext);
    const row = React.useContext(TableRowContext);
    const section = React.useContext(TableSectionContext);
    const columnIndexRef = React.useRef<number | null>(null);

    if (columnIndexRef.current === null) {
        columnIndexRef.current = row?.getNextColumnIndex() ?? 0;
    }

    const columnIndex = columnIndexRef.current;
    const explicitLabel = (props as { [key: string]: string | undefined })['data-label'];
    const label = explicitLabel ?? extractText(children);

    React.useEffect(() => {
        if (section === "header" && label) {
            table?.registerHeader(columnIndex, label);
        }
    }, [table, columnIndex, label, section]);

    return (
        <th
            ref={ref}
            className={cn(
                "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                className
            )}
            {...props}
        >
            {children}
        </th>
    );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, children, ...props }, ref) => {
    const table = React.useContext(TableContext);
    const row = React.useContext(TableRowContext);
    const section = React.useContext(TableSectionContext);
    const columnIndexRef = React.useRef<number | null>(null);

    if (columnIndexRef.current === null) {
        columnIndexRef.current = row?.getNextColumnIndex() ?? 0;
    }

    const columnIndex = columnIndexRef.current;
    const explicitLabel = (props as { [key: string]: string | undefined })['data-label'];
    const resolvedLabel = explicitLabel ?? (section === "body" ? table?.headers?.[columnIndex] : undefined);

    return (
        <td
            ref={ref}
            className={cn(
                "w-full px-0 text-sm text-neutral-700 first:pt-0 last:pb-0 [&:has([role=checkbox])]:pr-0 lg:align-middle lg:px-4 lg:py-4",
                className
            )}
            {...props}
        >
            {section === "body" && resolvedLabel ? (
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-neutral-500 lg:hidden">
                    {resolvedLabel}
                </span>
            ) : null}
            {children}
        </td>
    );
});
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
));
TableCaption.displayName = "TableCaption";

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};
