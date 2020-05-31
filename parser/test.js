
const b = () =>{
    return 5
}

const a = () =>{
    const result = () =>{
        return b()
    }
    return result
}

console.log(a()())