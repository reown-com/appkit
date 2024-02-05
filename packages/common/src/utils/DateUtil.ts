import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale.js'
import relativeTime from 'dayjs/plugin/relativeTime.js'

dayjs.extend(relativeTime)
dayjs.extend(updateLocale)

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: '%s sec',
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
})

export const DateUtil = {
  getYear(date: string = new Date().toISOString()) {
    return dayjs(date).year()
  },

  getRelativeDateFromNow(date: string | number) {
    return dayjs(date).fromNow(true)
  },

  formatDate(date: string | number, format = 'DD MMM') {
    return dayjs(date).format(format)
  }
}
