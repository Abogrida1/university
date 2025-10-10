# جامعة بلانر - University Planner

منصة إدارة المواد الدراسية للجامعة مع دعم كامل للفيديوهات وملفات PDF.

## 🚀 النشر على Render

هذا المشروع جاهز للنشر على Render! اتبع دليل النشر:

📖 **[دليل النشر الكامل](RENDER_DEPLOYMENT_GUIDE.md)**

### النشر السريع:
1. ارفع المشروع على GitHub
2. اذهب لـ [render.com](https://render.com)
3. اضغط "New Web Service" واختر repository
4. أضف Environment Variables
5. اضغط "Create Web Service"

**النتيجة:** موقعك سيكون متاح على الإنترنت خلال دقائق! 🎉

## المميزات

- 🎓 **إدارة المواد**: إضافة وتعديل وحذف المواد الدراسية
- 📄 **ملفات PDF**: رفع وإدارة ملفات PDF للمواد
- 🎥 **فيديوهات يوتيوب**: دمج فيديوهات يوتيوب مع استخراج البيانات تلقائياً
- 👥 **إدارة المستخدمين**: نظام إدارة المستخدمين والأدوار
- 🎨 **تصميم عصري**: واجهة مستخدم حديثة ومتجاوبة
- 🌙 **ثيم داكن**: تصميم أنيق باللون الداكن
- 📱 **متجاوب**: يعمل على جميع الأجهزة

## التقنيات المستخدمة

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth

## الإعداد السريع

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد Supabase
1. اتبع الدليل في `SUPABASE_COMPLETE_SETUP.md`
2. أنشئ ملف `.env.local` كما هو موضح في `ENV_SETUP.md`

### 3. تشغيل التطبيق
```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## هيكل المشروع

```
university-planner/
├── src/
│   ├── app/                    # صفحات Next.js
│   │   ├── admin/             # صفحة الإدارة
│   │   ├── materials/         # صفحات المواد
│   │   └── page.tsx           # الصفحة الرئيسية
│   ├── components/            # مكونات React
│   └── lib/                   # مكتبات وخدمات
│       ├── supabase.ts        # إعداد Supabase
│       └── supabaseService.ts # خدمات قاعدة البيانات
├── database/                  # ملفات قاعدة البيانات
│   ├── schema.sql            # هيكل قاعدة البيانات
│   ├── policies.sql          # سياسات الأمان
│   └── seed.sql              # البيانات التجريبية
├── SUPABASE_COMPLETE_SETUP.md # دليل الإعداد الكامل
├── ENV_SETUP.md              # دليل إعداد متغيرات البيئة
└── README.md                 # هذا الملف
```

## الاستخدام

### الصفحة الرئيسية
- اختر البرنامج الدراسي (عام، أمن سيبراني، ذكاء اصطناعي)
- اختر السنة والترم
- تصفح المواد المتاحة

### صفحة الإدارة (`/admin`)
- **المواد**: إضافة وتعديل وحذف المواد
- **ملفات PDF**: رفع وإدارة ملفات PDF
- **الفيديوهات**: إضافة فيديوهات يوتيوب مع استخراج البيانات تلقائياً
- **المستخدمين**: إدارة المستخدمين

### صفحة المادة
- عرض تفاصيل المادة
- تحميل ملفات PDF
- مشاهدة الفيديوهات المدمجة

## ملفات قاعدة البيانات

### schema.sql
يحتوي على هيكل قاعدة البيانات والجداول:
- `materials`: المواد الدراسية
- `pdfs`: ملفات PDF
- `videos`: فيديوهات يوتيوب
- `users`: المستخدمين

### policies.sql
يحتوي على سياسات الأمان (RLS) للجداول و Storage.

### seed.sql
يحتوي على بيانات تجريبية للاختبار.

## التطوير

### إضافة مادة جديدة
```typescript
const newMaterial = {
  title: 'Material Title',
  titleAr: 'عنوان المادة',
  code: 'MAT101',
  department: 'General Program',
  departmentAr: 'البرنامج العام',
  year: 1,
  term: 'First Semester',
  termAr: 'الترم الأول',
  description: 'Material description'
};

await materialsService.add(newMaterial);
```

### رفع ملف PDF
```typescript
const pdfFile = // File object from input
const pdfData = {
  title: 'PDF Title',
  materialId: 'material-id',
  size: '2.5 MB'
};

await pdfsService.add(pdfData, pdfFile);
```

### إضافة فيديو يوتيوب
```typescript
const videoData = {
  title: 'Video Title',
  materialId: 'material-id',
  youtubeUrl: 'https://www.youtube.com/watch?v=VIDEO_ID',
  duration: '10:30',
  views: 1000
};

await videosService.add(videoData);
```

## النشر

### Vercel (مستحسن)
1. اربط المستودع بـ Vercel
2. أضف متغيرات البيئة في Vercel Dashboard
3. انشر التطبيق

### خيارات أخرى
- Netlify
- Railway
- DigitalOcean App Platform

## المساهمة

1. Fork المشروع
2. أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push إلى Branch (`git push origin feature/amazing-feature`)
5. افتح Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

إذا واجهت أي مشاكل:
1. راجع ملفات التوثيق
2. تحقق من إعداد Supabase
3. تأكد من صحة متغيرات البيئة
4. افتح issue في GitHub

## التحديثات المستقبلية

- [ ] نظام المصادقة الكامل
- [ ] إشعارات المستخدمين
- [ ] نظام التقييمات
- [ ] تطبيق الجوال
- [ ] تحليلات الاستخدام
- [ ] دعم اللغات المتعددة"# university" 
