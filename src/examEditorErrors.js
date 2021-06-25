/*
    {
        globalErrors: [],
        questionErrors: {
            id:    [errMsg, ...],
            ...
        },
        exerciseErrors: { ... },
        questionCategoryErrors: { ... },
        exerciseCategoryErrors: { ... }
    }
*/

export const EXAM_NO_NAME = "Inserisci un nome per l'esame"
export const EXAM_NO_BEGIN_TIMESTAMP =
  'Seleziona una data e ora di inizio esame'
export const EXAM_NO_END_TIMESTAMP = 'Seleziona una data e ora di fine esame'
export const EXAM_NO_ITEMS = "Non hai inserito domande o esercizi nell'esame" // todo maybe should allow to save as draft?

export const EXERCISE_NO_TEXT = 'Questo esercizio non ha un testo'
export const EXERCISE_INVALID_TESTCASE_THRESHOLD =
  'Hai selezionato un numero di test case minimi non valido'
export const EXERCISE_EMPTY_TESTCASE =
  'Questo esercizio contiene almeno un test case vuoto'
export const EXERCISE_NO_CATEGORY =
  'Questo esercizio non appartiene a una categoria'

export const QUESTION_NO_TEXT = 'Questa domanda non ha un testo'
export const QUESTION_NO_CATEGORY =
  'Questa domanda non appartiene a una categoria'
export const QUESTION_NO_RIGHT_ANSWER =
  'Questa domanda non ha risposte corrette'
export const QUESTION_EMPTY_ANSWER =
  'Questa domanda contiene almeno una risposta senza testo'

export const CATEGORY_NEGATIVE_AMOUNT =
  'Il campo quantità di questa categoria contiene un numero negativo'
export const CATEGORY_NO_NAME = 'Questa categoria non ha nome'

export const QUESTION_CATEGORY_AMOUNT_TOO_HIGH =
  'Hai assegnato a questa categoria una quantità di domande maggiore del numero effettivo di domande appartenenti alla categoria'

export const EXERCISE_CATEGORY_AMOUNT_TOO_HIGH =
  'Hai assegnato a questa categoria una quantità di esercizi maggiore del numero effettivo di esercizi appartenenti alla categoria'

function pushOrCreate (object, property, value) {
  if (object[property]) {
    object[property].push(value)
  } else {
    object[property] = [value]
  }
}

export function getEditorErrors (exam) {
  let ret = {
    globalErrors: [],
    questionErrors: {},
    exerciseErrors: {},
    questionCategoryErrors: {},
    exerciseCategoryErrors: {}
  }
  if (!exam.name.length) {
    ret.globalErrors.push(EXAM_NO_NAME)
  }
  if (!exam.begin_timestamp) {
    ret.globalErrors.push(EXAM_NO_BEGIN_TIMESTAMP)
  }
  if (!exam.end_timestamp) {
    ret.globalErrors.push(EXAM_NO_END_TIMESTAMP)
  }
  if (!exam.exercises.length && !exam.questions.length) {
    ret.globalErrors.push(EXAM_NO_ITEMS)
  }
  for (let exercise of exam.exercises) {
    if (!exercise.text.length) {
      pushOrCreate(ret.exerciseErrors, exercise.id, EXERCISE_NO_TEXT)
    }
    if (
      exercise.min_passing_testcases < 0 ||
      exercise.min_passing_testcases > exercise.testcases.length
    ) {
      pushOrCreate(
        ret.exerciseErrors,
        exercise.id,
        EXERCISE_INVALID_TESTCASE_THRESHOLD
      )
    }
    if (exercise.testcases.some(t => !t.assertion.length)) {
      pushOrCreate(ret.exerciseErrors, exercise.id, EXERCISE_EMPTY_TESTCASE)
    }
    if (!exercise.category) {
      pushOrCreate(ret.exerciseErrors, exercise.id, EXERCISE_NO_CATEGORY)
    }
  }
  for (let question of exam.questions) {
    if (!question.text.length) {
      pushOrCreate(ret.questionErrors, question.id, QUESTION_NO_TEXT)
    }
    if (
      question.question_type === 'm' &&
      !question.answers.filter(a => a.is_right_answer).length
    ) {
      pushOrCreate(ret.questionErrors, question.id, QUESTION_NO_RIGHT_ANSWER)
    }
    if (question.answers.some(a => !a.text.length)) {
      pushOrCreate(ret.questionErrors, question.id, QUESTION_EMPTY_ANSWER)
    }
    if (!question.category) {
      pushOrCreate(ret.questionErrors, question.id, QUESTION_NO_CATEGORY)
    }
    for (let category of [
      ...exam.exerciseCategories,
      ...exam.questionCategories
    ]) {
      if (category.amount < 0) {
        pushOrCreate(
          category.item_type == 'q'
            ? ret.questionCategoryErrors
            : ret.exerciseCategoryErrors,
          category.id,
          CATEGORY_NEGATIVE_AMOUNT
        )
      }
      if (!category.name.length) {
        pushOrCreate(
          category.item_type == 'q'
            ? ret.questionCategoryErrors
            : ret.exerciseCategoryErrors,
          category.id,
          CATEGORY_NO_NAME
        )
      }
    }

    for (let category of exam.questionCategories) {
      if (
        !category.is_aggregated_question &&
        category.randomize &&
        category.amount >
          exam.questions.filter(q => q.category == category.id).length
      ) {
        pushOrCreate(
          ret.questionCategoryErrors,
          category.id,
          QUESTION_CATEGORY_AMOUNT_TOO_HIGH
        )
      }
    }

    for (let category of exam.exerciseCategories) {
      if (
        category.randomize &&
        category.amount >
          exam.exercises.filter(e => e.category == category.id).length
      ) {
        pushOrCreate(
          ret.exerciseCategoryErrors,
          category.id,
          EXERCISE_CATEGORY_AMOUNT_TOO_HIGH
        )
      }
    }
  }
  console.log(ret)
  return ret
}
