const ONES = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
]
const TEENS = [
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN',
  'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN',
]
const TENS = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY',
]
const SCALES = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION']

function threeDigitsToWords(n) {
  let words = ''
  if (n >= 100) {
    words += `${ONES[Math.floor(n / 100)]} HUNDRED`
    n %= 100
    if (n > 0) words += ' '
  }
  if (n >= 10 && n < 20) {
    words += TEENS[n - 10]
  } else if (n >= 20) {
    words += TENS[Math.floor(n / 10)]
    if (n % 10 > 0) words += `-${ONES[n % 10]}`
  } else if (n > 0) {
    words += ONES[n]
  }
  return words
}

function integerToWords(num) {
  if (num === 0) return 'ZERO'
  const groups = []
  let n = num
  while (n > 0) {
    groups.push(n % 1000)
    n = Math.floor(n / 1000)
  }
  const words = []
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue
    words.push(`${threeDigitsToWords(groups[i])}${SCALES[i] ? ` ${SCALES[i]}` : ''}`)
  }
  return words.join(' ')
}

// Eja nominal uang (default USD, 2 desimal = sen) jadi kalimat Bahasa Inggris, format
// lazim dokumen ekspor: "ONE THOUSAND TWO HUNDRED AND FIFTY CENTS ONLY".
export function amountToWords(amount) {
  const value = Math.round((Math.abs(amount) || 0) * 100) / 100
  const units = Math.floor(value)
  const cents = Math.round((value - units) * 100)

  let result = integerToWords(units)
  if (cents > 0) {
    result += ` AND ${integerToWords(cents)} CENTS`
  }
  return `${result} ONLY`
}
