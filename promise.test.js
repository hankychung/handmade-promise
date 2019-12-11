const MyPromise = require('./promise')

function resolve() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok')
    }, 1000)
  })
}

function reject() {
  return new MyPromise((resolve, reject) => {
    setTimeout(() => {
      reject('not ok')
    }, 1000)
  })
}

function error() {
  return new MyPromise((resolve, reject) => {
    console.log(start)
    setTimeout(() => {
      resolve('ok')
    }, 1000)
  })
}

function sequence() {
  return new Promise(resolve => {
    let res = ''
    let pro = new MyPromise(resolve => {
      res += 'start'
      resolve('ok')
    })
    pro.then(data => {
      res += data
      resolve(res)
    })
    res += 'end'
  })
}

function multipleCall() {
  return new Promise(resolve => {
    let res = ''
    let pro = new MyPromise(resolve => {
      resolve('ok')
    })
    pro.then(data => {
      res += 'res1:' + data
    })
    pro.then(data => {
      res += 'res2:' + data
    })
    setTimeout(() => {
      resolve(res)
    }, 1000)
  })
}

function handlePromiseValue() {
  return new Promise(resolve => {
    let pro = new MyPromise(resolve => {
      setTimeout(() => {
        resolve(
          new MyPromise((resolve, reject) => {
            setTimeout(() => {
              reject(
                new MyPromise(resolve => {
                  setTimeout(() => {
                    resolve('last pro')
                  }, 50)
                })
              )
            }, 50)
          })
        )
      }, 50)
    })

    pro.then(res => {
      resolve(res)
    })
  })
}

test('resolve test', done => {
  resolve().then(res => {
    expect(res).toBe('ok')
    done()
  })
})

test('reject test', done => {
  reject().then(
    res => {},
    rej => {
      expect(rej).toBe('not ok')
      done()
    }
  )
})

test('error test', done => {
  error().then(
    res => {},
    rej => {
      expect(rej.message).toBe('start is not defined')
      done()
    }
  )
})

test('sequence test', done => {
  sequence().then(res => {
    expect(res).toBe('startendok')
    done()
  })
})

test('multipleCall test', done => {
  multipleCall().then(res => {
    expect(res).toBe('res1:okres2:ok')
    done()
  })
})

test('handlePromiseValue test', done => {
  handlePromiseValue().then(res => {
    expect(res).toBe('last pro')
    done()
  })
})
