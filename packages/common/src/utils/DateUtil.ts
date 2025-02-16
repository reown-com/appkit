import dayjs from 'dayjs'
import englishLocale from 'dayjs/locale/en.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import updateLocale from 'dayjs/plugin/updateLocale.js'

dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

const localeObject = {
  ...englishLocale,
  name: 'en-web3-modal',
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '%d sec',
    m: '1 min',
    mm: '%d min',
    h: '1 hr',
    hh: '%d hrs',
    d: '1 d',
    dd: '%d d',
    M: '1 mo',
    MM: '%d mo',
    y: '1 yr',
    yy: '%d yr'
  }
}

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

dayjs.locale('en-web3-modal', localeObject)

export const DateUtil = {
  getMonthNameByIndex(monthIndex: number) {
    return MONTH_NAMES[monthIndex]
  },
  getYear(date: string = new Date().toISOString()) {
    return dayjs(date).year()
  },

  getRelativeDateFromNow(date: string | number) {
    return dayjs(date).locale('en-web3-modal').fromNow(true)
  },

  formatDate(date: string | number, format = 'DD MMM') {
    return dayjs(date).format(format)
  }
}
