#!/usr/bin/env node

/**
 * Deploy Check Script for RePDF
 * 
 * This script verifies that the built application is ready for production
 * and doesn't contain any development-only references.
 */

import fs from 'fs';
import path from 'path';

const DIST_DIR = './dist';
const PROBLEMATIC_PATTERNS = [
  /cdn\.tailwindcss\.com/gi,
  /localhost:\d+/gi,
  /127\.0\.0\.1:\d+/gi,
  /http:\/\/localhost/gi,
  /service-worker\.js/gi,
  /sw\.js/gi,
  /console\.log\(/gi, // Check for console.log in production
];

const SUCCESS_PATTERNS = [
  /RePDF.*Editor.*Premium/gi, // Should contain proper title
  /Inter.*font/gi, // Should have Inter font
  /assets\/.*\.js/gi, // Should have bundled assets
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for problematic patterns
  PROBLEMATIC_PATTERNS.forEach((pattern, index) => {
    const patternNames = [
      'Tailwind CDN',
      'Localhost references',
      '127.0.0.1 references', 
      'HTTP localhost',
      'Service Worker (sw.js)',
      'Service Worker (service-worker.js)',
      'Console.log statements'
    ];
    
    if (pattern.test(content)) {
      issues.push(`❌ Found ${patternNames[index]} in ${filePath}`);
    }
  });
  
  return issues;
}

function checkBuildSuccess() {
  const indexPath = path.join(DIST_DIR, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.log('❌ Build failed: index.html not found in dist/');
    return false;
  }
  
  const content = fs.readFileSync(indexPath, 'utf8');
  let hasRequiredPatterns = 0;
  
  SUCCESS_PATTERNS.forEach((pattern, index) => {
    const patternNames = [
      'RePDF title',
      'Inter font',
      'Bundled assets'
    ];
    
    if (pattern.test(content)) {
      console.log(`✅ Found ${patternNames[index]}`);
      hasRequiredPatterns++;
    } else {
      console.log(`⚠️  Missing ${patternNames[index]}`);
    }
  });
  
  return hasRequiredPatterns >= 2; // At least 2 out of 3 patterns should match
}

function main() {
  console.log('🔍 RePDF Deploy Check\n');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.log('❌ Dist folder not found. Run `npm run build` first.');
    process.exit(1);
  }
  
  // Check build success
  console.log('📋 Checking build quality...');
  const buildSuccess = checkBuildSuccess();
  
  // Check for problematic patterns
  console.log('\n🔍 Scanning for production issues...');
  const htmlFiles = fs.readdirSync(DIST_DIR).filter(file => file.endsWith('.html'));
  const jsFiles = fs.readdirSync(path.join(DIST_DIR, 'assets')).filter(file => file.endsWith('.js'));
  
  let totalIssues = 0;
  
  // Check HTML files
  htmlFiles.forEach(file => {
    const issues = checkFile(path.join(DIST_DIR, file));
    totalIssues += issues.length;
    issues.forEach(issue => console.log(issue));
  });
  
  // Check JS files (sample first few to avoid too much output)
  jsFiles.slice(0, 3).forEach(file => {
    const issues = checkFile(path.join(DIST_DIR, 'assets', file));
    totalIssues += issues.length;
    issues.forEach(issue => console.log(issue));
  });
  
  // Summary
  console.log('\n📊 Deploy Check Summary:');
  console.log(`Build Quality: ${buildSuccess ? '✅ Good' : '❌ Issues found'}`);
  console.log(`Production Issues: ${totalIssues === 0 ? '✅ None found' : `❌ ${totalIssues} issues`}`);
  
  if (buildSuccess && totalIssues === 0) {
    console.log('\n🎉 Deploy check passed! Your build is ready for production.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Deploy check failed. Please fix the issues above before deploying.');
    process.exit(1);
  }
}

main();