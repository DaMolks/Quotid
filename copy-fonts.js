const fs = require('fs');
const path = require('path');

// Créer le dossier fonts s'il n'existe pas
const androidFontsDir = path.resolve(__dirname, 'android/app/src/main/assets/fonts');

if (!fs.existsSync(androidFontsDir)) {
  fs.mkdirSync(androidFontsDir, { recursive: true });
  console.log('Dossier fonts créé:', androidFontsDir);
}

// Copier toutes les polices depuis react-native-vector-icons
const vectorIconsDir = path.resolve(__dirname, 'node_modules/react-native-vector-icons/Fonts');
const vectorIconsFonts = fs.readdirSync(vectorIconsDir);

// Copier chaque fichier de police
vectorIconsFonts.forEach(font => {
  const source = path.join(vectorIconsDir, font);
  const dest = path.join(androidFontsDir, font);
  
  fs.copyFileSync(source, dest);
  console.log(`Copié: ${font}`);
});

console.log('Toutes les polices ont été copiées avec succès!');
