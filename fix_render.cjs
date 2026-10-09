const fs = require('fs');
let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf8');

const regex2 = /<button \s*onClick=\{handleInstall\}\s*disabled=\{installState === 'installing'\}\s*className="mt-6 w-full md:w-auto relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-700 active:scale-\[0\.98\] transition-all text-white py-4 px-10 rounded-full font-bold text-lg shadow-lg shadow-indigo-600\/30 flex items-center justify-center gap-2"\s*>\s*\{installState === 'installing' && \(\s*<div \s*className="absolute left-0 top-0 bottom-0 bg-indigo-500 transition-all duration-200" \s*style=\{\{ width: \`\$\{installProgress\}%\` \}\}\s*><\/div>\s*\)\}\s*<span className="relative z-10 flex items-center gap-2">\s*\{installState === 'none' && <><Download className="w-6 h-6" \/> Install<\/>\}\s*\{installState === 'installing' && <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"><\/div> Installing... \{Math\.round\(installProgress\)\}%<\/>\}\s*\{installState === 'installed' && 'Open'\}\s*<\/span>\s*<\/button>/;

const newButton = `<button 
              onClick={handleInstall}
              className="mt-6 w-full md:w-auto relative overflow-hidden bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white py-4 px-10 rounded-full font-bold text-lg shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Download className="w-6 h-6" /> {installState === 'installed' ? 'Install Again' : 'Install'}
              </span>
            </button>`;

code = code.replace(regex2, newButton);
fs.writeFileSync('src/pages/AppDetails.tsx', code);
console.log("Updated rendering");
