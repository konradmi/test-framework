const fs = require('fs')
const { expect } = require('expect')

exports.runTest = async function (testFile) {
  const code = await fs.promises.readFile(testFile, 'utf8')

  const testResult = {
    success: false,
    errorMessage: null,
  }
  try {
    // that's how it would more or less look. we can use the expect package instead. expect is used by jest

    // const expect = received =>  ({
    //   toBe: expected => {
    //     if (expected !== received) throw new Error(`Expected ${expected} but received ${received}` )
    //   }
    // })
    eval(code)
    testResult.success = true
  } catch(e) {
    testResult.errorMessage = e.message
  }

  return testResult
}
