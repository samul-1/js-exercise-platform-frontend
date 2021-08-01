export function redirectIfNotAuthenticated (app, path) {
  if (!app.$store.state.isAuthenticated) {
    app.$store.commit(
      'setRedirectToAfterLogin',
      app.$router.currentRoute.fullPath
    )
    app.$router.push(path)
  }
}

export function redirectIfNotTeacher (app, path) {
  if (!app.$store.state.user.is_teacher) {
    app.$router.push(path)
  }
}

export function redirectToMainView (app) {
  // If the logged in user is a teacher, redirects the user to the teacher dashboard
  // If the logged in user a student, redirects the student to the exam selection page
  if (app.$store.state.redirectToAfterLogin) {
    app.$router.push(app.$store.state.redirectToAfterLogin)
    app.$store.commit('resetRedirectToAfterLogin')
  } else {
    if (app.$store.state.user.is_teacher) {
      app.$router.push('/dashboard')
    } else {
      app.$router.push('/exam')
    }
  }
}
