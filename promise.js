/**
 * executor是带有 resolve 和 reject 两个参数的函数。
 * Promise构造函数执行时立即调用 executor 函数，
 * resolve 和 reject 两个函数作为参数传递给executor
 * （executor 函数在Promise构造函数返回所建promise实例对象前被调用）。
 * resolve 和 reject 函数被调用时，分别将promise的状态改为fulfilled（完成）或rejected（失败）。
 * executor 内部通常会执行一些异步操作，一旦异步操作执行完毕(可能成功/失败)，
 * 要么调用resolve函数来将promise状态改成fulfilled，
 * 要么调用reject 函数将promise的状态改为rejected。
 * 如果在executor函数中抛出一个错误，那么该promise 状态为rejected。executor函数的返回值被忽略。
 */

const FULFILLED = Symbol(),
  REJECTED = Symbol(),
  PENDING = Symbol()

class MyPromise {
  constructor(executor) {
    // 初始状态
    this.status = PENDING
    // 状态为FULFILLED时赋值
    this.value = null
    // 状态为REJECTED时赋值
    this.reason = null
    // 成功/失败后执行的回调函数，由于一个promise可能会被多次调用，用数组来存储PENDING时注册的回调函数
    this.resolves = []
    this.rejects = []
    // 箭头函数确保this的指向始终为当前的promise实例
    const resolve = value => {
      // 异步模拟，实际应为micro task
      setTimeout(() => {
        // 确保状态是未完成的情况下进行，否则有可能即处理onFulfilled又处理onRejected
        if (this.status !== PENDING) return
        this.status = FULFILLED
        this.value = value
        this.resolves.forEach(fn => {
          fn()
        })
      })
    }

    const reject = reason => {
      setTimeout(() => {
        if (this.status !== PENDING) return
        if (reason instanceof MyPromise) {
          return reason.then(resolve, reject)
        }
        this.status = REJECTED
        this.reason = reason
        this.rejects.forEach(fn => {
          fn()
        })
      })
    }

    // 若执行器执行过程出现错误，立即reject处理
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    // *穿透*
    // 规范onFulfilled函数，默认为返回成功后的值
    onFulfilled =
      typeof onFulfilled === 'function' ? onFulfilled : value => value
    // 规范onRejected函数，默认为抛出异常，若为函数可接住异常并处理
    onRejected =
      typeof onRejected === 'function'
        ? onRejected
        : error => {
            throw error
          }

    // then函数将返回一个新的promise实例
    let promise2

    promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        let res = onFulfilled(this.value)
        resolvePromise(promise2, res, resolve, reject)
        // 此处不需要写reject的处理函数，executor执行过程出错会捕获错误给reject的处理函数
      }
      if (this.status === REJECTED) {
        let res = onRejected(this.reason)
        resolvePromise(promise2, res, resolve, reject)
      }
      if (this.status === PENDING) {
        /**
         * 若此时promise状态为处理中，注册onFulfilled函数和onRejected函数
         * 依然返回一个新的MyPromise，其状态改变的时刻取决于上一个MyPromise的状态改变时
         */
        this.resolves.push(() => {
          try {
            let res = onFulfilled(this.value)
            resolvePromise(promise2, res, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
        this.rejects.push(() => {
          try {
            let res = onRejected(this.reason)
            resolvePromise(promise2, res, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }
    })

    return promise2
  }
}

function resolvePromise(promise2, res, resolve, reject) {
  if (promise2 === res) throw 'error'
  if (res instanceof MyPromise) {
    res.then(
      data => {
        /**
         * 若成功回调函数的参数是一个MyPromise实例，等待其执行原MyPromise实例传入的resolve/reject函数
         * 即返回的res.then(resolve, reject)，实际上是原MyPromise将执行的完成嫁接于此MyPromise之上
         * 此处需递归调用
         */
        resolvePromise(promise2, data, resolve, reject)
      },
      error => {
        reject(error)
      }
    )
  } else {
    resolve(res)
  }
}

// test
new MyPromise(resolve => {
  setTimeout(() => {
    resolve('first')
  }, 1000)
})
  .then(res => {
    console.log(res)
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        reject(res + 'second')
      }, 1000)
    })
  })
  .then(
    res => {
      console.log(res)
      return new MyPromise(resolve => {
        setTimeout(() => {
          resolve(res + 'third')
        }, 1000)
      })
    },
    err => {
      console.log(err)
      return new MyPromise((resolve, reject) => {
        setTimeout(() => {
          reject(err + 'err-third')
        }, 1000)
      })
    }
  )
  .then(
    res => {
      console.log(res)
    },
    rej => {
      console.log('err', rej)
    }
  )
