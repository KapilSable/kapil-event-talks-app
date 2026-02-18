const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, 'dist');
const publicDir = path.join(__dirname, 'public');
const talksFile = path.join(__dirname, 'talks.json');

// Ensure dist directory exists
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

// 1. Read index.html
let html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');

// 2. Read style.css and inject
const css = fs.readFileSync(path.join(publicDir, 'style.css'), 'utf8');
html = html.replace('<link rel="stylesheet" href="style.css">', `<style>${css}</style>`);

// 3. Read script.js
let js = fs.readFileSync(path.join(publicDir, 'script.js'), 'utf8');

// 4. Read talks.json and embed into script.js
const talksData = fs.readFileSync(talksFile, 'utf8');
const embeddedTalks = `const embeddedAllTalks = ${talksData};`;

// Modify script.js to use embedded data instead of fetching
js = js.replace(
    `fetch('/api/talks')
        .then(response => response.json())
        .then(data => {
            allTalks = data;
            renderSchedule(allTalks);
        })
        .catch(error => {
            console.error('Error fetching talks:', error);
            scheduleDiv.innerHTML = '<p class="no-talks">Failed to load talks schedule.</p>';
        });`,
    `
    ${embeddedTalks}
    allTalks = embeddedAllTalks;
    renderSchedule(allTalks);
    `
);

// Inject script.js
html = html.replace('<script src="script.js"></script>', `<script>${js}</script>`);

// 5. Write the combined content to dist/index.html
fs.writeFileSync(path.join(buildDir, 'index.html'), html, 'utf8');

console.log('Build complete! Single HTML file generated at dist/index.html');
