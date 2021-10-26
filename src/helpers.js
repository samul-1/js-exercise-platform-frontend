import { uuid } from 'vue-uuid'

export function deepCopyExam (exam) {
  /*
    Takes in an exam object, returns a copy of it that can be submitted to the backend
    to create an exact copy of the given exam, ex novo.

    In particular, this:
    1. strips off all the `id` fields in questions, exercises, and categories
    2. assigns each category a uuid in a `tmp_uuid` field
    3. for each exercise and question, replaces the field `category` (which used to
        contain the stripped-off id of the category) with a `category_uuid` that points to
        the newly assigned uuid
    */
  const ret = JSON.parse(JSON.stringify(exam)) // deep copy the object
  console.log('ret', ret)

  const idToUuidMap = new Map()

  ret.categories.forEach(category => {
    if (category.id) {
      const tmpUuid = uuid.v4()
      idToUuidMap.set(category.id, tmpUuid)
      delete category.id
      category.tmp_uuid = tmpUuid
    }
  })
  ;[...ret.questions, ...ret.exercises].forEach(item => {
    if (item.category) {
      item.category_uuid = idToUuidMap.get(item.category)
      delete item.category
    }
    delete item.id
    ;[...(item.testcases ?? item.answers)].forEach(item => delete item.id)
  })

  // todo delete stuff like "closed_by" fields from exam object and "selections", "num_appearances" from items
  console.log(JSON.stringify(ret))

  return JSON.stringify(ret)
}
