/**
 * Script para gerar ícones PWA em múltiplos tamanhos
 * 
 * Requisitos:
 * - Node.js instalado
 * - sharp: npm install sharp --save-dev
 * 
 * Uso: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public');

async function generateIcons() {
  console.log('Gerando ícones PWA...\n');

  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`);
    
    try {
      await sharp(inputFile)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✓ Gerado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`✗ Erro ao gerar icon-${size}x${size}.png:`, error.message);
    }
  }

  console.log('\n✓ Todos os ícones foram gerados!');
}

// Verificar se sharp está instalado
try {
  require('sharp');
  generateIcons();
} catch (error) {
  console.error('\n✗ Erro: sharp não está instalado.');
  console.log('\nPara instalar, execute:');
  console.log('  npm install sharp --save-dev\n');
  console.log('Ou use uma ferramenta online como:');
  console.log('  https://realfavicongenerator.net/');
  console.log('  https://www.pwabuilder.com/imageGenerator\n');
  process.exit(1);
}
