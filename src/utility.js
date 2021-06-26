export function getUserFullName (user) {
  function capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
  return `${user.first_name
    .split(' ')
    .map(s => capitalize(s))
    .join(' ')} ${capitalize(user.last_name)}`
}

export function redirectAndSetMessage (app, redirectTo, msg, severity) {
  app.$store.commit('setSmallMessage', {
    severity,
    msg
  })
  app.$router.push(redirectTo)
}

export function formatTimestamp (timestamp) {
  const [year, month, rest] = timestamp.split('-')
  const [day, time] = rest.split(' ')
  // eslint-disable-next-line no-unused-vars
  const [hours, minutes, seconds] = time.split(':')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

export function formatTimestampShort (timestamps) {
  // todo refactor
  // if the two timestamps are the same day, omits the second timestamp's date and only adds the time
  const [year1, month1, rest1] = timestamps[0].split('-')
  const [day1, time1] = rest1.split(' ')
  // eslint-disable-next-line no-unused-vars
  const [hours1, minutes1, seconds1] = time1.split(':')
  let ret = `${day1}/${month1}/${year1} ${hours1}:${minutes1} &ndash; `

  const [year2, month2, rest2] = timestamps[1].split('-')
  const [day2, time2] = rest2.split(' ')
  // eslint-disable-next-line no-unused-vars
  const [hours2, minutes2, seconds2] = time2.split(':')
  if (year1 === year2 && month1 === month2 && day1 === day2) {
    ret += `${hours2}:${minutes2}`
  } else {
    ret += `${day2}/${month2}/${year2} ${hours2}:${minutes2}`
  }
  return ret
}

export function getExamInstructions (exam) {
  return `Gli studenti dovranno effettuare il login al seguente link: <a class="text-blue-700" href="${window.location.protocol}//${window.location.host}/login">${window.location.protocol}//${window.location.host}/login</a>. <br />
  Dopodiché, verrà chiesto loro di inserire un codice. Il codice per questo esame è:<br />
  <h1 class="p-2 my-2 text-center text-4xl">${exam.id}</h1><p>Comunicalo agli studenti che sosterranno l'esame.</p>`
}

export function getExamSummaryText (exam) {
  // Returns a string detailing an exam, used to present it to teacher when they close the exam

  return `
    Stai per chiudere l'esame <strong class="text-red-900">${
      exam.name
    }</strong>, creato da <strong class="text-red-900">${getUserFullName(
    exam.created_by
  )}</strong>.
    Una volta chiuso, l'esame non accetterà più consegne. Sei sicuro di voler procedere?
    `
}

export function truncateString (str, upToChar) {
  if (str.length <= upToChar) {
    return str
  }

  return str.slice(0, upToChar) + '&#8230;'
}

export function objectEquals (x, y) {
  'use strict'

  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y
  }
  // after this just checking type of one would be enough
  if (x.constructor !== y.constructor) {
    return false
  }
  // if they are functions, they should exactly refer to same one (because of closures)
  if (x instanceof Function) {
    return x === y
  }
  // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
  if (x instanceof RegExp) {
    return x === y
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true
  }
  if (Array.isArray(x) && x.length !== y.length) {
    return false
  }

  // if they are dates, they must had equal valueOf
  if (x instanceof Date) {
    return false
  }

  // if they are strictly equal, they both need to be object at least
  if (!(x instanceof Object)) {
    return false
  }
  if (!(y instanceof Object)) {
    return false
  }

  // recursive object equality check
  var p = Object.keys(x)
  return (
    Object.keys(y).every(function (i) {
      return p.indexOf(i) !== -1
    }) &&
    p.every(function (i) {
      return objectEquals(x[i], y[i])
    })
  )
}
