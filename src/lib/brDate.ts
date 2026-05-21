/** Parses DD/MM/YYYY to start of local calendar day (epoch ms). */
export function parseBrDate(value: string | undefined): number | null {
  if (!value?.trim()) return null
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return null

  const day = Number(match[1])
  const month = Number(match[2]) - 1
  const year = Number(match[3])
  const date = new Date(year, month, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null
  }

  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function endOfLocalDay(ts: number): number {
  const date = new Date(ts)
  date.setHours(23, 59, 59, 999)
  return date.getTime()
}

/** DD/MM/YYYY → ISO 8601 timestamptz (start of local day) for PostgreSQL. */
export function brDateToTimestamptzStart(br: string | undefined): string | null {
  const ts = parseBrDate(br)
  if (ts == null) return null
  return new Date(ts).toISOString()
}

/** DD/MM/YYYY → ISO 8601 timestamptz (end of local day) for PostgreSQL. */
export function brDateToTimestamptzEnd(br: string | undefined): string | null {
  const ts = parseBrDate(br)
  if (ts == null) return null
  return new Date(endOfLocalDay(ts)).toISOString()
}

/** ISO yyyy-mm-dd → DD/MM/YYYY. */
export function isoToBrDate(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return ''
  return `${match[3]}/${match[2]}/${match[1]}`
}

/** DD/MM/YYYY → ISO yyyy-mm-dd for native date input value. */
export function brDateToIso(br: string | undefined): string {
  const ts = parseBrDate(br)
  if (ts == null) return ''
  const date = new Date(ts)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
