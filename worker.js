const fs = require('fs')
const { expect } = require('expect')
const { dirname, join } = require('path')

const mock = require('jest-mock')
const vm = require('vm')
const NodeEnvironment = require('jest-environment-node').default

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
    const customRequire = fileName => {
      const code = fs.readFileSync(join(dirname(testFile), fileName), 'utf8')
      // Define a function in the `vm` context and return it. It's so that we can have multiple require statements in a file
      const moduleFactory = vm.runInContext(`(function(module) {${code}})`, environment.getVmContext())
      const module = { exports: {} }
      // Run the sandboxed function with our module object.
      moduleFactory(module)
      return module.exports // this is what's exported from 'fileName'. When moduleFactory is ran, it will mutate the
                            // the module var we defined in the customRequire function
    }

    const describeFns = []
    let currentDescribeFn

    // describe and it could be taken from the  jest-circus package
    const describe = (name, fn) => describeFns.push([name, fn])
    const it = (name, fn) => currentDescribeFn.push([name, fn])

    const environment = new NodeEnvironment({  // if we didn't use that we would have to pass to `context` things
                                                      // like setTimeout, Buffer etc. This will create a Node-like environment
                                                      // for tests
      projectConfig: {
        testEnvironmentOptions: { describe, it, expect, mock, require: customRequire },
      },
    })
    vm.runInContext(code, environment.getVmContext()) // before we used eval here. with that we can create a separate context and declare what
                                                      // should be visible there. It's kinda similar to iFrame where you can run a code in
                                                      // in isolation

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
    testResult.errorMessage = `${testName} : ${e.message}`
  }

  return testResult
}
