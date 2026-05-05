// utils/receipt-log.ts
import fs from 'fs';
import path from 'path';

const LOG_PATH = path.join(__dirname, '../../memory/receipts/index.md');

export function appendReceiptLog(receipt: {
  date: string;
  store: string;
  total: number;
  items: { name: string }[];
  returnDeadline: string | null;
}) {
  const top2 = receipt.items.slice(0, 2).map(i => i.name).join(', ');
  const deadline = receipt.returnDeadline ?? 'no return window';
  const line = `| ${receipt.date} | ${receipt.store} | ₹${receipt.total} | ${top2} | ${deadline} |\n`;
  fs.appendFileSync(LOG_PATH, line);
}