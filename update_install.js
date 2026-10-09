const fs = require('fs');
let code = fs.readFileSync('src/pages/AppDetails.tsx', 'utf8');

const oldHandleInstall = `  const handleInstall = async () => {
    if (!app || installState === 'installing') return;

    if (installState === 'installed') {
      alert("Please check your device's File Manager or Downloads folder to install and open the APK.");
      return;
    }

    setInstallState('installing');
    setInstallProgress(0);
    
    // Trigger download immediately so it downloads "during" the loading phase
    const link = document.createElement('a');
    link.href = app.apkFileURL;
    link.target = '_blank';
    link.download = \`\${app.appName.replace(/\\s+/g, '_')}.apk\`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const interval = setInterval(async () => {
      setInstallProgress(prev => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
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
          return 100;
        }
        return next;
      });
    }, 300);
  };`;

const newHandleInstall = `  const handleInstall = async () => {
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

code = code.replace(oldHandleInstall, newHandleInstall);
fs.writeFileSync('src/pages/AppDetails.tsx', code);
console.log("Updated handleInstall");
