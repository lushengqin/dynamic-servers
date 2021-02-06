const fs = require("fs")

//读数据
const usersString = fs.readFileSync('./db/user.json').toString()
console.log(usersString)
console.log(typeof usersString)

const usersArray = JSON.parse(usersString)  //JSon
console.log(usersArray) 
console.log(usersArray instanceof Array) //如果它为true 那么它就是一个数组 不然就返回false
console.log(typeof usersArray) 


//写数据库   需求 增加User4 把它添加到读出来的内容里面
const user4 = { id: 4, name: 'tom', password: 22 }
usersArray.push(user4)
console.log(usersArray)
const userStringFile = JSON.stringify(usersArray)
fs.writeFileSync('./db/user.json', userStringFile) 