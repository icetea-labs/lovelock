const fs = require('fs');
const htmlPath = './build/index.html';

const html = fs.readFileSync(htmlPath).toString();

// console.log(html)

const jsFiles = fs.readdirSync('./build/static/js').filter(fn => fn.endsWith('.js'));
// console.log(jsFiles)

const PRELOAD_FILES = [
  'tweb3',
  '1', // tweb3 companion
  'app',
  '20', // app companion
  //'home_layout',
  //'0', '2', '3', // home_layout companion
  //'home'
]

const links = jsFiles.filter(fn => {
  const id = fn.split('.', 2)[0]
  return PRELOAD_FILES.includes(id)
})

// console.log(links)
const filesText = '['+ links.map(l => `"/static/js/${l}"`).join(',') + ']'

const scriptTagHtml = `<script>(function(d){
${filesText}.forEach(function(p){
var l = d.createElement("link");
l.href = p;
l.rel = "preload";
l.as = "script";
d.head.appendChild(l);
})})(document)</script>`


//console.log(scriptTagHtml)


const htmlWithPreload = html.replace(
  '</body>',
  scriptTagHtml + '</body>'
)

// console.log(htmlWithPreload)

fs.writeFileSync(htmlPath, htmlWithPreload);