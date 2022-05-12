import JestHasteMap from 'jest-haste-map'
import chalk from 'chalk'

import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'
import { cpus } from 'os'
import { Worker } from 'jest-worker'

// Get the root path to our project (Like `__dirname` but __dirname can't be used since it's an .mjs file).
const root = dirname(fileURLToPath(import.meta.url))
const hasteMapOptions = {
    extensions: ['js'],
    maxWorkers: cpus().length,
    name: 'test-framework',
    platforms: [],
    rootDir: root,
    roots: [root],
}

const hasteMap = new JestHasteMap.default(hasteMapOptions);
await hasteMap.setupCachePath(hasteMapOptions)
// jest-haste-map keeps a cache of the file system in memory and on disk so that file related operations are fast
// whenever something changes in the file system, it's gonna be updated in the jest-haste-map's cache as well
const { hasteFS } = await hasteMap.build()

const specificTestFilesToRun = process.argv[2]
const testFiles = hasteFS.matchFilesWithGlob([
  specificTestFilesToRun ? `**/${specificTestFilesToRun}` : '**/*.test.js'
])

const worker = new Worker(join(root, 'worker.js'), {
    enableWorkerThreads: true,
})

let hasFailed = false

await Promise.all(
  Array.from(testFiles).map(async (testFile) => {
    const { success, errorMessage } = await worker.runTest(testFile)

      const status = success
        ? chalk.green.inverse(' PASS ')
        : chalk.red.inverse( ' FAIL ')
      console.log(`${status} ${chalk.dim(relative(root, testFile)) }`)

    if (!success) {
      hasFailed = true
      console.log(`  ${errorMessage}`)
    }
  }),
)

worker.end()

if (hasFailed) {
    console.log(chalk.red.bold('\n Test run failed, please fix all the failing tests.'))
    // we don't want to return status 0. if we ran it on CI we'd like that to fail
    process.exitCode = 1
}

