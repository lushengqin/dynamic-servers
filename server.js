var http = require('http')
var fs = require('fs')
var url = require('url')
const { resolve } = require('path')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url 
  var queryString = ''
  if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  /******** 从这里开始看，上面不要看 ************/

  console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)
  if (path === "/sign_in" && method === "POST") {
    const userArray = JSON.parse(fs.readFileSync("./db/user.json"));
    const array = [];
    request.on("data", chunk => {
      array.push(chunk);
    });
    request.on("end", () => {
      const string = Buffer.concat(array).toString();
      const obj = JSON.parse(string); // name password
      const user = userArray.find(
        user => user.name === obj.name && user.password === obj.password
      );
      if (user === undefined) {
        response.statusCode = 400;
        // response.setHeader("Content-Type", "text/json; charset=utf-8");
        console.log('失败')
        response.end()
      } else {
        response.statusCode = 200;
        console.log('成功')
        response.setHeader('Set-Cookie','loginEd=1 ; HttpOnly')  //HttpOnly 防止前端操作cookie
        response.end()
      }
      
    });
  } else if (path === '/home.html') {
    console.log('html里面了')
    //内容不知道怎么写
    const cookie = request.headers['cookie']
    console.log('-----'+cookie)
    if (cookie === 'loginEd=1') {
      const homeHtml = fs.readFileSync('./public/home.html').toString()
      const string = homeHtml.replace('{{loginStatus}}', '已登录')
      response.write(string)
    } else {
      const homeHtml = fs.readFileSync('./public/home.html').toString()
      const string = homeHtml.replace('{{loginStatus}}', '未登录')
      response.write(string)
    }
    response.end()
  }else if (path === '/login' && method === 'POST') { 
    response.setHeader('Content-Type','text/html;charset=utf-8')
    const array = []
    const userArray = JSON.parse(fs.readFileSync('./db/user.json'))
    request.on('data', (chunk) => { /**监听response的上传事件 如果用户上传了 我们就把用户上传的内容push到空数组里面 */
      array.push(chunk)
    })
    request.on('end', () => {
      const lastUser = userArray[userArray.length-1]
      const string = Buffer.concat(array).toString()
      const obj = JSON.parse(string)
      const newUser = {
        id: lastUser?lastUser.id+1:1,
        name:obj.name,
        password:obj.password
      }
      userArray.push(newUser)
      fs.writeFileSync('./db/user.json',JSON.stringify(userArray))
      // console.log(typeof obj)
      response.end()
    })
  }else {
    response.statusCode = 200
   
    /* 如果path全等于/ 那么输入/就等于输入index.html相当于默认设置首页  如果不是那么就加path*/ 
    const filePath = path === '/' ? '/index.html' : path
    const index = filePath.lastIndexOf('.') /*找到它的点*/
    const suffix = filePath.substring(index)  /*得到点及点后面的*/
    const fileType = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg'
    }
    console.log(fileType[suffix])
    response.setHeader('Content-Type',
        `${fileType[suffix] || 'text/html'};charset=utf-8 `)
    let content
    try {
        content   = fs.readFileSync(`./public${filePath}`)
    } catch(error) {
        content = '文件不存在'
        response.statusCode = 404
    } 
    
    response.write(content) 
    response.end()
  }
    
  /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)