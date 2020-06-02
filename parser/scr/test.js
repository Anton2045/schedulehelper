// const today = new Date()
// console.log(today.getHours(), today.getMinutes())
// h = today.getHours()
// m = today.getMinutes()
// result = h*60 + m
// tim = 19*60 + 50
// console.log(tim - result)
// setTimeout(()=>{console.log('hhahaha')},((tim - result)*60*1000))
// console.log(result)

function f() {
    console.log('esfsf')
    setTimeout(f,5000)
}
f()