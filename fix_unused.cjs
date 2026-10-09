const fs = require('fs');
let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf8');
code = code.replace(/const \[installProgress, setInstallProgress\] = useState\(0\);\n?/, '');
fs.writeFileSync('src/pages/AppDetails.tsx', code);
console.log("Removed installProgress");
