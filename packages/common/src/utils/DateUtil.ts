const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

function pad(num: number): string {
  return num < 10 ? `0${num}` : `${num}`
}

function formatDate(date: string | number, format = 'DD MMM') {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const day = pad(d.getDate())
  const monthIndex = d.getMonth()
  const monthFull = MONTH_NAMES[monthIndex]!
  const monthShort = monthFull.slice(0, 3)
  const year = d.getFullYear()
  const monthNum = pad(monthIndex + 1)
  const hour = pad(d.getHours())
  const minute = pad(d.getMinutes())
  const second = pad(d.getSeconds())
  const ms = d.getMilliseconds().toString().padStart(3, '0')

  return format
    .replace(/YYYY/g, `${year}`)
    .replace(/MMMM/g, monthFull)
    .replace(/MMM/g, monthShort)
    .replace(/MM(?!M)/g, monthNum)
    .replace(/DD/g, day)
    .replace(/HH/g, hour)
    .replace(/mm/g, minute)
    .replace(/ss/g, second)
    .replace(/SSS/g, ms)
}

function getRelativeDateFromNow(date: string | number) {
  const now = Date.now()
  const input = new Date(date).getTime()
  let diff = Math.floor((now - input) / 1000)
  diff = Math.abs(diff)

  if (diff < 60) {
    return diff === 1 ? '1 sec' : `${diff} sec`
  } else if (diff < 3600) {
    const mins = Math.floor(diff / 60)
    return mins === 1 ? '1 min' : `${mins} min`
  } else if (diff < 86400) {
    const hrs = Math.floor(diff / 3600)
    return hrs === 1 ? '1 hr' : `${hrs} hrs`
  } else if (diff < 2592000) {
    const days = Math.floor(diff / 86400)
    return days === 1 ? '1 d' : `${days} d`
  } else if (diff < 31536000) {
    const mos = Math.floor(diff / 2592000)
    return mos === 1 ? '1 mo' : `${mos} mo`
  } else {
    const yrs = Math.floor(diff / 31536000)
    return yrs === 1 ? '1 yr' : `${yrs} yr`
  }
}

export const DateUtil = {
  getMonthNameByIndex(monthIndex: number) {
    return MONTH_NAMES[monthIndex]
  },

  getYear(date: string = new Date().toISOString()) {
    return new Date(date).getFullYear()
  },

  getRelativeDateFromNow,

  formatDate,
}
