const banana = require('./banana.js')

describe('banana', () => {
  it('banana', () => {
    expect(banana).toBe('good')
  })
})

describe('describe test', () => {
  it('works', () => {
    expect(1).toBe(1)
  })
})

describe('second describe test', () => {
  it(`doesn't work`, async () => {
    await new Promise((resolve) => setTimeout(resolve, 200) )
    expect(1).toBe(2)
  })
})
