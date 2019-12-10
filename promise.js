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

    const resolve = value => {
      // 异步模拟，实际应为micro task
      // 箭头函数确保this的指向始终为当前的promise实例
      setTimeout(() => {
        this.status = FULFILLED
        this.value = value
        this.resolves.forEach(fn => {
          fn(value)
        })
      })
    }

    const reject = reason => {
      setTimeout(() => {
        this.status = REJECTED
        this.reason = reason
        this.rejects.forEach(fn => {
          fn(reason)
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
    if (this.status === FULFILLED) {
      // 若此时promise状态为成功，立即执行onFulfilled
      onFulfilled(this.value)
      return
    }
    if (this.status === REJECTED) {
      // 若此时promise状态为失败，立即执行onRejected
      onRejected(this.reason)
      return
    }
    if (this.status === PENDING) {
      // 若此时promise状态为处理中，注册onFulfilled函数和onRejected函数
      this.resolves.push(onFulfilled)
      this.rejects.push(onRejected)
    }
  }
}

let pro = new MyPromise((resolve, reject) => {
  console.log('start')
  setTimeout(() => {
    reject('not ok')
  }, 1000)
})

pro.then(
  res => {
    console.log(res)
  },
  reject => {
    console.log('err', reject)
  }
)

console.log('end')
