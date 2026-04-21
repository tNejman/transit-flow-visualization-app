

function escapeField(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function toCsv(rows, columns) {
  const header = columns.map((c) => escapeField(c.label)).join(',')
  const body = rows
    .map((row) => columns.map((c) => escapeField(c.pick(row))).join(','))
    .join('\n')
  return `${header}\n${body}\n`
}

export function downloadCsv(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
