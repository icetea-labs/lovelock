const fs = require('fs');
const htmlPath = './build/index.html';

const html = fs.readFileSync(htmlPath).toString();

// console.log(html)

const jsFiles = fs.readdirSync('./build/static/js').filter(fn => fn.endsWith('.js'));
const cssFiles = fs.readdirSync('./build/static/css').filter(fn => fn.endsWith('.css'));
// console.log(jsFiles)

const PRELOAD_FILES = [
    //'tweb3',
    //'1', // tweb3 companion
    'app',
    '20', // app companion
    //'home_layout',
    //'0', '2', '3', // home_layout companion
    //'home'
]

const preloadJsLinks = jsFiles.filter(fn => {
    const id = fn.split('.', 2)[0]
    return PRELOAD_FILES.includes(id)
})

const preloadCssLinks = cssFiles.filter(fn => {
    const id = fn.split('.', 2)[0]
    return PRELOAD_FILES.includes(id)
})

// console.log(preloadCssLinks)

const jsTagText = preloadJsLinks.map(link =>
    `<link rel="preload" as="script" href="/static/js/${link}">`
).join('');

const cssTagText = preloadCssLinks.map(link =>
    `<link rel="preload" as="style" href="/static/css/${link}">`
).join('');

const htmlWithPreload = html.replace(
    '</head>',
    jsTagText + cssTagText + '</head>'
)

// console.log(htmlWithPreload)

fs.writeFileSync(htmlPath, htmlWithPreload);