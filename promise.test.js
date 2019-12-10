const MyPromise = require('./promise')

function fn() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok')
    }, 1000)
  })
}

test('test', done => {
  fn().then(res => {
    expect(res).toBe('ok')
    done()
  })
})
