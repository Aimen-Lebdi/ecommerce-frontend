// scripts/extract-translations.js
const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

// Configuration
const SRC_DIR = path.join(__dirname, '../src');
const EXCLUDE_DIRS = ['node_modules', 'dist', 'build', '.git'];
const TRANSLATIONS_OUTPUT = path.join(__dirname, '../src/locales/en/extracted.json');

// Store extracted translations
const translations = {};
let translationCounter = 0;

/**
 * Generate a translation key from text
 */
function generateKey(text, componentName) {
  const cleanText = text.trim().toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 30);
  
  return `${componentName}.${cleanText}_${translationCounter++}`;
}

/**
 * Check if a string should be translated
 */
function shouldTranslate(str) {
  if (!str || typeof str !== 'string') return false;
  
  // Skip if:
  const trimmed = str.trim();
  
  // Empty or very short
  if (trimmed.length < 2) return false;
  
  // Only special characters or numbers
  if (/^[^a-zA-Z]+$/.test(trimmed)) return false;
  
  // URLs or paths
  if (trimmed.startsWith('http') || trimmed.startsWith('/') || trimmed.startsWith('.')) return false;
  
  // Variable-like strings
  if (/^[a-z][a-zA-Z0-9_]*$/.test(trimmed) && trimmed === trimmed.toLowerCase()) return false;
  
  return true;
}

/**
 * Process a single file
 */
function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const componentName = path.basename(filePath, path.extname(filePath)).toLowerCase();
  
  try {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    let hasTranslations = false;
    let hasUseTranslation = false;

    // Check if useTranslation is already imported
    traverse(ast, {
      ImportDeclaration(path) {
        if (path.node.source.value === 'react-i18next') {
          hasUseTranslation = true;
        }
      },
    });

    traverse(ast, {
      JSXText(path) {
        const text = path.node.value;
        if (shouldTranslate(text)) {
          const key = generateKey(text, componentName);
          translations[key] = text.trim();
          
          // Replace JSXText with JSXExpressionContainer containing t() call
          path.replaceWith(
            t.jsxExpressionContainer(
              t.callExpression(
                t.identifier('t'),
                [t.stringLiteral(key)]
              )
            )
          );
          hasTranslations = true;
        }
      },
      
      JSXAttribute(path) {
        const { name, value } = path.node;
        
        // Handle string literals in JSX attributes like placeholder="..."
        if (t.isStringLiteral(value) && shouldTranslate(value.value)) {
          const attrName = name.name;
          const text = value.value;
          const key = generateKey(`${attrName}_${text}`, componentName);
          translations[key] = text;
          
          // Replace with JSXExpressionContainer containing t() call
          path.node.value = t.jsxExpressionContainer(
            t.callExpression(
              t.identifier('t'),
              [t.stringLiteral(key)]
            )
          );
          hasTranslations = true;
        }
      },
    });

    // If we added translations, add the import
    if (hasTranslations && !hasUseTranslation) {
      const importDeclaration = t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier('useTranslation'),
            t.identifier('useTranslation')
          )
        ],
        t.stringLiteral('react-i18next')
      );
      
      ast.program.body.unshift(importDeclaration);
    }

    // If translations were added, we need to add the hook call
    if (hasTranslations) {
      traverse(ast, {
        FunctionDeclaration(path) {
          const body = path.node.body.body;
          if (body && body.length > 0) {
            // Check if useTranslation is already called
            const hasHook = body.some(statement => {
              return t.isVariableDeclaration(statement) &&
                statement.declarations.some(decl => 
                  t.isCallExpression(decl.init) &&
                  t.isIdentifier(decl.init.callee) &&
                  decl.init.callee.name === 'useTranslation'
                );
            });
            
            if (!hasHook) {
              // Add: const { t } = useTranslation();
              const hookCall = t.variableDeclaration('const', [
                t.variableDeclarator(
                  t.objectPattern([
                    t.objectProperty(
                      t.identifier('t'),
                      t.identifier('t'),
                      false,
                      true
                    )
                  ]),
                  t.callExpression(
                    t.identifier('useTranslation'),
                    []
                  )
                )
              ]);
              
              body.unshift(hookCall);
            }
          }
        },
        
        ArrowFunctionExpression(path) {
          // Handle arrow function components
          if (t.isBlockStatement(path.node.body)) {
            const body = path.node.body.body;
            if (body && body.length > 0) {
              const hasHook = body.some(statement => {
                return t.isVariableDeclaration(statement) &&
                  statement.declarations.some(decl => 
                    t.isCallExpression(decl.init) &&
                    t.isIdentifier(decl.init.callee) &&
                    decl.init.callee.name === 'useTranslation'
                  );
              });
              
              if (!hasHook) {
                const hookCall = t.variableDeclaration('const', [
                  t.variableDeclarator(
                    t.objectPattern([
                      t.objectProperty(
                        t.identifier('t'),
                        t.identifier('t'),
                        false,
                        true
                      )
                    ]),
                    t.callExpression(
                      t.identifier('useTranslation'),
                      []
                    )
                  )
                ]);
                
                body.unshift(hookCall);
              }
            }
          }
        }
      });
    }

    if (hasTranslations) {
      const output = generate(ast, {}, content);
      fs.writeFileSync(filePath, output.code, 'utf-8');
      console.log(`✓ Processed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Recursively process all files in a directory
 */
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(file)) {
        processDirectory(filePath);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (['.tsx', '.jsx'].includes(ext)) {
        processFile(filePath);
      }
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🌍 Starting translation extraction...\n');
  
  // Process all files
  processDirectory(SRC_DIR);
  
  // Save extracted translations
  const outputDir = path.dirname(TRANSLATIONS_OUTPUT);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    TRANSLATIONS_OUTPUT,
    JSON.stringify(translations, null, 2),
    'utf-8'
  );
  
  console.log(`\n✓ Extracted ${Object.keys(translations).length} translation keys`);
  console.log(`✓ Saved to: ${TRANSLATIONS_OUTPUT}`);
  console.log('\n⚠️  Remember to:');
  console.log('   1. Review the extracted keys and texts');
  console.log('   2. Organize them into proper sections');
  console.log('   3. Translate them into other languages');
  console.log('   4. Test your components');
}

// Run the script
main();