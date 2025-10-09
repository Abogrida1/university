#!/usr/bin/env node

/**
 * فحص ما قبل النشر - Pre-deployment Check
 * يتحقق من أن المشروع جاهز للنشر على Vercel
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 فحص المشروع قبل النشر...\n');

const checks = [
  {
    name: 'package.json',
    check: () => fs.existsSync('package.json'),
    message: '✅ package.json موجود'
  },
  {
    name: 'next.config.js',
    check: () => fs.existsSync('next.config.js'),
    message: '✅ next.config.js موجود'
  },
  {
    name: 'vercel.json',
    check: () => fs.existsSync('vercel.json'),
    message: '✅ vercel.json موجود'
  },
  {
    name: 'src directory',
    check: () => fs.existsSync('src'),
    message: '✅ مجلد src موجود'
  },
  {
    name: 'Supabase config',
    check: () => fs.existsSync('src/lib/supabase.ts'),
    message: '✅ إعداد Supabase موجود'
  },
  {
    name: 'No .env files',
    check: () => {
      const envFiles = ['.env', '.env.local', '.env.production', '.env.development'];
      return !envFiles.some(file => fs.existsSync(file));
    },
    message: '✅ ملفات .env غير موجودة (آمن للنشر)'
  },
  {
    name: 'Git ignore',
    check: () => fs.existsSync('.gitignore'),
    message: '✅ .gitignore موجود'
  },
  {
    name: 'Main page exists',
    check: () => fs.existsSync('src/app/page.tsx'),
    message: '✅ الصفحة الرئيسية موجودة'
  },
  {
    name: 'Materials page exists',
    check: () => fs.existsSync('src/app/materials/[id]/page.tsx'),
    message: '✅ صفحة المواد موجودة'
  },
  {
    name: 'Supabase service exists',
    check: () => fs.existsSync('src/lib/supabaseServiceFixed.ts'),
    message: '✅ خدمة Supabase موجودة'
  },
  {
    name: 'No temporary files',
    check: () => {
      const tempFiles = ['p.id', 't.value', 'y.value', 'setStep(2)}', 'handleProgramSelect(program.id)}'];
      return !tempFiles.some(file => fs.existsSync(file));
    },
    message: '✅ لا توجد ملفات مؤقتة'
  }
];

let allPassed = true;

checks.forEach(check => {
  if (check.check()) {
    console.log(check.message);
  } else {
    console.log(`❌ ${check.name} مفقود أو غير صحيح`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 المشروع جاهز للنشر على Vercel!');
  console.log('\n📋 الخطوات التالية:');
  console.log('1. git add .');
  console.log('2. git commit -m "Ready for Vercel deployment"');
  console.log('3. git push origin main');
  console.log('4. اذهب لـ vercel.com واربط المشروع');
  console.log('5. أضف Environment Variables');
  console.log('6. اضغط Deploy');
} else {
  console.log('❌ المشروع غير جاهز للنشر. يرجى إصلاح المشاكل أعلاه.');
  process.exit(1);
}

console.log('\n📖 للمزيد من التفاصيل، راجع: VERCEL_DEPLOYMENT_GUIDE.md');
