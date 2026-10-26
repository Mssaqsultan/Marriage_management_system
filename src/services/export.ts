import { Event, Guest, Transaction, Gift, Family } from '../types';

/**
 * CSV / Excel and Print Generator for Reports
 */

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row.map(val => {
      const str = val === undefined || val === null ? '' : String(val);
      const escaped = str.replace(/"/g, '""');
      if (escaped.search(/("|,|\n)/g) >= 0) {
        return `"${escaped}"`;
      }
      return escaped;
    }).join(',');
  };

  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportGuestReportCSV(event: Event, guests: Guest[], txns: Transaction[], gifts: Gift[]) {
  const headers = ['Sr', 'Guest Name', 'Father/Husband', 'Mobile', 'Village', 'Relation', 'Side', 'Nevta (₹)', 'Nahuchua (₹)', 'Total Cash (₹)', 'Gifts Count', 'Payment Mode', 'Notes'];
  
  const rows: (string | number)[][] = [
    [`Event: ${event.name}`, `Date: ${event.date}`, `Host: ${event.host_name}`, `Venue: ${event.venue}`],
    [],
    headers
  ];

  let totalNevta = 0;
  let totalNahuchua = 0;
  let totalCash = 0;

  guests.forEach((g, idx) => {
    const guestTxns = txns.filter(t => t.guest_id === g.id && !t.deleted_at);
    const guestGifts = gifts.filter(t => t.guest_id === g.id && !t.deleted_at);
    const nevta = guestTxns.filter(t => t.type === 'nevta').reduce((s, t) => s + t.amount, 0);
    const nahuchua = guestTxns.filter(t => t.type === 'nahuchua').reduce((s, t) => s + t.amount, 0);
    const total = nevta + nahuchua;
    const pModes = Array.from(new Set(guestTxns.map(t => t.payment_method))).join(' / ') || 'N/A';
    const notes = guestTxns.map(t => t.notes).filter(Boolean).join(' | ') || g.notes || '';

    totalNevta += nevta;
    totalNahuchua += nahuchua;
    totalCash += total;

    rows.push([
      idx + 1,
      g.name,
      g.father_husband_name || '-',
      g.mobile || '-',
      g.village || '-',
      g.relation,
      g.side,
      nevta,
      nahuchua,
      total,
      guestGifts.reduce((s, gf) => s + gf.quantity, 0),
      pModes,
      notes
    ]);
  });

  // Summary Row
  rows.push([]);
  rows.push(['', 'TOTAL SUMMARY', '', '', '', '', '', totalNevta, totalNahuchua, totalCash, '', '', '']);

  const sanitized = event.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  downloadCSV(`nevta_report_${sanitized}_${Date.now()}.csv`, rows);
}

export function exportVillageReportCSV(event: Event, villageData: Record<string, { guests: number; nevta: number; nahuchua: number; total: number }>) {
  const headers = ['Sr', 'Village / City', 'Total Guests', 'Nevta Collection (₹)', 'Nahuchua (₹)', 'Total Village Collection (₹)'];
  const rows: (string | number)[][] = [
    [`Village-wise Collection Report: ${event.name}`, `Date: ${event.date}`],
    [],
    headers
  ];

  let idx = 1;
  let sumGuests = 0;
  let sumNevta = 0;
  let sumNahuchua = 0;
  let sumTotal = 0;

  Object.entries(villageData).forEach(([village, stats]) => {
    sumGuests += stats.guests;
    sumNevta += stats.nevta;
    sumNahuchua += stats.nahuchua;
    sumTotal += stats.total;

    rows.push([
      idx++,
      village,
      stats.guests,
      stats.nevta,
      stats.nahuchua,
      stats.total
    ]);
  });

  rows.push([]);
  rows.push(['', 'GRAND TOTAL', sumGuests, sumNevta, sumNahuchua, sumTotal]);

  downloadCSV(`village_report_${Date.now()}.csv`, rows);
}

export function printCurrentReport() {
  window.print();
}
