// collection of pure functions

// (...a->b)->(...Array(a)->Array(b))
//> liftArray(a=>a+3)([0,1,2,10])
//< [3, 4, 5, 13]
//> liftArray((a,b)=>(a+b))([0,1,2],[10,20])
//< [10, 21, NaN]
//> liftArray((a,b)=>(a+b))([0,1,2],[10,20,30,40],[9,9])
//< [10, 21, 32]
//> liftArray((a,b,c)=>(a+b+c))([0,1,2],[10,20,30,40])
//< [NaN, NaN, NaN]
//> liftArray(Math.max)([1,9,1,1],[99,1,1],[99,1,99,100,100])
//< [99, 9, 99, NaN]
function liftArray(f) {
  function newfunc(...args) {
    let l = [...Array(args[0].length).keys()]
    return l.map(i => f(...args.map(arg => arg[i])))
  }
  return newfunc
}
self.liftArray = liftArray

function range(n) {
  return [...Array(n).keys()];
}
self.range = range
