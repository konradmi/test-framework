# test-framework


An implementation of jest-like framework. Libraries used:

- `jest-haste-map` - for retrieving files from the hard drive. It will also cache all the files so the next time it will be able to tell what has changed on the file system since the last time it was invoked
- `jest-worker` - to ensure we can run tests in paralllel. It uses Node's worker threads under the hood
- `jest-mock` - to provide mocking capabilities
- `expect` - assertions
- `jest-environment-node` - creates a context in which tests are executed.
