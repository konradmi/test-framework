const fs = require('fs')
const { expect } = require('expect')
const mock = require('jest-mock')


exports.runTest = async function (testFile) {
  const code = await fs.promises.readFile(testFile, 'utf8')

  const testResult = {
    success: false,
    errorMessage: null,
  }
  let testName = ''
  try {
    // that's how it would more or less look. we can use the expect package instead. expect is used by jest

    // const expect = received =>  ({
    //   toBe: expected => {
    //     if (expected !== received) throw new Error(`Expected ${expected} but received ${received}` )
    //   }
    // })
    const describeFns = []
    let currentDescribeFn

    const describe = (name, fn) => describeFns.push([name, fn])
    const it = (name, fn) => currentDescribeFn.push([name, fn])
    eval(code)

    for (const [name, fn] of describeFns) {
      currentDescribeFn = []
      testName = name
      fn() // that should trigger all the it() calls that belong to the describe()

      currentDescribeFn.forEach(([itName, itFn]) => {
        testName += ' ' + itName
        itFn()
      })
    }
    testResult.success = true
  } catch(e) {
    testResult.errorMessage = e.message
  }

  return testResult
}
