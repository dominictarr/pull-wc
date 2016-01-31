var utf8 = require('pull-utf8-decoder')
var split = require('pull-split')
var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')

function bytes (stats) {
  return pull.through(function (e) {
    stats.bytes += e.length
  })
}

function lines (stats) {
  return pull(
    utf8(),
    split(),
    pull.through(function (e) {
      stats.lines ++
    })
  )
}

function words (stats) {
  return pull(
    pull.map(function (line) {
      return line.split(/\s+/)
    }),
    pull.through(function (e) {
      stats.words += e.length
    })
  )
}

module.exports = function (cb) {
  var stats = {bytes:0, words:0, lines:0}
  return pull(
    bytes(stats), lines(stats), words(stats),
    pull.drain(null, function (err) {
      cb(err, stats)
    })
  )
}

if(!module.parent) {
   var fs = require('fs')
  var toPull = require('stream-to-pull-stream')

  var file = process.argv[2]
  var source = toPull.source(
    file ? fs.createReadStream(file) : process.stdin
  )

  pull(
    source,
    module.exports(function (err, stats) {
      if(err) throw err
      console.log(stats)
    })
  )
}




