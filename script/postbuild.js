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

const linkPreloads = links.map(link =>
  `<link rel="preload" as="script" href="/static/js/${link}">`
).join('');

const htmlWithPreload = html.replace(
  '</head>',
  linkPreloads + '</head>'
)

// console.log(htmlWithPreload)

fs.writeFileSync(htmlPath, htmlWithPreload);