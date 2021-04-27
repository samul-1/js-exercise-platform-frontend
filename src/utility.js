export function getUserFullName (user) {
  function capitalize (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
  return `${capitalize(user.first_name)} ${capitalize(user.last_name)}`
}

export function formatTimestamp (timestamp) {
  const [year, month, rest] = timestamp.split('-')
  const [day, time] = rest.split(' ')
  // eslint-disable-next-line no-unused-vars
  const [hours, minutes, seconds] = time.split(':')
  return `${day}/${month}/${year} ${hours}:${minutes}`
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
