const EventEmitter = require('events')

class QueueLimit {
  constructor (run, limitPerSecond) {
    this.run = run
    this.limitPerSecond = limitPerSecond
    this.currentSecondCount = 0
    this.MILLISECOND_OFFSET = 1500  // given a 100 millisecond buffer, for those things in life
    this.head = null
    this.tail = null
  }

  __appendCount () {
    this.currentSecondCount++
  }

  __setPopCount () {
    setTimeout(() => {
      this.currentSecondCount--
      this.__fireNextEvent()
    }, this.MILLISECOND_OFFSET)
  }

  __runFunction () {
    this.__appendCount()
    let p = this.run.apply(null, arguments).then(resp => {
      return resp
    })
    return p.then(resp => {
      // FOR those times you need to know whats inside
      // console.log(resp)
      this.__setPopCount()
      return resp
    })
  }

  __fireNextEvent () {
    if (this.head && this.head.next) {
      this.head = this.head.next
      let e = this.head.event
      e.emit('event')
    }
  }

  __canRunNextFunction () {
    return this.currentSecondCount < this.limitPerSecond
  }

  __appendEventNode () {
    let e = new EventEmitter()
    let node = {
      event: e,
      next: null
    }
    if (this.tail) {
      this.tail.next = node
    } else {
      this.head = node
    }
    this.tail = node
    return e
  }

  generateQueuedFunction () {
    // You have to check the head for the next one, and run those
    let that = this
    return function () {
      if (that.__canRunNextFunction()) {
        return that.__runFunction.apply(that, arguments)
      } else {
        let e = that.__appendEventNode()
        let eventPromiseFunction = function () {
          let functionArguments = arguments
          return new Promise((resolve, reject) => {
            e.once('event', () => {
              resolve(that.__runFunction.apply(that, functionArguments))
            })
          })
        }
        return eventPromiseFunction.apply(that, arguments)
      }
    }
  }
}

const sleep = async function (sec) {
  return new Promise((res, rej) => {
    setTimeout(function () {
      res()
    }, sec * 1000)
  })
}

module.exports = {
  QueueLimit,
  sleep
}