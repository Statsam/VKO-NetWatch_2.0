export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!rows || !rows.length) return;

  const resolvedHeaders =
    headers ||
    (Object.keys(rows[0]).map((key) => ({
      key: key as keyof T,
      label: key.charAt(0).toUpperCase() + key.slice(1),
    })) as { key: keyof T; label: string }[]);

  const headerRow = resolvedHeaders.map((h) => `"${h.label.replace(/"/g, '""')}"`).join(';');

  const dataRows = rows.map((row) => {
    return resolvedHeaders
      .map((h) => {
        const val = row[h.key];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(';');
  });

  // Include UTF-8 BOM (\uFEFF) for Excel compatibility with Russian Cyrillic characters
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
