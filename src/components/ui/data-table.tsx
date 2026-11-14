import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T>({ columns, rows, rowKey }: { columns: Column<T>[]; rows: T[]; rowKey: (row: T) => string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-soft">
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>{columns.map((column) => <th key={column.header} className={cn('px-5 py-3 font-semibold', column.className)}>{column.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <motion.tr key={rowKey(row)} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.4) }} className="transition hover:bg-brand-50/30">
                {columns.map((column) => <td key={column.header} className={cn('px-5 py-3.5 text-slate-700', column.className)}>{column.cell(row)}</td>)}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
