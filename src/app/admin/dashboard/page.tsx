'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { materialsService, pdfsService, videosService, usersService, Material, Pdf, Video, User } from '@/lib/supabaseServiceFixed';
import { schedulesService, Schedule } from '@/lib/schedulesService';
import { messagesService, Message } from '@/lib/messagesService';
import SendNotification from '@/components/SendNotification';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [superAdmin, setSuperAdmin] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Material | Pdf | Video | User | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingMaterial, setLoadingMaterial] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingVideoUpdate, setLoadingVideoUpdate] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Form data states
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    code: '',
    department: '',
    departmentAr: '',
    year: 1,
    term: 'First Semester',
    termAr: 'الترم الأول',
    bookLink: '',
    lecturesLink: '',
    googleDriveLink: '',
    additionalLinks: '',
    showGoogleDriveOnly: false,
    showMaterialsSection: true,
    showMaterialLinksSection: true,
    showPdfsSection: true,
    showVideosSection: true
  });

  // تعيين القيم الافتراضية للفورم بناءً على صلاحيات الأدمن
  useEffect(() => {
    console.log('🔄 useEffect triggered for form defaults:', {
      isAdmin: superAdmin?.role === 'admin',
      hasPermissions: !!userPermissions,
      hasScopes: userPermissions?.scopes?.length > 0,
      scopesCount: userPermissions?.scopes?.length || 0,
      superAdminRole: superAdmin?.role,
      userPermissions: userPermissions
    });
    
    if (superAdmin?.role === 'admin' && userPermissions?.scopes && userPermissions.scopes.length > 0) {
      console.log('✅ Condition met - setting form defaults');
      // إيجاد أول صلاحية نشطة ومحددة (ليست null)
      const specificScope = userPermissions.scopes.find((s: any) => 
        s.isActive && (s.department || s.year || s.term)
      ) || userPermissions.scopes[0];
      
      console.log('🔧 Setting form defaults from scope:', specificScope);
      console.log('🔧 All available scopes:', userPermissions.scopes);
      console.log('🔧 Admin role:', superAdmin?.role);
      console.log('🔧 User permissions loaded:', !!userPermissions);
      
      if (specificScope) {
        const defaultDept = specificScope.department;
        const defaultYear = specificScope.year;
        const defaultTerm = specificScope.term;
        const defaultTermAr = specificScope.term === 'FIRST' ? 'الترم الأول' : 
                             specificScope.term === 'SECOND' ? 'الترم الثاني' : '';
        const defaultDeptAr = defaultDept === 'Cyber Security' ? 'الأمن السيبراني' :
                             defaultDept === 'Artificial Intelligence' ? 'الذكاء الاصطناعي' :
                             defaultDept === 'General Program' ? 'البرنامج العام' : '';
        
        console.log('📝 Form defaults:', {
          department: defaultDept,
          year: defaultYear,
          term: defaultTerm,
          originalScope: {
            department: specificScope.department,
            year: specificScope.year,
            term: specificScope.term
          },
          hasValidValues: {
            department: !!defaultDept,
            year: !!defaultYear,
            term: !!defaultTerm
          }
        });
        
        setFormData(prev => ({
          ...prev,
          department: defaultDept,
          departmentAr: defaultDeptAr,
          year: defaultYear,
          term: defaultTerm,
          termAr: defaultTermAr
        }));

        setScheduleForm(prev => {
          const newForm = {
            ...prev,
            department: defaultDept,
            departmentAr: defaultDeptAr,
            year: defaultYear,
            term: defaultTerm,
            termAr: defaultTermAr,
            title: `جدول المحاضرات - ${defaultDeptAr} - السنة ${defaultYear} - ${defaultTermAr}`
          };
          console.log('📝 Setting schedule form:', newForm);
          return newForm;
        });
      }
    } else {
      console.log('❌ Condition NOT met - not setting form defaults:', {
        isAdmin: superAdmin?.role === 'admin',
        hasPermissions: !!userPermissions,
        hasScopes: userPermissions?.scopes?.length > 0
      });
    }
  }, [userPermissions, superAdmin]);
  
  const [pdfFormData, setPdfFormData] = useState({
    title: '',
    materialId: '',
    size: '',
    description: ''
  });

  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    department: '',
    departmentAr: '',
    year: undefined as number | undefined,
    term: undefined as 'FIRST' | 'SECOND' | undefined,
    termAr: '',
    size: '',
    fileName: ''
  });
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  const [videoFormData, setVideoFormData] = useState({
    title: '',
    materialId: '',
    duration: '',
    youtubeId: '',
    description: '',
    youtubeUrl: '',
    playlistUrl: '',
    playlistId: '',
    isPlaylist: false
  });

  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'طالب',
    status: 'نشط'
  });

  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // Removed courses; schedules are standalone and not tied to materials
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageStats, setMessageStats] = useState({
    total: 0,
    new: 0,
    read: 0,
    replied: 0,
    closed: 0,
    contact: 0,
    join: 0
  });

  // Notifications state
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showNotificationPasswordModal, setShowNotificationPasswordModal] = useState(false);
  const [notificationPassword, setNotificationPassword] = useState('');
  const [notificationPasswordError, setNotificationPasswordError] = useState('');
  const NOTIFICATION_PASSWORD = '2212'; // يمكن تغييره لاحقاً
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'update' as 'update' | 'announcement' | 'warning' | 'info',
    targetUserId: '' as string | null,
    scheduledDate: '' as string | null, // تاريخ الإرسال (date only)
    scheduledTime: '' as string | null, // وقت الإرسال (time only)
    expireDate: '' as string | null, // تاريخ الانتهاء (date only)
    expireTime: '' as string | null, // وقت الانتهاء (time only)
  });

  // Load sent notifications when notifications tab is active
  useEffect(() => {
    if (activeTab === 'notifications' && superAdmin?.role === 'super_admin') {
      loadSentNotifications();
    }
  }, [activeTab, superAdmin?.id]);

  const loadSentNotifications = async () => {
    if (!superAdmin?.id) return;
    try {
      const response = await fetch('/api/notifications?all=true', {
        headers: {
          'x-admin-id': superAdmin.id,
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSentNotifications(result.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading sent notifications:', error);
    }
  };

  const handleNotificationPasswordSubmit = () => {
    if (notificationPassword === NOTIFICATION_PASSWORD) {
      setShowNotificationPasswordModal(false);
      setNotificationPassword('');
      setNotificationPasswordError('');
      setNotificationForm({
        title: '',
        message: '',
        type: 'update',
        targetUserId: null,
        scheduledDate: null,
        scheduledTime: null,
        expireDate: null,
        expireTime: null,
      });
      setShowNotificationModal(true);
    } else {
      setNotificationPasswordError('الكلمة المرورية غير صحيحة');
    }
  };

  // Map departments EN -> AR for schedules title convenience
  const departmentMap: { [key: string]: string } = {
    'General Program': 'البرنامج العام',
    'Cyber Security': 'الأمن السيبراني',
    'Artificial Intelligence': 'الذكاء الاصطناعي',
    'Computer Science': 'علوم الحاسوب',
    'Information Technology': 'تكنولوجيا المعلومات',
    'Data Science': 'علوم البيانات'
  };

  // Check authentication and load permissions
  useEffect(() => {
    const checkAuth = async () => {
      const adminData = localStorage.getItem('superAdmin');
      if (!adminData) {
        router.push('/admin/login');
        return;
      }
      
      try {
        const admin = JSON.parse(adminData);
        // إذا لم يكن لديه role، افترض أنه super_admin (للتوافق مع البيانات القديمة)
        if (!admin.role) {
          admin.role = 'super_admin';
          localStorage.setItem('superAdmin', JSON.stringify(admin));
        }
        setSuperAdmin(admin);

        // تحميل صلاحيات الأدمن
        if (admin.role === 'admin' && admin.id) {
          try {
            console.log('🔐 Loading admin scopes for:', admin.id, admin.email);
            const { AdminService } = await import('@/lib/adminService');
            const scopes = await AdminService.getAdminScopes(admin.id);
            console.log('🔐 Loaded scopes:', scopes);
            console.log('🔐 Admin email:', admin.email);
            console.log('🔐 Admin ID:', admin.id);
            
            // تجميع الصلاحيات من جميع النطاقات
            const permissions = {
              canManageMaterials: scopes.some(s => s.canManageMaterials),
              canManagePdfs: scopes.some(s => s.canManagePdfs),
              canManageVideos: scopes.some(s => s.canManageVideos),
              canManageSchedules: scopes.some(s => s.canManageSchedules),
              canManageMessages: scopes.some(s => s.canManageMessages),
              canViewAnalytics: scopes.some(s => s.canViewAnalytics),
              canManageUsers: scopes.some(s => s.canManageUsers),
              canManageAdmins: scopes.some(s => s.canManageAdmins), // إضافة صلاحية إدارة الأدمنز
              scopes: scopes // حفظ النطاقات للتحقق التفصيلي
            };
            setUserPermissions(permissions);
            console.log('✅ Admin permissions loaded:', permissions);
            console.log('✅ Detailed permissions:', {
              canManageMaterials: permissions.canManageMaterials,
              canManagePdfs: permissions.canManagePdfs,
              canManageVideos: permissions.canManageVideos,
              canManageSchedules: permissions.canManageSchedules,
              canManageMessages: permissions.canManageMessages,
              canViewAnalytics: permissions.canViewAnalytics,
              canManageUsers: permissions.canManageUsers,
              canManageAdmins: permissions.canManageAdmins
            });
            console.log('✅ Admin scopes details:');
            scopes.forEach((scope: any, index: number) => {
              console.log(`   📋 Scope ${index + 1}:`, {
                department: scope.department,
                year: scope.year,
                term: scope.term,
                isActive: scope.isActive,
                permissions: {
                  materials: scope.canManageMaterials,
                  pdfs: scope.canManagePdfs,
                  videos: scope.canManageVideos,
                  schedules: scope.canManageSchedules
                }
              });
            });
            
            // ملخص واضح للصلاحيات
            console.log('');
            console.log('════════════════════════════════════════════');
            console.log('📊 ADMIN PERMISSIONS SUMMARY');
            console.log('════════════════════════════════════════════');
            console.log('👤 Admin:', admin.email);
            console.log('🔐 Role:', admin.role);
            console.log('📝 Total Scopes:', scopes.length);
            scopes.forEach((scope: any, index: number) => {
              console.log(`\n   🎯 Scope ${index + 1}:`);
              console.log(`      📍 Department: "${scope.department}"`);
              console.log(`      📅 Year: ${scope.year}`);
              console.log(`      📆 Term: "${scope.term}"`);
              console.log(`      ✅ Active: ${scope.isActive}`);
              console.log(`      🎓 Can Manage Materials: ${scope.canManageMaterials}`);
              console.log(`      📄 Can Manage PDFs: ${scope.canManagePdfs}`);
              console.log(`      🎥 Can Manage Videos: ${scope.canManageVideos}`);
              console.log(`      📚 Can Manage Schedules: ${scope.canManageSchedules}`);
            });
            console.log('════════════════════════════════════════════');
            console.log('');
          } catch (error) {
            console.error('خطأ في تحميل الصلاحيات:', error);
            setUserPermissions({
              canManageMaterials: false,
              canManagePdfs: false,
              canManageVideos: false,
              canManageSchedules: false,
              canManageMessages: false,
              canViewAnalytics: false,
              canManageUsers: false,
              canManageAdmins: false,
              scopes: []
            });
          }
        } else if (admin.role === 'super_admin') {
          // السوبر أدمن له جميع الصلاحيات
          setUserPermissions({
            canManageMaterials: true,
            canManagePdfs: true,
            canManageVideos: true,
            canManageSchedules: true,
            canManageMessages: true,
            canViewAnalytics: true,
            canManageUsers: true,
            canManageAdmins: true,
            scopes: []
          });
        }
      } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  // Load data from Firebase on component mount
  useEffect(() => {
    if (!superAdmin) return;
    
    const loadData = async () => {
      try {
        const [materialsData, pdfsData, videosData, usersData, schedulesData, messagesData, statsData] = await Promise.all([
          materialsService.getAll(),
          pdfsService.getAll(),
          videosService.getAll(),
          usersService.getAll(),
          schedulesService.getAll(),
          messagesService.getAll(),
          messagesService.getStats()
        ]);
        
        console.log('');
        console.log('════════════════════════════════════════════');
        console.log('📚 MATERIALS DATABASE SUMMARY');
        console.log('════════════════════════════════════════════');
        console.log('📦 Total Materials Loaded:', materialsData.length);
        
        if (materialsData.length > 0) {
          console.log('\n📋 Materials List:');
          materialsData.forEach((material: any, index: number) => {
            console.log(`   ${index + 1}. "${material.title}" (${material.code})`);
            console.log(`      📍 Department: "${material.department}"`);
            console.log(`      📅 Year: ${material.year}`);
            console.log(`      📆 Term: "${material.term}"`);
          });
        } else {
          console.log('⚠️  No materials found in database!');
        }
        console.log('════════════════════════════════════════════');
        console.log('');
        console.log('📦 All schedules loaded:', schedulesData.length, 'schedules');
        if (schedulesData.length > 0) {
          console.log('📦 Sample schedule:', schedulesData[0]);
          console.log('📦 Schedule structure:', {
            department: schedulesData[0].department,
            departmentType: typeof schedulesData[0].department,
            year: schedulesData[0].year,
            yearType: typeof schedulesData[0].year,
            term: schedulesData[0].term,
            termType: typeof schedulesData[0].term
          });
        }
        
        setMaterials(materialsData);
        setPdfs(pdfsData);
        setVideos(videosData);
        setUsers(usersData);
        setSchedules(schedulesData);
        setMessages(messagesData);
        setMessageStats(statsData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, [superAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('superAdmin');
    router.push('/admin/login');
  };

  // Helper function to show messages
  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // بناء التبويبات بناءً على الصلاحيات
  console.log('🔨 Building tabs with permissions:', userPermissions);
  console.log('🔨 User role:', superAdmin?.role);
  
  const tabs = [];
  
  // نظرة عامة - تُضاف كـ tab لو فيه صلاحيات تانية
  // لو مفيش صلاحيات تانية، هتظهر فوق مباشرة
  
  // التبويبات بناءً على الصلاحيات
  if (userPermissions?.canManageMessages || superAdmin?.role === 'super_admin') {
    console.log('✅ Adding messages tab - canManageMessages:', userPermissions?.canManageMessages);
    tabs.push({ id: 'messages', name: 'الرسائل والطلبات', icon: '💬' });
  }
  if (userPermissions?.canManageMaterials || superAdmin?.role === 'super_admin') {
    console.log('✅ Adding materials tab - canManageMaterials:', userPermissions?.canManageMaterials);
    tabs.push({ id: 'materials', name: 'إدارة المواد', icon: '📚' });
  }
  if (userPermissions?.canManageSchedules || superAdmin?.role === 'super_admin') {
    console.log('✅ Adding schedules tab - canManageSchedules:', userPermissions?.canManageSchedules);
    tabs.push({ id: 'schedules', name: 'جداول المحاضرات (PDF)', icon: '📅' });
  }
  if (userPermissions?.canManagePdfs || superAdmin?.role === 'super_admin') {
    console.log('✅ Adding pdfs tab - canManagePdfs:', userPermissions?.canManagePdfs);
    tabs.push({ id: 'pdfs', name: 'إدارة الـ Material', icon: '📄' });
  }
  if (userPermissions?.canManageVideos || superAdmin?.role === 'super_admin') {
    console.log('✅ Adding videos tab - canManageVideos:', userPermissions?.canManageVideos);
    tabs.push({ id: 'videos', name: 'إدارة الفيديوهات', icon: '🎥' });
  }
  if (userPermissions?.canManageUsers || superAdmin?.role === 'super_admin') {
    console.log('✅ Adding users tab - canManageUsers:', userPermissions?.canManageUsers);
    tabs.push({ id: 'users', name: 'إدارة المستخدمين', icon: '👥' });
  }
  
  console.log('🔨 Final tabs built:', tabs.map(t => t.name));

  // Super Admin specific tabs (أو الأدمن الذي لديه صلاحية إدارة الأدمنز)
  const superAdminTabs = (superAdmin?.role === 'super_admin' || userPermissions?.canManageAdmins)
    ? [
        { id: 'admins', name: 'إدارة الأدمنز والصلاحيات', icon: '👑' },
<<<<<<< HEAD
        { id: 'notifications', name: 'إرسال الإشعارات', icon: '🔔' }
=======
        ...(superAdmin?.role === 'super_admin' ? [{ id: 'notifications', name: 'إرسال إشعارات', icon: '📢' }] : [])
>>>>>>> ad2b2d5 (Update various files including notifications, admin dashboard, and UI components)
      ]
    : [];

  // إضافة "نظرة عامة" كـ tab فقط لو فيه tabs تانية
  // لو الأدمن عنده canViewAnalytics و فيه tabs تانية، نضيف overview كأول tab
  if ((userPermissions?.canViewAnalytics || superAdmin?.role === 'super_admin') && 
      (tabs.length > 0 || superAdminTabs.length > 0)) {
    tabs.unshift({ id: 'overview', name: 'نظرة عامة', icon: '📊' });
  }

  const allTabs = [...tabs, ...superAdminTabs];

  // تغيير الـ activeTab إذا لم يكن للأدمن صلاحية رؤية التبويب الحالي
  useEffect(() => {
    // انتظر حتى يتم تحميل المستخدم على الأقل
    if (!superAdmin) return;
    
    // للسوبر أدمن، كل شيء متاح
    if (superAdmin.role === 'super_admin') return;
    
    // للأدمن العادي، انتظر تحميل الصلاحيات
    if (!userPermissions) return;
    
    // تحقق إذا كان التبويب الحالي متاح للأدمن
    const isCurrentTabAvailable = allTabs.some(tab => tab.id === activeTab);
    
    if (!isCurrentTabAvailable && allTabs.length > 0) {
      // التبويب الحالي غير متاح، الانتقال لأول تبويب متاح
      const firstAvailableTab = allTabs[0];
      console.log('🔄 Current tab not available. Switching to:', firstAvailableTab.id);
      setActiveTab(firstAvailableTab.id);
    }
  }, [activeTab, userPermissions, superAdmin, allTabs.length]);

  // دالة للتحقق من صلاحية تعديل عنصر معين
  const canEditItem = (itemDepartment: string, itemYear: number, itemTerm: string) => {
    // السوبر أدمن يمكنه تعديل كل شيء
    if (superAdmin?.role === 'super_admin') {
      console.log('✅ Super admin - full access granted');
      return true;
    }
    
    // إذا لم تكن هناك صلاحيات محملة
    if (!userPermissions?.scopes || userPermissions.scopes.length === 0) {
      console.log('❌ No permissions/scopes loaded');
      return false;
    }
    
    // تحويل term إلى صيغة موحدة للمقارنة
    const normalizeTerm = (term: string | null | undefined): string => {
      if (!term) return '';
      const upperTerm = String(term).toUpperCase().trim();
      if (upperTerm === 'FIRST' || upperTerm.includes('FIRST') || upperTerm.includes('الأول')) return 'FIRST';
      if (upperTerm === 'SECOND' || upperTerm.includes('SECOND') || upperTerm.includes('الثاني')) return 'SECOND';
      return upperTerm;
    };
    
    // تحويل department إلى صيغة موحدة للمقارنة
    const normalizeDepartment = (dept: string | null | undefined): string => {
      if (!dept) return '';
      return String(dept).toLowerCase().trim().replace(/\s+/g, ' ');
    };
    
    // تحويل year إلى رقم
    const normalizeYear = (year: any): number => {
      if (year === null || year === undefined) return 0;
      return parseInt(String(year), 10) || 0;
    };
    
    const normalizedItemDepartment = normalizeDepartment(itemDepartment);
    const normalizedItemYear = normalizeYear(itemYear);
    const normalizedItemTerm = normalizeTerm(itemTerm);
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('🔍 Checking permission for item:');
    console.log('   📍 Department:', itemDepartment, '→', normalizedItemDepartment);
    console.log('   📅 Year:', itemYear, '→', normalizedItemYear);
    console.log('   📆 Term:', itemTerm, '→', normalizedItemTerm);
    console.log('   🔐 Available scopes:', userPermissions.scopes.length);
    
    // التحقق من وجود صلاحية مطابقة
    const hasPermission = userPermissions.scopes.some((scope: any) => {
      if (!scope.isActive) {
        console.log('⏭️ Skipping inactive scope');
        return false;
      }
      
      const normalizedScopeDepartment = normalizeDepartment(scope.department);
      const normalizedScopeYear = normalizeYear(scope.year);
      const normalizedScopeTerm = normalizeTerm(scope.term);
      
      // التحقق من المطابقة
      // إذا كان scope فارغ (null أو empty)، يعتبر "كل شيء" = match
      const departmentMatch = !scope.department || scope.department === '' 
        ? true  // جميع الأقسام
        : normalizedScopeDepartment === normalizedItemDepartment;
      
      const yearMatch = !scope.year || scope.year === 0 || scope.year === null
        ? true  // جميع السنوات
        : normalizedScopeYear === normalizedItemYear;
      
      const termMatch = !scope.term || scope.term === ''
        ? true  // جميع الترمات
        : normalizedScopeTerm === normalizedItemTerm;
      
      const matches = departmentMatch && yearMatch && termMatch;
      
      console.log('🧪 Testing scope:');
      console.log('   📍 Scope Dept:', `"${scope.department}"`, '→', `"${normalizedScopeDepartment}"`);
      console.log('   📍 Item Dept:', `"${itemDepartment}"`, '→', `"${normalizedItemDepartment}"`);
      console.log('   ✓ Dept Match:', departmentMatch);
      console.log('');
      console.log('   📅 Scope Year:', scope.year, '→', normalizedScopeYear);
      console.log('   📅 Item Year:', itemYear, '→', normalizedItemYear);
      console.log('   ✓ Year Match:', yearMatch);
      console.log('');
      console.log('   📆 Scope Term:', `"${scope.term}"`, '→', `"${normalizedScopeTerm}"`);
      console.log('   📆 Item Term:', `"${itemTerm}"`, '→', `"${normalizedItemTerm}"`);
      console.log('   ✓ Term Match:', termMatch);
      console.log('');
      console.log('   🎯 FINAL RESULT:', matches ? '✅ MATCH' : '❌ NO MATCH');
      
      return matches;
    });
    
    console.log('');
    console.log(hasPermission ? '✅✅✅ ACCESS GRANTED ✅✅✅' : '❌❌❌ ACCESS DENIED ❌❌❌');
    console.log('═══════════════════════════════════════');
    
    return hasPermission;
  };

  // Material functions (same as original)
  const handleAddMaterial = async () => {
    try {
      setLoadingMaterial(true);
      console.log('🔄 Adding material:', formData);
      
      const newMaterial = await materialsService.add({...formData, description: ''});
      console.log('✅ Material added successfully:', newMaterial);
      
      const updatedMaterials = await materialsService.getAll();
      setMaterials(updatedMaterials);
      
      setShowAddModal(false);
      resetForm();
      showMessage('تم إضافة المادة بنجاح!');
      
      // إشارة لتحديث البيانات في جميع الصفحات
      localStorage.setItem('materialsUpdated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: 'materials' }));
    } catch (error) {
      console.error('❌ Error adding material:', error);
      showMessage(`حدث خطأ في إضافة المادة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, true);
    } finally {
      setLoadingMaterial(false);
    }
  };

  const handleEditMaterial = (material: any) => {
    setFormData(material);
    setEditingItem(material);
    setShowAddModal(true);
  };

  const handleUpdateMaterial = async () => {
    if (!editingItem) return;
    setLoadingMaterial(true);
    try {
      console.log('🔄 Updating material...');
      await materialsService.update((editingItem as Material).id, {...formData, description: ''});
      
      console.log('✅ Material updated successfully, refreshing list...');
      const updatedMaterials = await materialsService.getAll();
      setMaterials(updatedMaterials);
      
      setShowAddModal(false);
      setEditingItem(null);
      resetForm();
      showMessage('تم تحديث المادة بنجاح!');
      
      // إشارة لتحديث البيانات في جميع الصفحات
      localStorage.setItem('materialsUpdated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: 'materials' }));
    } catch (error) {
      console.error('❌ Error updating material:', error);
      showMessage(`حدث خطأ في تحديث المادة: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, true);
    } finally {
      setLoadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه المادة؟')) {
      try {
        await materialsService.delete(id);
        const updatedMaterials = await materialsService.getAll();
        setMaterials(updatedMaterials);
        showMessage('تم حذف المادة بنجاح!');
        
        // إشارة لتحديث البيانات في جميع الصفحات
        localStorage.setItem('materialsUpdated', Date.now().toString());
        window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: 'materials' }));
      } catch (error) {
        console.error('Error deleting material:', error);
        showMessage('حدث خطأ في حذف المادة', true);
      }
    }
  };

  // PDF functions (same as original)
  const handleAddPdf = async () => {
    setLoadingPdf(true);
    try {
      console.log('🔄 Adding PDF...');
      
      const material = materials.find(m => m.id === pdfFormData.materialId);
      const newPdf = {
        title: pdfFormData.title,
        material: material?.title || '',
        material_ar: material?.titleAr || '',
        size: pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : pdfFormData.size,
        uploads: 0,
        material_id: pdfFormData.materialId,
        file_url: '',
        file_name: pdfFile?.name || ''
      };
      
      console.log('📝 New PDF data:', newPdf);
      await pdfsService.add(newPdf, pdfFile || undefined);
      
      console.log('✅ PDF added successfully, refreshing list...');
      const updatedPdfs = await pdfsService.getAll();
      setPdfs(updatedPdfs);
      
      setShowPdfModal(false);
      setEditingItem(null);
      resetPdfForm();
      showMessage('تم إضافة ملف PDF بنجاح!');
      
      // إشارة لتحديث البيانات في جميع الصفحات
      localStorage.setItem('pdfsUpdated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: 'pdfs' }));
    } catch (error) {
      console.error('❌ Error adding PDF:', error);
      showMessage(`حدث خطأ في إضافة ملف PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, true);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleEditPdf = (pdf: any) => {
    setPdfFormData({
      title: pdf.title,
      materialId: pdf.material_id,
      size: pdf.size,
      description: pdf.description || ''
    });
    setPdfFile(null);
    setEditingItem(pdf);
    setShowPdfModal(true);
  };

  const handleUpdatePdf = async () => {
    if (!editingItem) return;
    setLoadingPdf(true);
    try {
      console.log('🔄 Updating PDF...');
      
      const material = materials.find(m => m.id === pdfFormData.materialId);
      const updates = {
        title: pdfFormData.title,
        material: material?.title || '',
        material_ar: material?.titleAr || '',
        size: pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : pdfFormData.size,
        material_id: pdfFormData.materialId,
        file_name: pdfFile?.name || (editingItem as Pdf)?.file_name || ''
      };
      
      console.log('📝 PDF updates:', updates);
      await pdfsService.update((editingItem as Pdf).id, updates, pdfFile || undefined);
      
      console.log('✅ PDF updated successfully, refreshing list...');
      const updatedPdfs = await pdfsService.getAll();
      setPdfs(updatedPdfs);
      
      setShowPdfModal(false);
      setEditingItem(null);
      resetPdfForm();
      showMessage('تم تحديث ملف PDF بنجاح!');
    } catch (error) {
      console.error('❌ Error updating PDF:', error);
      showMessage(`حدث خطأ في تحديث ملف PDF: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, true);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDeletePdf = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
      try {
        await pdfsService.delete(id);
        const updatedPdfs = await pdfsService.getAll();
        setPdfs(updatedPdfs);
        showMessage('تم حذف ملف PDF بنجاح!');
      } catch (error) {
        console.error('Error deleting PDF:', error);
        showMessage('حدث خطأ في حذف ملف PDF', true);
      }
    }
  };

  // Video functions (same as original)
  const handleAddVideo = async () => {
    try {
      const material = materials.find(m => m.id === videoFormData.materialId);
      
      let realViews = Math.floor(Math.random() * 10000) + 100;
      if (videoFormData.youtubeId) {
        try {
          const videoData = await fetchYouTubeData(videoFormData.youtubeId);
          realViews = videoData.views;
        } catch (error) {
          console.log('Using fallback views');
        }
      }
      
      const newVideo = {
        title: videoFormData.title,
        material: material?.title || '',
        material_ar: material?.titleAr || '',
        duration: videoFormData.duration,
        views: realViews,
        youtube_id: videoFormData.youtubeId,
        material_id: videoFormData.materialId,
        youtube_url: videoFormData.youtubeUrl,
        playlist_url: videoFormData.playlistUrl,
        playlist_id: videoFormData.playlistId,
        is_playlist: videoFormData.isPlaylist
      };
      
      console.log('🎥 Adding new video with playlist data:', {
        title: newVideo.title,
        is_playlist: newVideo.is_playlist,
        playlist_id: newVideo.playlist_id,
        playlist_url: newVideo.playlist_url,
        youtube_id: newVideo.youtube_id
      });
      
      await videosService.add(newVideo);
      const updatedVideos = await videosService.getAll();
      setVideos(updatedVideos);
      setShowVideoModal(false);
      resetVideoForm();
      showMessage('تم إضافة الفيديو بنجاح!');
      
      // إشارة لتحديث البيانات في جميع الصفحات
      localStorage.setItem('videosUpdated', Date.now().toString());
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('dataUpdated', { detail: 'videos' }));
    } catch (error) {
      console.error('Error adding video:', error);
      showMessage('حدث خطأ في إضافة الفيديو', true);
    }
  };

  const handleEditVideo = (video: any) => {
    setVideoFormData({
      title: video.title,
      materialId: video.material_id,
      duration: video.duration,
      youtubeId: video.youtube_id,
      description: video.description || '',
      youtubeUrl: video.youtube_url || `https://www.youtube.com/watch?v=${video.youtube_id}`,
      playlistUrl: video.playlist_url || '',
      playlistId: video.playlist_id || '',
      isPlaylist: video.is_playlist || false
    });
    setEditingItem(video);
    setShowVideoModal(true);
  };

  const handleUpdateVideo = async () => {
    if (!editingItem) return;
    setLoadingVideoUpdate(true);
    try {
      console.log('🔄 Updating video...');
      const material = materials.find(m => m.id === videoFormData.materialId);
      
      let realViews = Math.floor(Math.random() * 10000) + 100;
      if (videoFormData.youtubeId) {
        try {
          const videoData = await fetchYouTubeData(videoFormData.youtubeId);
          realViews = videoData.views;
        } catch (error) {
          console.log('Using fallback views');
        }
      }
      
      const updates = {
        title: videoFormData.title,
        material: material?.title || '',
        material_ar: material?.titleAr || '',
        duration: videoFormData.duration,
        views: realViews,
        youtube_id: videoFormData.youtubeId,
        material_id: videoFormData.materialId,
        youtube_url: videoFormData.youtubeUrl,
        playlist_url: videoFormData.playlistUrl,
        playlist_id: videoFormData.playlistId,
        is_playlist: videoFormData.isPlaylist
      };
      
      console.log('📝 Video updates with playlist data:', {
        title: updates.title,
        is_playlist: updates.is_playlist,
        playlist_id: updates.playlist_id,
        playlist_url: updates.playlist_url,
        youtube_id: updates.youtube_id
      });
      await videosService.update((editingItem as Video).id, updates);
      
      console.log('✅ Video updated successfully, refreshing list...');
      const updatedVideos = await videosService.getAll();
      setVideos(updatedVideos);
      
      setShowVideoModal(false);
      setEditingItem(null);
      resetVideoForm();
      showMessage('تم تحديث الفيديو بنجاح!');
    } catch (error) {
      console.error('❌ Error updating video:', error);
      showMessage(`حدث خطأ في تحديث الفيديو: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`, true);
    } finally {
      setLoadingVideoUpdate(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
      try {
        await videosService.delete(id);
        const updatedVideos = await videosService.getAll();
        setVideos(updatedVideos);
        showMessage('تم حذف الفيديو بنجاح!');
      } catch (error) {
        console.error('Error deleting video:', error);
        showMessage('حدث خطأ في حذف الفيديو', true);
      }
    }
  };

  // User functions
  const handleAddUser = async () => {
    try {
      const newUser = {
        name: userFormData.name,
        email: userFormData.email,
        password: userFormData.password,
        role: userFormData.role,
        status: userFormData.status
      };
      
      await usersService.add(newUser);
      const updatedUsers = await usersService.getAll();
      setUsers(updatedUsers);
      setShowUserModal(false);
      resetUserForm();
      showMessage('تم إضافة المستخدم بنجاح!');
    } catch (error) {
      console.error('Error adding user:', error);
      showMessage('حدث خطأ في إضافة المستخدم', true);
    }
  };

  const handleEditUser = (user: any) => {
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
    setEditingItem(user);
    setShowUserModal(true);
  };

  const handleUpdateUser = async () => {
    if (!editingItem) return;
    try {
      const updates = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        status: userFormData.status
      };
      
      // Only update password if provided
      if (userFormData.password) {
        (updates as any).password = userFormData.password;
      }
      
      await usersService.update((editingItem as User).id, updates);
      const updatedUsers = await usersService.getAll();
      setUsers(updatedUsers);
      setShowUserModal(false);
      setEditingItem(null);
      resetUserForm();
      showMessage('تم تحديث المستخدم بنجاح!');
    } catch (error) {
      console.error('Error updating user:', error);
      showMessage('حدث خطأ في تحديث المستخدم', true);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        await usersService.delete(id);
        const updatedUsers = await usersService.getAll();
        setUsers(updatedUsers);
        showMessage('تم حذف المستخدم بنجاح!');
      } catch (error) {
        console.error('Error deleting user:', error);
        showMessage('حدث خطأ في حذف المستخدم', true);
      }
    }
  };

  // Reset functions
  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      code: '',
      department: '',
      departmentAr: '',
      year: 1,
      term: 'First Semester',
      termAr: 'الترم الأول',
      bookLink: '',
      lecturesLink: '',
      googleDriveLink: '',
      additionalLinks: '',
      showGoogleDriveOnly: false,
      showMaterialsSection: true,
      showMaterialLinksSection: true,
      showPdfsSection: true,
      showVideosSection: true
    });
  };

  const resetPdfForm = () => {
    setPdfFormData({
      title: '',
      materialId: '',
      size: '',
      description: ''
    });
    setPdfFile(null);
  };

  const resetVideoForm = () => {
    setVideoFormData({
      title: '',
      materialId: '',
      duration: '',
      youtubeId: '',
      description: '',
      youtubeUrl: '',
      playlistUrl: '',
      playlistId: '',
      isPlaylist: false
    });
  };

  const resetUserForm = () => {
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role: 'طالب',
      status: 'نشط'
    });
  };

  // YouTube functions (same as original)
  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Extract YouTube playlist ID from URL
  const extractPlaylistId = (url: string): string | null => {
    const regex = /[?&]list=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Handle playlist URL change
  const handlePlaylistUrlChange = async (url: string) => {
    setVideoFormData({...videoFormData, playlistUrl: url});
    
    const playlistId = extractPlaylistId(url);
    if (playlistId) {
      setVideoFormData(prev => ({...prev, playlistId: playlistId}));
      setVideoFormData(prev => ({
        ...prev,
        title: 'جاري تحميل بيانات Playlist...',
        duration: 'Playlist',
        isPlaylist: true
      }));
      
      // Fetch playlist data
      try {
        setLoadingVideo(true);
        const playlistData = await fetchPlaylistData(playlistId);
        setVideoFormData(prev => ({
          ...prev,
          title: playlistData.title || 'YouTube Playlist',
          duration: 'Playlist'
        }));
      } catch (error) {
        console.log('Error fetching playlist data:', error);
        setVideoFormData(prev => ({
          ...prev,
          title: 'YouTube Playlist',
          duration: 'Playlist'
        }));
      } finally {
        setLoadingVideo(false);
      }
    } else {
      setVideoFormData(prev => ({
        ...prev,
        playlistId: '',
        isPlaylist: false
      }));
    }
  };

  // Fetch playlist data from YouTube
  const fetchPlaylistData = async (playlistId: string) => {
    try {
      const oembedResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/oembed?url=https://www.youtube.com/playlist?list=${playlistId}&format=json`)}`);
      const oembedData = await oembedResponse.json();
      
      if (oembedData.contents) {
        const data = JSON.parse(oembedData.contents);
        return {
          title: data.title || 'YouTube Playlist',
          thumbnail: data.thumbnail_url
        };
      }
      return { title: 'YouTube Playlist' };
    } catch (error) {
      console.error('Error fetching playlist data:', error);
      return { title: 'YouTube Playlist' };
    }
  };

  const fetchYouTubeData = async (videoId: string) => {
    try {
      const oembedResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)}`);
      const oembedData = await oembedResponse.json();
      const videoData = JSON.parse(oembedData.contents);
      
      try {
        const internalResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`);
        const internalData = await internalResponse.json();
        const htmlContent = internalData.contents;
        
        const videoDataMatch = htmlContent.match(/"videoDetails":({.+?})/);
        if (videoDataMatch) {
          const videoDetails = JSON.parse(videoDataMatch[1]);
          const duration = formatDuration(parseInt(videoDetails.lengthSeconds));
          const views = parseInt(videoDetails.viewCount) || Math.floor(Math.random() * 100000) + 1000;
          
          return {
            title: videoDetails.title || videoData.title,
            duration: duration,
            views: views,
            thumbnail: videoData.thumbnail_url
          };
        }
        
        const durationMatch = htmlContent.match(/"lengthSeconds":"(\d+)"/);
        const duration = durationMatch ? formatDuration(parseInt(durationMatch[1])) : '00:00';
        
        const viewsMatch = htmlContent.match(/"viewCount":"(\d+)"/);
        const views = viewsMatch ? parseInt(viewsMatch[1]) : Math.floor(Math.random() * 100000) + 1000;
        
        return {
          title: videoData.title,
          duration: duration,
          views: views,
          thumbnail: videoData.thumbnail_url
        };
      } catch (statsError) {
        return {
          title: videoData.title,
          duration: '00:00',
          views: Math.floor(Math.random() * 100000) + 1000,
          thumbnail: videoData.thumbnail_url
        };
      }
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
      return {
        title: 'فيديو يوتيوب',
        duration: '00:00',
        views: Math.floor(Math.random() * 1000) + 100,
        thumbnail: ''
      };
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleYouTubeUrlChange = async (url: string) => {
    setVideoFormData({...videoFormData, youtubeUrl: url});
    
    const videoId = extractYouTubeId(url);
    if (videoId) {
      setLoadingVideo(true);
      setVideoFormData(prev => ({...prev, youtubeId: videoId}));
      
      setVideoFormData(prev => ({
        ...prev,
        title: 'جاري تحميل بيانات الفيديو...',
        duration: 'جاري التحميل...'
      }));
      
      try {
        const videoData = await fetchYouTubeData(videoId);
        setVideoFormData(prev => ({
          ...prev,
          title: videoData.title,
          duration: videoData.duration,
          youtubeId: videoId
        }));
      } catch (error) {
        console.error('Error loading video data:', error);
        setVideoFormData(prev => ({
          ...prev,
          title: 'خطأ في تحميل بيانات الفيديو',
          duration: '00:00'
        }));
      } finally {
        setLoadingVideo(false);
      }
    }
  };

  if (!superAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FAFAD2'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-white">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }
  
  // للأدمن العادي، انتظر تحميل الصلاحيات قبل عرض الصفحة
  if (superAdmin.role === 'admin' && !userPermissions) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-yellow-300">جاري تحميل الصلاحيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Golden Light Effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-transparent to-yellow-500/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 relative z-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl mb-3 shadow-2xl shadow-yellow-500/25">
            <span className="text-2xl">⚙️</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 drop-shadow-2xl">
            لوحة تحكم Super Admin
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-2">
            مرحباً {superAdmin.name} - إدارة شاملة لمنصة المواد الدراسية
          </p>
          <div className="flex justify-center gap-3 relative z-30">
            <button
              onClick={handleLogout}
              className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl hover:bg-red-500/30 hover:border-red-500/50 transition-all duration-200 font-bold cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚪 تسجيل الخروج
            </button>
            <Link
              href="/"
              className="inline-block bg-gray-500/20 border border-gray-500/30 text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-500/30 hover:border-gray-400/50 transition-all duration-200 font-bold cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🏠 العودة للموقع
            </Link>
          </div>
          {successMessage && (
            <div className="mt-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-4 py-2 rounded-xl max-w-md mx-auto">
              {successMessage}
            </div>
          )}
        </div>

        {/* Tabs - Only show if there are management tabs */}
        {allTabs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {allTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/30'
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600/50'
                }`}
              >
                <span className="text-2xl">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        )}

        {/* Overview Section - Only visible when no other tabs OR active */}
        {(userPermissions?.canViewAnalytics || superAdmin?.role === 'super_admin') && 
         (allTabs.length === 0 || activeTab === 'overview') && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-6 shadow-2xl border border-gray-700/50 mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 sm:mb-6">📊 نظرة عامة على النظام</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">إجمالي المواد</p>
                    <p className="text-white text-3xl font-bold">
                      {(() => {
                        const filtered = materials.filter(m => canEditItem(m.department, m.year, m.term));
                        console.log('📊 Overview - Total materials:', materials.length);
                        console.log('📊 Overview - Filtered materials:', filtered.length);
                        console.log('📊 Overview - User permissions:', userPermissions);
                        return filtered.length;
                      })()}
                    </p>
                  </div>
                  <span className="text-4xl">📚</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500/20 to-red-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">ملفات PDF</p>
                    <p className="text-white text-3xl font-bold">
                      {pdfs.filter(pdf => {
                        const pdfAny = pdf as any;
                        const material = materials.find(m => m.id === pdfAny.materialId || m.id === pdfAny.material_id);
                        return material && canEditItem(material.department, material.year, material.term);
                      }).length}
                    </p>
                  </div>
                  <span className="text-4xl">📄</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">الفيديوهات</p>
                    <p className="text-white text-3xl font-bold">
                      {videos.filter(video => {
                        const videoAny = video as any;
                        const material = materials.find(m => m.id === videoAny.materialId || m.id === videoAny.material_id);
                        return material && canEditItem(material.department, material.year, material.term);
                      }).length}
                    </p>
                  </div>
                  <span className="text-4xl">🎥</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">المستخدمين</p>
                    <p className="text-white text-3xl font-bold">{users.length}</p>
                  </div>
                  <span className="text-4xl">👥</span>
                </div>
              </div>
            </div>

            {/* Messages Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">إجمالي الرسائل</p>
                    <p className="text-white text-3xl font-bold">{messageStats.total}</p>
                  </div>
                  <span className="text-4xl">💬</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">رسائل جديدة</p>
                    <p className="text-white text-3xl font-bold">{messageStats.new}</p>
                  </div>
                  <span className="text-4xl">🆕</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">طلبات انضمام</p>
                    <p className="text-white text-3xl font-bold">{messageStats.join}</p>
                  </div>
                  <span className="text-4xl">👋</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-300 text-sm">رسائل تواصل</p>
                    <p className="text-white text-3xl font-bold">{messageStats.contact}</p>
                  </div>
                  <span className="text-4xl">📧</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">أحدث المواد</h3>
                <div className="space-y-3">
                  {materials
                    .filter(m => canEditItem(m.department, m.year, m.term))
                    .slice(0, 5)
                    .map(material => (
                      <div key={material.id} className="bg-gray-700/30 rounded-xl p-4">
                        <h4 className="text-white font-medium">{material.title}</h4>
                        <p className="text-gray-400 text-sm">{material.code} - {material.department}</p>
                      </div>
                    ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-4">أحدث المستخدمين</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map(user => (
                    <div key={user.id} className="bg-gray-700/30 rounded-xl p-4">
                      <h4 className="text-white font-medium">{user.name}</h4>
                      <p className="text-gray-400 text-sm">{user.email} - {user.role}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Upload/Edit Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}>
            <div
              className="bg-gray-900 rounded-3xl w-full max-w-3xl border border-gray-700/50 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 sticky top-0 bg-gray-900/95 backdrop-blur-sm rounded-t-3xl border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-2xl font-black text-white">
                  {editingSchedule ? 'تحديث جدول (PDF)' : 'رفع جدول (PDF)'}
                </h3>
                <button onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mx-6 mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mx-6 mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ❌ {errorMessage}
                </div>
              )}

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 mb-2">عنوان الجدول</label>
                  <input value={scheduleForm.title} readOnly className="w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 opacity-90" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    القسم (EN) <span className="text-red-400">*</span>
                    {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department) && (
                      <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {scheduleForm.department}</span>
                    )}
                  </label>
                  <select
                    value={scheduleForm.department}
                    disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department)}
                    onChange={(e) => {
                      const dept = e.target.value;
                      const deptAr = departmentMap[dept] || dept;
                      setScheduleForm({
                        ...scheduleForm,
                        department: dept,
                        departmentAr: deptAr,
                        title: `جدول المحاضرات - ${deptAr} - السنة ${scheduleForm.year || ''} - ${scheduleForm.term === 'FIRST' ? 'الترم الأول' : scheduleForm.term === 'SECOND' ? 'الترم الثاني' : ''}`
                      });
                    }}
                    className={`w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 focus:border-cyan-500 focus:outline-none ${
                      superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    required
                  >
                    <option value="">اختر القسم</option>
                    {Array.from(new Set(materials.map((m) => m.department))).map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {!scheduleForm.department && (
                    <div className="mt-2 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-xs">⚠️ يجب اختيار القسم</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">القسم (AR)</label>
                  <input value={scheduleForm.departmentAr} readOnly className="w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 opacity-90" />
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    السنة <span className="text-red-400">*</span>
                    {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.year) && (
                      <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {scheduleForm.year}</span>
                    )}
                  </label>
                  <select 
                    value={scheduleForm.year || ''} 
                    disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.year)}
                    onChange={(e) => {
                    const y = Number(e.target.value);
                    setScheduleForm({ ...scheduleForm, year: y, title: `جدول المحاضرات - ${scheduleForm.departmentAr} - السنة ${y} - ${scheduleForm.term === 'FIRST' ? 'الترم الأول' : scheduleForm.term === 'SECOND' ? 'الترم الثاني' : ''}` });
                    }} 
                    className={`w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 focus:border-cyan-500 focus:outline-none ${
                      superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.year) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    required
                  >
                    <option value="">اختر السنة</option>
                    <option value={1}>السنة الأولى</option>
                    <option value={2}>السنة الثانية</option>
                    <option value={3}>السنة الثالثة</option>
                    <option value={4}>السنة الرابعة</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">
                    الترم <span className="text-red-400">*</span>
                    {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term) && (
                      <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {scheduleForm.termAr}</span>
                    )}
                  </label>
                  <select 
                    value={scheduleForm.term || ''} 
                    disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term)}
                    onChange={(e) => {
                    const t = e.target.value as 'FIRST' | 'SECOND';
                    const termAr = t === 'FIRST' ? 'الترم الأول' : 'الترم الثاني';
                    setScheduleForm({ ...scheduleForm, term: t, termAr, title: `جدول المحاضرات - ${scheduleForm.departmentAr} - السنة ${scheduleForm.year || ''} - ${termAr}` });
                    }} 
                    className={`w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 focus:border-cyan-500 focus:outline-none ${
                      superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    required
                  >
                    <option value="">اختر الترم</option>
                    <option value="FIRST">الترم الأول</option>
                    <option value="SECOND">الترم الثاني</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 mb-2">الحجم</label>
                  <input value={scheduleForm.size} readOnly className="w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 opacity-90" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-300 mb-2">
                    رفع ملف PDF <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setScheduleFile(f);
                      if (f) {
                        // التحقق من نوع الملف
                        if (f.type !== 'application/pdf') {
                          showMessage('يجب اختيار ملف PDF فقط', true);
                          return;
                        }
                        
                        // التحقق من حجم الملف (حد أقصى 5MB للـ Base64)
                        if (f.size > 5 * 1024 * 1024) {
                          showMessage('حجم الملف يجب أن يكون أقل من 5MB للرفع الآمن', true);
                          return;
                        }
                        
                        // تحذير للملفات الكبيرة
                        if (f.size > 2 * 1024 * 1024) {
                          showMessage('ملف كبير - قد يستغرق الرفع وقت أطول', true);
                        }
                        
                        setScheduleForm({
                          ...scheduleForm,
                          size: `${(f.size / (1024 * 1024)).toFixed(2)} MB`,
                          fileName: f.name
                        });
                      }
                    }}
                    className="w-full bg-gray-800 text-white rounded-xl p-3 border border-gray-700 focus:border-cyan-500 focus:outline-none"
                    required
                  />
                  {scheduleFile ? (
                    <div className={`mt-2 p-3 rounded-lg border ${
                      scheduleFile.size > 2 * 1024 * 1024 
                        ? 'bg-orange-500/20 border-yellow-500/30' 
                        : 'bg-yellow-500/20 border-yellow-500/30'
                    }`}>
                      <p className={`text-sm ${
                        scheduleFile.size > 2 * 1024 * 1024 
                          ? 'text-yellow-300' 
                          : 'text-yellow-300'
                      }`}>
                        {scheduleFile.size > 2 * 1024 * 1024 ? '⚠️' : '✅'} 
                        الملف المحدد: {scheduleFile.name} ({scheduleForm.size})
                        {scheduleFile.size > 2 * 1024 * 1024 && (
                          <span className="block text-xs mt-1">
                            ملف كبير - قد يستغرق الرفع وقت أطول
                          </span>
                        )}
                      </p>
                </div>
                  ) : (
                    <div className="mt-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ يجب اختيار ملف PDF (حد أقصى 5MB للرفع الآمن)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 sticky bottom-0 bg-gray-900/95 backdrop-blur-sm rounded-b-3xl border-t border-gray-800">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    disabled={loadingSchedule || !scheduleForm.department || !scheduleFile || !scheduleForm.year || !scheduleForm.term}
                    onClick={async () => {
                      try {
                        setLoadingSchedule(true);
                        console.log('🔄 Saving schedule...', { 
                          scheduleForm: {
                            ...scheduleForm,
                            // Don't log the entire form to avoid console spam
                            title: scheduleForm.title,
                            department: scheduleForm.department,
                            year: scheduleForm.year,
                            term: scheduleForm.term
                          }, 
                          scheduleFile: scheduleFile ? {
                            name: scheduleFile.name,
                            size: scheduleFile.size,
                            type: scheduleFile.type
                          } : null
                        });
                        
                        if (editingSchedule) {
                          console.log('📝 Updating existing schedule...', {
                            editingId: editingSchedule.id,
                            currentValues: {
                              department: editingSchedule.department,
                              year: editingSchedule.year,
                              term: editingSchedule.term
                            },
                            newValues: {
                              department: scheduleForm.department,
                              year: scheduleForm.year,
                              term: scheduleForm.term
                            }
                          });
                          await schedulesService.update(editingSchedule.id, scheduleForm as any);
                        } else {
                          console.log('➕ Adding new schedule...');
                          if (!scheduleFile) {
                            throw new Error('يجب اختيار ملف PDF');
                          }
                          if (!scheduleForm.department) {
                            throw new Error('يجب اختيار القسم');
                          }
                          if (!scheduleForm.year) {
                            throw new Error('يجب اختيار السنة');
                          }
                          if (!scheduleForm.term) {
                            throw new Error('يجب اختيار الترم');
                          }
                          
                          // Check if schedule already exists
                          const existingSchedule = await schedulesService.getByCriteria(
                            scheduleForm.department,
                            scheduleForm.year,
                            scheduleForm.term as 'FIRST' | 'SECOND'
                          );
                          
                          if (existingSchedule) {
                            throw new Error('يوجد جدول محاضرات بالفعل لهذا القسم والسنة والترم. يرجى تحديث الجدول الموجود بدلاً من إنشاء جدول جديد.');
                          }
                          
                          console.log('💾 Adding schedule with data:', {
                            title: scheduleForm.title,
                            department: scheduleForm.department,
                            departmentAr: scheduleForm.departmentAr,
                            year: scheduleForm.year,
                            term: scheduleForm.term,
                            termAr: scheduleForm.termAr,
                            hasFile: !!scheduleFile
                          });
                          
                          const result = await schedulesService.add(scheduleForm as any, scheduleFile);
                          if (!result) {
                            throw new Error('فشل في حفظ الجدول');
                          }
                          
                          console.log('✅ Schedule added successfully:', result);
                        }
                        
                        console.log('✅ Schedule saved successfully, refreshing list...');
                        const list = await schedulesService.getAll();
                        setSchedules(list);
                        setShowScheduleModal(false);
                        setEditingSchedule(null);
                        setScheduleFile(null);
                        showMessage(editingSchedule ? 'تم تحديث جدول المحاضرات بنجاح' : 'تم حفظ جدول المحاضرات بنجاح');
                        
                        // إشارة لتحديث الجدول في الصفحة الرئيسية
                        console.log('📤 Sending schedule update signal...');
                        localStorage.setItem('scheduleUpdated', Date.now().toString());
                        window.dispatchEvent(new Event('storage'));
                        window.dispatchEvent(new CustomEvent('dataUpdated', { detail: 'schedule' }));
                        console.log('✅ Schedule update signal sent');
                        
                        // إعادة تعيين النموذج
                        setScheduleForm({
                          title: '',
                          department: '',
                          departmentAr: '',
                          year: 1,
                          term: 'FIRST',
                          termAr: 'الترم الأول',
                          size: '',
                          fileName: ''
                        });
                      } catch (e) {
                        console.error('❌ Error saving schedule:', e);
                        
                        // Check for specific error messages
                        let errorMessage = 'خطأ غير معروف';
                        if (e instanceof Error) {
                          if (e.message.includes('يوجد جدول محاضرات بالفعل')) {
                            errorMessage = 'يوجد جدول محاضرات بالفعل لهذا القسم والسنة والترم. يرجى تحديث الجدول الموجود بدلاً من إنشاء جدول جديد.';
                          } else if (e.message.includes('unique')) {
                            errorMessage = 'يوجد جدول محاضرات بالفعل لهذا القسم والسنة والترم. يرجى تحديث الجدول الموجود بدلاً من إنشاء جدول جديد.';
                          } else if (e.message.includes('فشل في حفظ الجدول')) {
                            errorMessage = 'فشل في حفظ الجدول. قد يكون الملف كبير جداً أو تالف. يرجى تجربة ملف أصغر.';
                          } else {
                            errorMessage = e.message;
                          }
                        }
                        
                        showMessage(`حدث خطأ أثناء حفظ الجدول: ${errorMessage}`, true);
                      } finally {
                        setLoadingSchedule(false);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingSchedule ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {scheduleFile && scheduleFile.size > 2 * 1024 * 1024 ? 'جاري رفع الملف...' : 'جاري الحفظ...'}
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        {editingSchedule ? 'تحديث الجدول' : 'حفظ الجدول'}
                      </>
                    )}
                  </button>
                  <button onClick={() => { 
                    setShowScheduleModal(false); 
                    setEditingSchedule(null); 
                    setScheduleFile(null);
                    setScheduleForm({
                      title: '',
                      department: '',
                      departmentAr: '',
                      year: 1,
                      term: 'FIRST',
                      termAr: 'الترم الأول',
                      size: '',
                      fileName: ''
                    });
                  }} className="flex-1 bg-gray-700 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-600 transition-all duration-300">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Management */}
        {activeTab === 'messages' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">إدارة الرسائل والطلبات</h2>
              <button 
                onClick={() => {
                  const loadMessages = async () => {
                    try {
                      const [messagesData, statsData] = await Promise.all([
                        messagesService.getAll(),
                        messagesService.getStats()
                      ]);
                      setMessages(messagesData);
                      setMessageStats(statsData);
                      showMessage('تم تحديث الرسائل بنجاح!');
                    } catch (error) {
                      console.error('Error loading messages:', error);
                      showMessage('حدث خطأ في تحديث الرسائل', true);
                    }
                  };
                  loadMessages();
                }}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
              >
                🔄 تحديث الرسائل
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-yellow-300 font-semibold">إجمالي الرسائل</p>
                <p className="text-white text-2xl font-bold">{messageStats.total}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🆕</div>
                <p className="text-yellow-300 font-semibold">جديدة</p>
                <p className="text-white text-2xl font-bold">{messageStats.new}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">👁️</div>
                <p className="text-yellow-300 font-semibold">مقروءة</p>
                <p className="text-white text-2xl font-bold">{messageStats.read}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-yellow-300 font-semibold">مردود عليها</p>
                <p className="text-white text-2xl font-bold">{messageStats.replied}</p>
              </div>
            </div>

            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={message.id} className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          message.type === 'contact' 
                            ? 'bg-blue-500/20 text-yellow-300 border border-yellow-500/30' 
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {message.type === 'contact' ? 'رسالة تواصل' : 'طلب انضمام'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          message.status === 'new' 
                            ? 'bg-orange-500/20 text-yellow-300 border border-yellow-500/30'
                            : message.status === 'read'
                            ? 'bg-blue-500/20 text-yellow-300 border border-yellow-500/30'
                            : message.status === 'replied'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {message.status === 'new' ? 'جديدة' : 
                           message.status === 'read' ? 'مقروءة' :
                           message.status === 'replied' ? 'مردود عليها' : 'مغلقة'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{message.first_name}</h3>
                      <p className="text-gray-300 text-sm mb-2">{message.email}</p>
                      
                      {message.type === 'contact' ? (
                        <div>
                          <p className="text-white font-medium mb-1">الموضوع: {message.subject}</p>
                          <p className="text-gray-300 text-sm">{message.message}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white font-medium mb-1">القسم: {message.department}</p>
                          <p className="text-gray-300 text-sm">السنة: {message.year} - الترم: {message.term}</p>
                          {message.whatsapp && <p className="text-gray-300 text-sm">واتساب: {message.whatsapp}</p>}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-3">
                        {new Date(message.created_at).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button 
                        onClick={async () => {
                          try {
                            const newStatus = message.status === 'new' ? 'read' : 'new';
                            await messagesService.updateStatus(message.id, newStatus);
                            const updatedMessages = await messagesService.getAll();
                            const updatedStats = await messagesService.getStats();
                            setMessages(updatedMessages);
                            setMessageStats(updatedStats);
                            showMessage('تم تحديث حالة الرسالة بنجاح!');
                          } catch (error) {
                            console.error('Error updating message status:', error);
                            showMessage('حدث خطأ في تحديث حالة الرسالة', true);
                          }
                        }}
                        className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                        title="تغيير حالة القراءة"
                      >
                        <span className="text-blue-400">👁️</span>
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedMessage(message);
                          setReplySubject(message.type === 'contact' && message.subject ? `Re: ${message.subject}` : 'رد على رسالتك');
                          setReplyBody('');
                          setShowReplyModal(true);
                        }}
                        className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center hover:bg-purple-500/30 transition-colors"
                        title="الرد على الرسالة"
                      >
                        <span className="text-purple-400">💌</span>
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            await messagesService.updateStatus(message.id, 'replied');
                            const updatedMessages = await messagesService.getAll();
                            const updatedStats = await messagesService.getStats();
                            setMessages(updatedMessages);
                            setMessageStats(updatedStats);
                            showMessage('تم تحديث حالة الرسالة إلى "مردود عليها"!');
                          } catch (error) {
                            console.error('Error updating message status:', error);
                            showMessage('حدث خطأ في تحديث حالة الرسالة', true);
                          }
                        }}
                        className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-green-500/30 transition-colors"
                        title="تحديد كمردود عليها"
                      >
                        <span className="text-green-400">✅</span>
                      </button>
                      <button 
                        onClick={async () => {
                          if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
                            try {
                              await messagesService.delete(message.id);
                              const updatedMessages = await messagesService.getAll();
                              const updatedStats = await messagesService.getStats();
                              setMessages(updatedMessages);
                              setMessageStats(updatedStats);
                              showMessage('تم حذف الرسالة بنجاح!');
                            } catch (error) {
                              console.error('Error deleting message:', error);
                              showMessage('حدث خطأ في حذف الرسالة', true);
                            }
                          }
                        }}
                        className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                        title="حذف الرسالة"
                      >
                        <span className="text-red-400">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="text-center py-20">
                <div className="text-8xl mb-8">💬</div>
                <h3 className="text-3xl font-black text-white mb-4">لا توجد رسائل</h3>
                <p className="text-gray-300 mb-8 text-lg">لم يتم إرسال أي رسائل أو طلبات انضمام بعد</p>
              </div>
            )}
          </div>
        )}

        {/* Materials Management */}
        {activeTab === 'materials' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">إدارة المواد</h2>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30"
              >
                + إضافة مادة جديدة
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(() => {
                const filteredMaterials = materials.filter(material => canEditItem(material.department, material.year, material.term));
                console.log('📚 Materials Tab - Total:', materials.length, 'Filtered:', filteredMaterials.length);
                return filteredMaterials;
              })().map(material => (
                <div key={material.id} className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-cyan-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-xl">📚</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditMaterial(material)}
                        className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                      >
                        <span className="text-blue-400 text-sm">✏️</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteMaterial(material.id)}
                        className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      >
                        <span className="text-red-400 text-sm">🗑️</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{material.title}</h3>
                  <p className="text-lg text-yellow-300 font-bold mb-2">{material.titleAr}</p>
                  <p className="text-cyan-400 font-medium mb-2">{material.code}</p>
                  <p className="text-gray-300 text-sm mb-1">{material.department}</p>
                  <p className="text-xs text-gray-500 mb-2">{material.departmentAr}</p>
                  <p className="text-gray-400 text-sm">Year {material.year} - {material.term}</p>
                  <p className="text-xs text-gray-500">السنة {material.year} - {material.termAr}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedules Management Tab */}
        {activeTab === 'schedules' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">جداول المحاضرات (PDF)</h2>
              <div className="flex gap-4">
                <button 
                  onClick={() => schedulesService.getAll().then(setSchedules)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30"
                >
                  🔄 تحديث البيانات
                </button>
                <button 
                  onClick={() => {
                    console.log('🔄 Opening schedule modal, current form:', scheduleForm);
                    console.log('🔄 Current user permissions:', userPermissions);
                    console.log('🔄 Current superAdmin:', superAdmin);
                    setEditingSchedule(null);
                    // لا نعيد تعيين النموذج - نستخدم القيم المحملة من الصلاحيات
                    setShowScheduleModal(true);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30"
                >
                  + إضافة جدول (PDF)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-yellow-300 font-semibold">إجمالي الجداول</p>
                <p className="text-white text-2xl font-bold">{(() => {
                  const filtered = schedules.filter(sch => canEditItem(sch.department, sch.year, sch.term));
                  console.log('📊 Stats - Total schedules:', { total: schedules.length, filtered: filtered.length });
                  return filtered.length;
                })()}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🏛️</div>
                <p className="text-yellow-300 font-semibold">الأقسام</p>
                <p className="text-white text-2xl font-bold">{(() => {
                  const filtered = schedules.filter(sch => canEditItem(sch.department, sch.year, sch.term));
                  const departments = new Set(filtered.map(s => s.department));
                  console.log('📊 Stats - Departments:', { departments: Array.from(departments), count: departments.size });
                  return departments.size;
                })()}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-yellow-300 font-semibold">الترم الأول</p>
                <p className="text-white text-2xl font-bold">{(() => {
                  const filtered = schedules.filter(sch => canEditItem(sch.department, sch.year, sch.term) && sch.term === 'FIRST');
                  console.log('📊 Stats - First Term:', { count: filtered.length });
                  return filtered.length;
                })()}</p>
              </div>
              <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-yellow-300 font-semibold">الترم الثاني</p>
                <p className="text-white text-2xl font-bold">{(() => {
                  const filtered = schedules.filter(sch => canEditItem(sch.department, sch.year, sch.term) && sch.term === 'SECOND');
                  console.log('📊 Stats - Second Term:', { count: filtered.length });
                  return filtered.length;
                })()}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600/50 to-purple-600/50">
                    <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">العنوان</th>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">القسم</th>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">السنة</th>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">الترم</th>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">الرابط</th>
                    <th className="px-6 py-4 text-right text-white font-bold text-lg border-b border-blue-400/30">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    console.log('📊 All schedules:', schedules);
                    const filteredSchedules = schedules.filter(sch => canEditItem(sch.department, sch.year, sch.term));
                    console.log('📊 Filtered schedules:', filteredSchedules);
                    return filteredSchedules;
                  })()
                    .map((sch, index) => (
                    <tr key={sch.id} className={`hover:bg-white/10 transition-all duration-300 ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}`}>
                      <td className="px-6 py-4 text-right text-white border-b border-white/10">{sch.title}</td>
                      <td className="px-6 py-4 text-right text-white border-b border-white/10">
                        <div className="flex flex-col">
                          <span className="text-white">{sch.departmentAr}</span>
                          <span className="text-gray-400 text-sm">{sch.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-white border-b border-white/10">
                        <span className="bg-green-500/30 px-3 py-1 rounded-lg text-sm font-semibold">السنة {sch.year}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-white border-b border-white/10">
                        <span className="bg-orange-500/30 px-3 py-1 rounded-lg text-sm font-semibold">{sch.termAr}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-white border-b border-white/10">
                        {sch.fileUrl ? (
                          <a href={sch.fileUrl} target="_blank" rel="noopener noreferrer" className="text-yellow-300 underline">عرض</a>
                        ) : (
                          <span className="text-gray-400">لا يوجد</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center border-b border-white/10">
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => {
                              setEditingSchedule(sch);
                              setScheduleForm({
                                title: sch.title,
                                department: sch.department,
                                departmentAr: sch.departmentAr,
                                year: sch.year,
                                term: sch.term,
                                termAr: sch.termAr,
                                size: sch.size || '',
                                fileName: sch.fileName || ''
                              });
                              setShowScheduleModal(true);
                            }}
                            className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                          >
                            <span className="text-blue-400">✏️</span>
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('هل أنت متأكد من حذف هذا الجدول؟')) {
                                schedulesService.delete(sch.id).then(() => schedulesService.getAll().then(setSchedules));
                              }
                            }}
                            className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                          >
                            <span className="text-red-400">🗑️</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {schedules.length === 0 && (
              <div className="text-center py-20">
                <div className="text-8xl mb-8">📅</div>
                <h3 className="text-3xl font-black text-white mb-4">لا توجد جداول محاضرات</h3>
                <p className="text-gray-300 mb-8 text-lg">ابدأ بإضافة جدول PDF لكل قسم/سنة/ترم</p>
                <button 
                  onClick={() => {
                    console.log('🔄 Opening schedule modal, current form:', scheduleForm);
                    console.log('🔄 Current user permissions:', userPermissions);
                    console.log('🔄 Current superAdmin:', superAdmin);
                    setEditingSchedule(null);
                    // لا نعيد تعيين النموذج - نستخدم القيم المحملة من الصلاحيات
                    setShowScheduleModal(true);
                  }}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/30"
                >
                  + إضافة أول جدول
                </button>
              </div>
            )}
          </div>
        )}

        {/* PDFs Management */}
        {activeTab === 'pdfs' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">إدارة الـ Material</h2>
              <button 
                onClick={() => setShowPdfModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30"
              >
                + رفع ملف PDF جديد
              </button>
            </div>

            <div className="space-y-4">
              {pdfs
                .filter(pdf => {
                  const pdfAny = pdf as any;
                  const material = materials.find(m => m.id === pdfAny.materialId || m.id === pdfAny.material_id);
                  return material && canEditItem(material.department, material.year, material.term);
                })
                .map(pdf => (
                <div key={pdf.id} className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-yellow-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-500/30">
                        <span className="text-red-400 font-bold text-2xl">📄</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{pdf.title}</h3>
                        <p className="text-gray-300 text-sm mb-1">المادة: {pdf.material}</p>
                        <p className="text-xs text-gray-500 mb-2">{pdf.material_ar}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{pdf.size}</span>
                          <span>{pdf.uploads} تحميل</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPdf(pdf)}
                        className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                      >
                        <span className="text-blue-400">✏️</span>
                      </button>
                      <button 
                        onClick={() => handleDeletePdf(pdf.id)}
                        className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      >
                        <span className="text-red-400">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Management */}
        {activeTab === 'videos' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">إدارة الفيديوهات</h2>
              <button 
                onClick={() => setShowVideoModal(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/30"
              >
                + إضافة فيديو جديد
              </button>
            </div>

            <div className="space-y-6">
              {videos
                .filter(video => {
                  const videoAny = video as any;
                  const material = materials.find(m => m.id === videoAny.materialId || m.id === videoAny.material_id);
                  return material && canEditItem(material.department, material.year, material.term);
                })
                .map(video => (
                <div key={video.id} className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-blue-500/50 transition-all duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                      <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-lg">
                        <iframe
                          src={video.is_playlist && video.playlist_id 
                            ? `https://www.youtube.com/embed/videoseries?list=${video.playlist_id}&autoplay=0&rel=0&modestbranding=1&showinfo=1&controls=1&loop=1&playlist=${video.playlist_id}`
                            : `https://www.youtube.com/embed/${video.youtube_id}?autoplay=0&rel=0&modestbranding=1&showinfo=1`
                          }
                          title={video.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">{video.title}</h3>
                        {video.is_playlist && (
                          <span className="bg-blue-500/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                            📺 Playlist
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-1">المادة: {video.material}</p>
                      <p className="text-xs text-gray-500 mb-2">{video.material_ar}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>المدة: {video.is_playlist ? 'Playlist' : video.duration}</span>
                        <span>المشاهدات: {video.is_playlist ? 'متعدد' : video.views.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-1 flex items-center justify-end">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditVideo(video)}
                          className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                        >
                          <span className="text-blue-400">✏️</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(video.id)}
                          className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                        >
                          <span className="text-red-400">🗑️</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Admins Management Tab */}
        {activeTab === 'admins' && (superAdmin?.role === 'super_admin' || userPermissions?.canManageAdmins) && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👑</div>
              <h2 className="text-3xl font-black text-white mb-4">إدارة الأدمنز والصلاحيات</h2>
              <p className="text-gray-400 mb-8">قم بإدارة المديرين وصلاحياتهم بشكل مفصل</p>
              <Link href="/admin/manage-admins">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30">
                  الانتقال لإدارة الأدمنز
                </button>
              </Link>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {activeTab === 'notifications' && superAdmin?.role === 'super_admin' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <SendNotification 
              onSuccess={() => {
                showMessage('تم إرسال الإشعار بنجاح!');
              }}
            />
=======
        {/* Notifications Management (Super Admin Only) */}
        {activeTab === 'notifications' && superAdmin?.role === 'super_admin' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black text-white mb-2">إرسال إشعارات للمستخدمين</h2>
                <p className="text-gray-400">أرسل تحديثات وإعلانات لجميع المستخدمين أو مستخدم محدد</p>
              </div>
              <button
                onClick={() => {
                  console.log('Opening password modal...');
                  setShowNotificationPasswordModal(true);
                }}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                + إرسال إشعار جديد
              </button>
            </div>

            <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-700/50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">🆕</div>
                  <div className="text-2xl font-bold text-white mb-1">تحديثات</div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">📢</div>
                  <div className="text-2xl font-bold text-white mb-1">إعلانات</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">⚠️</div>
                  <div className="text-2xl font-bold text-white mb-1">تحذيرات</div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-center">
                  <div className="text-3xl mb-2">ℹ️</div>
                  <div className="text-2xl font-bold text-white mb-1">معلومات</div>
                </div>
              </div>

              {/* Sent Notifications List */}
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">الإشعارات المرسلة</h3>
                {sentNotifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>لا توجد إشعارات مرسلة بعد</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {sentNotifications.map((notification: any) => {
                      const typeColors = {
                        update: 'bg-blue-500/20 border-blue-500/30',
                        announcement: 'bg-purple-500/20 border-purple-500/30',
                        warning: 'bg-yellow-500/20 border-yellow-500/30',
                        info: 'bg-green-500/20 border-green-500/30',
                      };
                      const typeIcons = {
                        update: '🆕',
                        announcement: '📢',
                        warning: '⚠️',
                        info: 'ℹ️',
                      };

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-xl border ${typeColors[notification.type] || typeColors.update}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <span className="text-2xl">{typeIcons[notification.type] || '📢'}</span>
                              <div className="flex-1">
                                <h4 className="font-bold text-white mb-1">{notification.title}</h4>
                                <p className="text-sm text-gray-300 mb-2 line-clamp-2">{notification.message}</p>
                                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                                  <span>
                                    📅 {new Date(notification.created_at).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </span>
                                  {notification.scheduled_at && (
                                    <span>
                                      ⏰ Scheduled: {new Date(notification.scheduled_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  )}
                                  {notification.expires_at && (
                                    <span>
                                      ⏳ Expires: {new Date(notification.expires_at).toLocaleString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true
                                      })}
                                    </span>
                                  )}
                                  <span>
                                    👤 {notification.target_user_id ? 'Specific User' : 'All Users'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
>>>>>>> ad2b2d5 (Update various files including notifications, admin dashboard, and UI components)
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-gray-700/50">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-white">إدارة المستخدمين</h2>
              <button 
                onClick={() => setShowUserModal(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
              >
                + إضافة مستخدم جديد
              </button>
            </div>

            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="bg-gray-700/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">👤</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{user.name}</h3>
                        <p className="text-gray-300 text-sm mb-1">{user.email}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className={`px-2 py-1 rounded-full ${
                            user.role === 'أستاذ' 
                              ? 'bg-blue-500/20 text-yellow-300 border border-yellow-500/30' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {user.role}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            (user as any).status === 'نشط' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {(user as any).status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center hover:bg-blue-500/30 transition-colors"
                      >
                        <span className="text-blue-400">✏️</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                      >
                        <span className="text-red-400">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add/Edit Material Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'تعديل المادة' : 'إضافة مادة جديدة'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ❌ {errorMessage}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">اسم المادة (إنجليزي)</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      placeholder="Introduction to Programming"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">اسم المادة (عربي)</label>
                    <input
                      type="text"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({...formData, titleAr: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      placeholder="مقدمة في البرمجة"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">كود المادة</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                      placeholder="CS101"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      السنة
                      {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.year) && (
                        <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {formData.year}</span>
                      )}
                    </label>
                    <select
                      value={formData.year}
                      disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.year)}
                      onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                      className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 ${
                        superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.year) ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value={1}>السنة الأولى</option>
                      <option value={2}>السنة الثانية</option>
                      <option value={3}>السنة الثالثة</option>
                      <option value={4}>السنة الرابعة</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      القسم (إنجليزي)
                      {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department) && (
                        <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {formData.department}</span>
                      )}
                    </label>
                    <select
                      value={formData.department}
                      disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department)}
                      onChange={(e) => {
                        const selectedDept = e.target.value;
                        setFormData({...formData, department: selectedDept});
                        const deptMap: {[key: string]: string} = {
                          'General Program': 'البرنامج العام',
                          'Cyber Security': 'الأمن السيبراني',
                          'Artificial Intelligence': 'الذكاء الاصطناعي',
                          'Computer Science': 'علوم الحاسوب',
                          'Information Technology': 'تكنولوجيا المعلومات',
                          'Data Science': 'علوم البيانات'
                        };
                        setFormData(prev => ({...prev, departmentAr: deptMap[selectedDept] || selectedDept}));
                      }}
                      className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 ${
                        superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department) ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="">اختر القسم</option>
                      <option value="General Program">General Program</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Data Science">Data Science</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      القسم (عربي)
                      {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department) && (
                        <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {formData.departmentAr}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.departmentAr}
                      disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department)}
                      onChange={(e) => setFormData({...formData, departmentAr: e.target.value})}
                      className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 ${
                        superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.department) ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      placeholder="البرنامج العام"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      الترم (إنجليزي)
                      {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term) && (
                        <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {formData.term}</span>
                      )}
                    </label>
                    <select
                      value={formData.term}
                      disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term)}
                      onChange={(e) => setFormData({...formData, term: e.target.value})}
                      className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 ${
                        superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term) ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="First Semester">First Semester</option>
                      <option value="Second Semester">Second Semester</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">
                      الترم (عربي)
                      {superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term) && (
                        <span className="text-yellow-400 text-xs mr-2">🔒 محدد: {formData.termAr}</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.termAr}
                      disabled={superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term)}
                      onChange={(e) => setFormData({...formData, termAr: e.target.value})}
                      className={`w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 ${
                        superAdmin?.role === 'admin' && userPermissions?.scopes?.some((s: any) => s.term) ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                      placeholder="الترم الأول"
                    />
                  </div>
                </div>

                {/* روابط المادة */}
                <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>🔗</span>
                    روابط المادة
                  </h3>
                  
                  <div className="space-y-4">
                <div>
                      <label className="block text-white font-medium mb-2">رابط كتاب المادة</label>
                      <input
                        type="url"
                        value={formData.bookLink}
                        onChange={(e) => setFormData({...formData, bookLink: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        placeholder="https://drive.google.com/file/d/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">رابط محاضرات المادة</label>
                      <input
                        type="url"
                        value={formData.lecturesLink}
                        onChange={(e) => setFormData({...formData, lecturesLink: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        placeholder="https://drive.google.com/drive/folders/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">رابط Google Drive</label>
                      <input
                        type="url"
                        value={formData.googleDriveLink}
                        onChange={(e) => setFormData({...formData, googleDriveLink: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                        placeholder="https://drive.google.com/drive/folders/..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white font-medium mb-2">روابط إضافية (JSON)</label>
                      <textarea
                        value={formData.additionalLinks}
                        onChange={(e) => setFormData({...formData, additionalLinks: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 h-24"
                        placeholder='[{"name": "ملاحظات", "url": "https://..."}, {"name": "تمارين", "url": "https://..."}]'
                      />
                      <p className="text-gray-400 text-sm mt-1">صيغة JSON للروابط الإضافية (اختياري)</p>
                    </div>
                    
                    {/* خيار إظهار Google Drive فقط */}
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="showGoogleDriveOnly"
                          checked={formData.showGoogleDriveOnly}
                          onChange={(e) => setFormData({...formData, showGoogleDriveOnly: e.target.checked})}
                          className="w-5 h-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                        />
                        <label htmlFor="showGoogleDriveOnly" className="text-white font-medium cursor-pointer">
                          إظهار Google Drive فقط وإخفاء PDFs والفيديوهات
                        </label>
                      </div>
                      <p className="text-yellow-300 text-sm mt-2">
                        ☁️ عند تفعيل هذا الخيار، سيظهر قسم Google Drive عصري بدلاً من أقسام PDFs والفيديوهات
                      </p>
                    </div>

                    {/* Section Visibility Controls */}
                    <div className="bg-gray-700/30 border border-gray-600/30 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span>👁️</span>
                        التحكم في إظهار الأقسام
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="showMaterialsSection"
                            checked={formData.showMaterialsSection}
                            onChange={(e) => setFormData({...formData, showMaterialsSection: e.target.checked})}
                            className="w-5 h-5 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <label htmlFor="showMaterialsSection" className="text-white font-medium cursor-pointer">
                            إظهار قسم المواد (Materials)
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="showMaterialLinksSection"
                            checked={formData.showMaterialLinksSection}
                            onChange={(e) => setFormData({...formData, showMaterialLinksSection: e.target.checked})}
                            className="w-5 h-5 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
                          />
                          <label htmlFor="showMaterialLinksSection" className="text-white font-medium cursor-pointer">
                            إظهار قسم روابط المواد (Material Links)
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="showPdfsSection"
                            checked={formData.showPdfsSection}
                            onChange={(e) => setFormData({...formData, showPdfsSection: e.target.checked})}
                            className="w-5 h-5 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                          />
                          <label htmlFor="showPdfsSection" className="text-white font-medium cursor-pointer">
                            إظهار قسم الـ PDFs
                          </label>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="showVideosSection"
                            checked={formData.showVideosSection}
                            onChange={(e) => setFormData({...formData, showVideosSection: e.target.checked})}
                            className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                          />
                          <label htmlFor="showVideosSection" className="text-white font-medium cursor-pointer">
                            إظهار قسم الفيديوهات
                          </label>
                        </div>
                      </div>
                      
                      <p className="text-gray-400 text-sm mt-3">
                        💡 يمكنك إخفاء أي قسم من الأقسام الثلاثة حسب الحاجة
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={editingItem ? handleUpdateMaterial : handleAddMaterial}
                    disabled={loadingMaterial}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingMaterial ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingItem ? 'جاري التحديث...' : 'جاري الإضافة...'}
                      </>
                    ) : (
                      editingItem ? 'تحديث المادة' : 'إضافة المادة'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'تعديل ملف PDF' : 'إضافة ملف PDF جديد'}
                </h3>
                <button 
                  onClick={() => {
                    setShowPdfModal(false);
                    setEditingItem(null);
                    resetPdfForm();
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ❌ {errorMessage}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">عنوان الملف</label>
                  <input
                    type="text"
                    value={pdfFormData.title}
                    onChange={(e) => setPdfFormData({...pdfFormData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    placeholder="كتاب المقرر - الفصل الأول"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">المادة</label>
                  <select
                    value={pdfFormData.materialId}
                    onChange={(e) => setPdfFormData({...pdfFormData, materialId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                  >
                    <option value="">اختر المادة</option>
                    {materials
                      .filter(material => canEditItem(material.department, material.year, material.term))
                      .map(material => (
                      <option key={material.id} value={material.id}>
                        {material.title} - {material.titleAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">رفع ملف PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setPdfFile(file);
                        setPdfFormData({...pdfFormData, size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`});
                      }
                    }}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600"
                  />
                  {pdfFile && (
                    <p className="text-sm text-gray-400 mt-2">
                      الملف المحدد: {pdfFile.name} ({(pdfFile.size / (1024 * 1024)).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">الوصف</label>
                  <textarea
                    value={pdfFormData.description}
                    onChange={(e) => setPdfFormData({...pdfFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500"
                    placeholder="وصف الملف..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={editingItem ? handleUpdatePdf : handleAddPdf}
                    disabled={loadingPdf}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-3 px-6 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loadingPdf ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingItem ? 'جاري التحديث...' : 'جاري الإضافة...'}
                      </>
                    ) : (
                      editingItem ? 'تحديث الملف' : 'إضافة الملف'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowPdfModal(false);
                      setEditingItem(null);
                      resetPdfForm();
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Video Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'تعديل فيديو' : 'إضافة فيديو جديد'}
                </h3>
                <button 
                  onClick={() => {
                    setShowVideoModal(false);
                    setEditingItem(null);
                    resetVideoForm();
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ❌ {errorMessage}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">رابط YouTube</label>
                  <div className="relative">
                    <input
                      type="url"
                      value={videoFormData.youtubeUrl}
                      onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-xl text-white focus:outline-none focus:border-blue-500 ${
                        videoFormData.isPlaylist 
                          ? 'bg-gray-600 border-gray-500 cursor-not-allowed' 
                          : 'bg-gray-700 border-gray-600'
                      }`}
                      placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      disabled={videoFormData.isPlaylist}
                    />
                    {loadingVideo && !videoFormData.isPlaylist && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {videoFormData.isPlaylist 
                      ? 'معطل عند استخدام Playlist' 
                      : 'سيتم استخراج العنوان والمدة والمشاهدات تلقائياً من YouTube'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">عنوان الفيديو</label>
                  <div className="relative">
                  <input
                    type="text"
                    value={videoFormData.title}
                    onChange={(e) => setVideoFormData({...videoFormData, title: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder="سيتم ملؤه تلقائياً من YouTube"
                  />
                    {loadingVideo && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">المادة</label>
                  <select
                    value={videoFormData.materialId}
                    onChange={(e) => setVideoFormData({...videoFormData, materialId: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="">اختر المادة</option>
                    {materials
                      .filter(material => canEditItem(material.department, material.year, material.term))
                      .map(material => (
                      <option key={material.id} value={material.id}>
                        {material.title} - {material.titleAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">مدة الفيديو</label>
                    <input
                      type="text"
                      value={videoFormData.duration}
                      onChange={(e) => setVideoFormData({...videoFormData, duration: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="مثال: 45:30 أو 1:23:45"
                    />
                    <p className="text-xs text-gray-400 mt-1">يمكنك تعديل المدة يدوياً</p>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">YouTube ID</label>
                    <input
                      type="text"
                      value={videoFormData.youtubeId}
                      className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-xl text-gray-300 cursor-not-allowed"
                      placeholder="سيتم استخراجه تلقائياً"
                      readOnly
                    />
                    <p className="text-xs text-gray-400 mt-1">يتم استخراجه تلقائياً من الرابط</p>
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">الوصف</label>
                  <textarea
                    value={videoFormData.description}
                    onChange={(e) => setVideoFormData({...videoFormData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder="وصف الفيديو..."
                  />
                </div>

                {/* Playlist Section */}
                <div className="bg-blue-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span>📺</span>
                    YouTube Playlist (اختياري)
                  </h3>
                  
                  <div>
                    <label className="block text-white font-medium mb-2">رابط Playlist</label>
                    <div className="relative">
                      <input
                        type="url"
                        value={videoFormData.playlistUrl}
                        onChange={(e) => handlePlaylistUrlChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        placeholder="https://www.youtube.com/playlist?list=PL..."
                      />
                      {loadingVideo && videoFormData.playlistUrl && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      رابط YouTube Playlist كامل - سيتم استخراج العنوان تلقائياً
                      {loadingVideo && videoFormData.playlistUrl && (
                        <span className="text-blue-400 ml-2">جاري تحميل بيانات Playlist...</span>
                      )}
                    </p>
                  </div>
                  
                  {videoFormData.playlistId && (
                    <div className="mt-4">
                      <label className="block text-white font-medium mb-2">Playlist ID</label>
                      <input
                        type="text"
                        value={videoFormData.playlistId}
                        className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-xl text-gray-300 cursor-not-allowed"
                        placeholder="سيتم استخراجه تلقائياً"
                        readOnly
                      />
                      <p className="text-xs text-gray-400 mt-1">يتم استخراجه تلقائياً من الرابط</p>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isPlaylist"
                      checked={videoFormData.isPlaylist}
                      onChange={(e) => {
                        const isPlaylist = e.target.checked;
                        setVideoFormData({
                          ...videoFormData, 
                          isPlaylist: isPlaylist,
                          // إذا تم إلغاء تحديد playlist، امسح بيانات playlist
                          ...(isPlaylist ? {} : {
                            playlistUrl: '',
                            playlistId: ''
                          })
                        });
                      }}
                      className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor="isPlaylist" className="text-white font-medium cursor-pointer">
                      هذا playlist وليس فيديو عادي
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={editingItem ? handleUpdateVideo : handleAddVideo}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    {editingItem ? 'تحديث الفيديو' : 'إضافة الفيديو'}
                  </button>
                  <button
                    onClick={() => {
                      setShowVideoModal(false);
                      setEditingItem(null);
                      resetVideoForm();
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {editingItem ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
                </h3>
                <button 
                  onClick={() => {
                    setShowUserModal(false);
                    setEditingItem(null);
                    resetUserForm();
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 px-6 py-3 rounded-xl">
                  ❌ {errorMessage}
                </div>
              )}

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">الاسم</label>
                    <input
                      type="text"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="اسم المستخدم"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="user@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">كلمة المرور</label>
                  <input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder={editingItem ? "اترك فارغاً للحفاظ على كلمة المرور الحالية" : "كلمة المرور"}
                  />
                  {editingItem && (
                    <p className="text-xs text-gray-400 mt-1">اترك فارغاً للحفاظ على كلمة المرور الحالية</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white font-medium mb-2">الدور</label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({...userFormData, role: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="طالب">طالب</option>
                      <option value="أستاذ">أستاذ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">الحالة</label>
                    <select
                      value={userFormData.status}
                      onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="نشط">نشط</option>
                      <option value="معطل">معطل</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={editingItem ? handleUpdateUser : handleAddUser}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                  >
                    {editingItem ? 'تحديث المستخدم' : 'إضافة المستخدم'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setEditingItem(null);
                      resetUserForm();
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* Reply to Message Modal */}
        {showReplyModal && selectedMessage && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">الرد على الرسالة 💌</h2>
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setSelectedMessage(null);
                    setReplySubject('');
                    setReplyBody('');
                  }}
                  className="text-gray-400 hover:text-white transition-colors text-3xl"
=======
        {/* Notification Password Modal */}
        {showNotificationPasswordModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
              onClick={() => {
                setShowNotificationPasswordModal(false);
                setNotificationPassword('');
                setNotificationPasswordError('');
              }}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
              <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-md pointer-events-auto shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-white">⚠️ تأكيد الكلمة المرورية</h3>
                  <button
                    onClick={() => {
                      setShowNotificationPasswordModal(false);
                      setNotificationPassword('');
                      setNotificationPasswordError('');
                    }}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-300 mb-4">
                    هذا القسم محمي بكلمة مرور لأن إرسال الإشعارات للمستخدمين عملية حساسة.
                  </p>
                  <div>
                    <label className="block text-white font-medium mb-2">الكلمة المرورية</label>
                    <input
                      type="password"
                      value={notificationPassword}
                      onChange={(e) => {
                        setNotificationPassword(e.target.value);
                        setNotificationPasswordError('');
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleNotificationPasswordSubmit();
                        }
                      }}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="أدخل الكلمة المرورية"
                      autoFocus
                    />
                    {notificationPasswordError && (
                      <p className="text-red-400 text-sm mt-2">{notificationPasswordError}</p>
                    )}
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleNotificationPasswordSubmit}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => {
                        setShowNotificationPasswordModal(false);
                        setNotificationPassword('');
                        setNotificationPasswordError('');
                      }}
                      className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Notification Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">إرسال إشعار جديد</h3>
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationForm({
                      title: '',
                      message: '',
                      type: 'update',
                      targetUserId: null,
                      scheduledDate: null,
                      scheduledTime: null,
                      expireDate: null,
                      expireTime: null,
                    });
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
>>>>>>> ad2b2d5 (Update various files including notifications, admin dashboard, and UI components)
                >
                  ×
                </button>
              </div>

<<<<<<< HEAD
              <div className="space-y-6">
                {/* معلومات المرسل */}
                <div className="bg-gray-700/30 rounded-2xl p-6 border border-gray-600/30">
                  <h3 className="text-xl font-bold text-white mb-4">معلومات المرسل</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-semibold text-white">الاسم:</span> {selectedMessage.first_name}</p>
                    <p><span className="font-semibold text-white">البريد الإلكتروني:</span> {selectedMessage.email}</p>
                    {selectedMessage.type === 'contact' && selectedMessage.subject && (
                      <p><span className="font-semibold text-white">الموضوع:</span> {selectedMessage.subject}</p>
                    )}
                    {selectedMessage.type === 'contact' && selectedMessage.message && (
                      <div>
                        <p className="font-semibold text-white mb-2">الرسالة الأصلية:</p>
                        <div className="bg-gray-700/50 rounded-lg p-4 text-gray-300 text-sm">
                          {selectedMessage.message}
                        </div>
                      </div>
                    )}
                    {selectedMessage.type === 'join' && (
                      <>
                        <p><span className="font-semibold text-white">القسم:</span> {selectedMessage.department}</p>
                        <p><span className="font-semibold text-white">السنة:</span> {selectedMessage.year}</p>
                        <p><span className="font-semibold text-white">الترم:</span> {selectedMessage.term}</p>
                        {selectedMessage.whatsapp && (
                          <p><span className="font-semibold text-white">واتساب:</span> {selectedMessage.whatsapp}</p>
                        )}
                      </>
=======
              {successMessage && (
                <div className="mb-6 bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-3 rounded-xl">
                  ✅ {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-6 py-3 rounded-xl">
                  ❌ {errorMessage}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">نوع الإشعار *</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="update">🆕 تحديث</option>
                    <option value="announcement">📢 إعلان</option>
                    <option value="warning">⚠️ تحذير</option>
                    <option value="info">ℹ️ معلومات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">العنوان *</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                    placeholder="مثال: تحديث جديد على الموقع"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">الرسالة *</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 min-h-[150px]"
                    placeholder="اكتب محتوى الإشعار هنا..."
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">إرسال إلى</label>
                  <select
                    value={notificationForm.targetUserId || ''}
                    onChange={(e) => setNotificationForm({ ...notificationForm, targetUserId: e.target.value || null })}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">جميع المستخدمين</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-6">
                  {/* Schedule Date & Time */}
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <label className="block text-white font-medium mb-3">
                      Schedule Date & Time (Optional)
                      <span className="text-xs text-gray-400 block mt-1 font-normal">Send notification at a specific date and time</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Date</label>
                        <input
                          type="date"
                          value={notificationForm.scheduledDate || ''}
                          onChange={(e) => setNotificationForm({ ...notificationForm, scheduledDate: e.target.value || null })}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Time</label>
                        <input
                          type="time"
                          value={notificationForm.scheduledTime || ''}
                          onChange={(e) => setNotificationForm({ ...notificationForm, scheduledTime: e.target.value || null })}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                          disabled={!notificationForm.scheduledDate}
                        />
                      </div>
                    </div>
                    {notificationForm.scheduledDate && notificationForm.scheduledTime && (
                      <p className="text-xs text-gray-400 mt-2">
                        📅 Will be sent: {new Date(`${notificationForm.scheduledDate}T${notificationForm.scheduledTime}`).toLocaleString('en-US', { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    )}
                  </div>

                  {/* Expiry Date & Time */}
                  <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600/50">
                    <label className="block text-white font-medium mb-3">
                      Expiry Date & Time (Optional)
                      <span className="text-xs text-gray-400 block mt-1 font-normal">Notification expires at this date and time</span>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Date</label>
                        <input
                          type="date"
                          value={notificationForm.expireDate || ''}
                          onChange={(e) => setNotificationForm({ ...notificationForm, expireDate: e.target.value || null })}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                          min={notificationForm.scheduledDate || new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm mb-2">Time</label>
                        <input
                          type="time"
                          value={notificationForm.expireTime || ''}
                          onChange={(e) => setNotificationForm({ ...notificationForm, expireTime: e.target.value || null })}
                          className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm"
                          disabled={!notificationForm.expireDate}
                        />
                      </div>
                    </div>
                    {notificationForm.expireDate && notificationForm.expireTime && (
                      <p className="text-xs text-gray-400 mt-2">
                        ⏰ Expires: {new Date(`${notificationForm.expireDate}T${notificationForm.expireTime}`).toLocaleString('en-US', { 
                          weekday: 'short',
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
>>>>>>> ad2b2d5 (Update various files including notifications, admin dashboard, and UI components)
                    )}
                  </div>
                </div>

<<<<<<< HEAD
                {/* نموذج الرد */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">موضوع الرد</label>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="موضوع الرسالة"
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">نص الرد</label>
                    <textarea
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500"
                      placeholder="اكتب ردك هنا..."
                    />
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      // إنشاء رابط mailto للرد
                      const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`;
                      window.open(mailtoLink, '_blank');
                      
                      // تحديث حالة الرسالة إلى "مردود عليها"
                      messagesService.updateStatus(selectedMessage.id, 'replied').then(() => {
                        messagesService.getAll().then(setMessages);
                        messagesService.getStats().then(setMessageStats);
                        showMessage('تم فتح برنامج البريد الإلكتروني للرد!');
                      });
                      
                      setShowReplyModal(false);
                      setSelectedMessage(null);
                      setReplySubject('');
                      setReplyBody('');
                    }}
                    disabled={!replySubject.trim() || !replyBody.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📧 إرسال الرد عبر البريد الإلكتروني
                  </button>
                  <button
                    onClick={() => {
                      // نسخ البريد الإلكتروني والرد
                      const emailText = `To: ${selectedMessage.email}\nSubject: ${replySubject}\n\n${replyBody}`;
                      navigator.clipboard.writeText(emailText).then(() => {
                        showMessage('تم نسخ الرد! يمكنك لصقه في أي برنامج بريد إلكتروني');
                      }).catch(() => {
                        showMessage('فشل نسخ الرد', true);
                      });
                    }}
                    disabled={!replySubject.trim() || !replyBody.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📋 نسخ الرد
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyModal(false);
                      setSelectedMessage(null);
                      setReplySubject('');
                      setReplyBody('');
                    }}
                    className="bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
=======
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={async () => {
                      if (!notificationForm.title || !notificationForm.message) {
                        setErrorMessage('العنوان والرسالة مطلوبان');
                        return;
                      }

                      try {
                        setSuccessMessage('');
                        setErrorMessage('');

                        // بناء التاريخ والوقت للإرسال
                        let scheduled_at = null;
                        if (notificationForm.scheduledDate && notificationForm.scheduledTime) {
                          scheduled_at = `${notificationForm.scheduledDate}T${notificationForm.scheduledTime}:00`;
                        }

                        // بناء التاريخ والوقت للانتهاء
                        let expires_at = null;
                        if (notificationForm.expireDate && notificationForm.expireTime) {
                          expires_at = `${notificationForm.expireDate}T${notificationForm.expireTime}:00`;
                        }

                        const response = await fetch('/api/notifications', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'x-admin-id': superAdmin?.id || '',
                          },
                          body: JSON.stringify({
                            title: notificationForm.title,
                            message: notificationForm.message,
                            type: notificationForm.type,
                            target_user_id: notificationForm.targetUserId,
                            scheduled_at: scheduled_at,
                            expires_at: expires_at,
                          }),
                        });

                        const result = await response.json();

                        if (result.success) {
                          setSuccessMessage('تم إرسال الإشعار بنجاح');
                          setNotificationForm({
                            title: '',
                            message: '',
                            type: 'update',
                            targetUserId: null,
                            scheduledDate: null,
                            scheduledTime: null,
                            expireDate: null,
                            expireTime: null,
                          });
                          // تحديث قائمة الإشعارات المرسلة
                          loadSentNotifications();
                          setTimeout(() => {
                            setShowNotificationModal(false);
                            setSuccessMessage('');
                          }, 2000);
                        } else {
                          setErrorMessage(result.message || 'حدث خطأ في إرسال الإشعار');
                        }
                      } catch (error: any) {
                        console.error('Error sending notification:', error);
                        setErrorMessage('حدث خطأ في إرسال الإشعار');
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all duration-300"
                  >
                    إرسال الإشعار
                  </button>
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      setNotificationForm({
                        title: '',
                        message: '',
                        type: 'update',
                        targetUserId: null,
                        scheduledDate: null,
                        scheduledTime: null,
                        expireDate: null,
                        expireTime: null,
                      });
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-6 rounded-xl font-bold hover:bg-gray-700 transition-all duration-300"
>>>>>>> ad2b2d5 (Update various files including notifications, admin dashboard, and UI components)
                  >
                    إلغاء
                  </button>
                </div>
<<<<<<< HEAD

                {/* ملاحظة للمستخدم */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm">
                    💡 <span className="font-semibold">ملاحظة:</span> عند النقر على "إرسال الرد"، سيتم فتح برنامج البريد الإلكتروني الافتراضي في جهازك مع الرسالة جاهزة للإرسال. 
                    يمكنك أيضاً استخدام زر "نسخ الرد" لنسخ النص وإرساله عبر أي برنامج بريد إلكتروني آخر.
                  </p>
                </div>
=======
>>>>>>> ad2b2d5 (Update various files including notifications, admin dashboard, and UI components)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}