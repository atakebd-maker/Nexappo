const fs = require('fs');
let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf8');

const regex = /const handleInstall = async \(\) => \{[\s\S]*?\}, 300\);\n  \};/;

const newHandleInstall = `const handleInstall = async () => {
    if (!app) return;

    // Immediately open the URL in a new tab
    window.open(app.apkFileURL, '_blank');

    if (installState !== 'installed') {
      setInstallState('installed');
      // Increment download count and record
      if (currentUser && db) {
        try {
          const appRef = doc(db, 'apps', app.id);
          updateDoc(appRef, {
            downloadCount: increment(1)
          });
          setApp({ ...app, downloadCount: app.downloadCount + 1 });
          
          // Record download
          const downloadRef = doc(collection(db, 'users', currentUser.uid, 'downloads'), app.id);
          setDoc(downloadRef, {
            appId: app.id,
            appName: app.appName,
            logoURL: app.logoURL,
            timestamp: Date.now()
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  };`;

code = code.replace(regex, newHandleInstall);
fs.writeFileSync('src/pages/AppDetails.tsx', code);
console.log("Updated handleInstall");
