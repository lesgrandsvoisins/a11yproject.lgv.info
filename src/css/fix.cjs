const fs = require('fs');
const path = require('path');

function findScssFiles(dir, scssFiles = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.lstatSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules') findScssFiles(fullPath, scssFiles);
        } else if (fullPath.endsWith('.scss')) {
            scssFiles.push(fullPath);
        }
    });
    return scssFiles;
}

function refactorSassFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const rulePattern = /([^{]+)\{([^{}]*?)((?: |\s) * )((\s * [ ^ {}] * \s * ) * )\}/g;
    content = content.replace(rulePattern, (match, selector, declarations, ws, nested) => {
        let cleanedDeclarations = declarations.trim().split(';').map(line => line.trim()).filter(Boolean);
        if (!nested || !nested.includes('{')) return match;
        const finalDeclarations = cleanedDeclarations.length > 0 ? cleanedDeclarations.join(';  \n') + ';\n ' : '';
        return `${selector} {
  ${finalDeclarations}
  ${nested.trim()}
}`;
    });
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored ${filePath}`);
}

const startDir = path.resolve(__dirname);
const scssFiles = findScssFiles(startDir);
scssFiles.forEach(filePath => refactorSassFile(filePath));
