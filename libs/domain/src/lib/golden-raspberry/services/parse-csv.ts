import { readFileSync } from 'fs';

function parseProducers(raw: string): string[] {
  const result: string[] = [];
  const parts = raw.split(',');
  for (const p of parts) {
    const byAnd = p.split(/\s+and\s+/);
    for (const s of byAnd) {
      const t = s.trim();
      if (t) result.push(t);
    }
  }
  return [...new Set(result)];
}

export interface CsvMovieRow {
  year: number;
  title: string;
  studios: string;
  producers: string[];
  winner: boolean;
}

export function parseMovieListCsvContent(content: string): CsvMovieRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim());
  const header = lines[0];
  const dataLines = lines.slice(1);

  if (!header || !header.startsWith('year')) {
    throw new Error('Invalid CSV: missing or invalid header');
  }
  const rows: CsvMovieRow[] = [];
  for (const line of dataLines) {
    const parts = line.split(';');
    if (parts.length < 5) continue;

    const yearStr = parts[0];
    const title = parts[1];
    const studios = parts[2];
    const producersStr = parts[3];
    const winnerStr = parts[4];
    const year = parseInt(yearStr, 10);
    if (!year) continue;

    const winner = winnerStr.trim().toLowerCase() === 'yes';
    const producers = parseProducers(producersStr || '');
    rows.push({
      year,
      title: (title || '').trim(),
      studios: (studios || '').trim(),
      producers,
      winner,
    });
  }
  return rows;
}

export function parseMovieListCsv(filePath: string): CsvMovieRow[] {
  const content = readFileSync(filePath, 'utf-8');
  return parseMovieListCsvContent(content);
}
