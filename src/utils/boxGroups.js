const toNumber = (value) => parseFloat(value || 0) || 0

export const arrangeBoxGroups = (details = []) => {
  const blocks = []
  const byCode = new Map()
  for (const detail of details) {
    const code = (detail.box_group || '').trim().toUpperCase()
    if (!code) {
      blocks.push([detail])
      continue
    }
    if (!byCode.has(code)) {
      const block = []
      byCode.set(code, block)
      blocks.push(block)
    }
    byCode.get(code).push(detail)
  }

  return blocks.flatMap((rows) => {
    const lead =
      rows.find((r) => toNumber(r.quantity_boxes) > 0 || toNumber(r.quantity_crates) > 0) || rows[0]
    const ordered = [lead, ...rows.filter((r) => r !== lead)]
    const isGroup = ordered.length > 1
    return ordered.map((row, idx) => ({
      ...row,
      _boxSpan: idx === 0 ? ordered.length : 0,
      _isBoxMember: idx > 0,
      _isBoxGroup: isGroup,
      _groupBoxes: toNumber(lead.quantity_boxes),
    }))
  })
}
