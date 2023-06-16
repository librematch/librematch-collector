import * as fs from "fs";

const [bin, folder, command, subset] = process.argv;

// console.log(process.argv);

function applySubset() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    packageJson.scripts = {};
    fs.writeFileSync('dist/package.deps.json', JSON.stringify(packageJson, null, 2));
}

function clean() {
    fs.unlinkSync('package.deps.json');
}

if (command === 'apply') {
    applySubset();
}

if (command === 'clean') {
    clean();
}
