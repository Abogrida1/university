'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminService, AdminUser, AdminScope, CreateAdminData, CreateScopeData } from '@/lib/adminService';

export default function ManageAdminsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminScopes, setAdminScopes] = useState<AdminScope[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showScopeModal, setShowScopeModal] = useState(false);
  const [editingScope, setEditingScope] = useState<AdminScope | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [adminForm, setAdminForm] = useState<CreateAdminData>({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  const [scopeForm, setScopeForm] = useState({
    department: '',
    year: '',
    term: '',
    canManageMaterials: false,
    canManagePdfs: false,
    canManageVideos: false,
    canManageSchedules: false,
    canManageMessages: false,
    canViewAnalytics: false,
    canManageUsers: false,
    canManageAdmins: false,
    description: ''
  });

  const departments = [
    { value: '', label: 'جميع الأقسام' },
    { value: 'Cyber Security', label: 'الأمن السيبراني' },
    { value: 'Artificial Intelligence', label: 'الذكاء الاصطناعي' },
    { value: 'General Program', label: 'البرنامج العام' }
  ];

  const years = [
    { value: '', label: 'جميع السنوات' },
    { value: '1', label: 'السنة الأولى' },
    { value: '2', label: 'السنة الثانية' },
    { value: '3', label: 'السنة الثالثة' },
    { value: '4', label: 'السنة الرابعة' }
  ];

  const terms = [
    { value: '', label: 'جميع الترمات' },
    { value: 'FIRST', label: 'الترم الأول' },
    { value: 'SECOND', label: 'الترم الثاني' }
  ];

  useEffect(() => {
    // التحقق من تسجيل الدخول
    const checkAuth = () => {
      const adminData = localStorage.getItem('superAdmin');
      if (!adminData) {
        router.push('/admin/login');
        return;
      }

      try {
        const admin = JSON.parse(adminData);
        // إذا لم يكن لديه role، افترض أنه super_admin
        if (!admin.role) {
          admin.role = 'super_admin';
        }
        
        if (admin.role !== 'super_admin') {
          router.push('/admin/dashboard');
          return;
        }

        setCurrentUser(admin);
        loadAdmins();
    } catch (error) {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const loadAdmins = async () => {
    setLoading(true);
    const data = await AdminService.getAllAdmins();
    setAdmins(data);
      setLoading(false);
  };

  const loadAdminScopes = async (adminId: string) => {
    const scopes = await AdminService.getAdminScopes(adminId);
    setAdminScopes(scopes);
  };

  const handleSelectAdmin = async (admin: AdminUser) => {
    setSelectedAdmin(admin);
    await loadAdminScopes(admin.id);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser || !currentUser.id) {
      setErrorMessage('خطأ في تسجيل الدخول');
      return;
    }

    const result = await AdminService.createAdmin(adminForm, currentUser.id);
    
    if (result.success) {
      setSuccessMessage('تم إنشاء الأدمن بنجاح');
        setShowCreateModal(false);
      setAdminForm({ name: '', email: '', password: '', role: 'admin' });
      await loadAdmins();
      } else {
      setErrorMessage(result.error || 'خطأ في إنشاء الأدمن');
    }
  };

  const handleCreateScope = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentUser || !currentUser.id || !selectedAdmin) return;

    const scopeData: CreateScopeData = {
      userId: selectedAdmin.id,
      department: scopeForm.department || null,
      year: scopeForm.year ? parseInt(scopeForm.year) : null,
      term: (scopeForm.term as 'FIRST' | 'SECOND') || null,
      canManageMaterials: scopeForm.canManageMaterials,
      canManagePdfs: scopeForm.canManagePdfs,
      canManageVideos: scopeForm.canManageVideos,
      canManageSchedules: scopeForm.canManageSchedules,
      canManageMessages: scopeForm.canManageMessages,
      canViewAnalytics: scopeForm.canViewAnalytics,
      canManageUsers: scopeForm.canManageUsers,
      canManageAdmins: scopeForm.canManageAdmins,
      description: scopeForm.description,
      grantedBy: currentUser.id
    };

    const result = await AdminService.createAdminScope(scopeData);
    
    if (result.success) {
      setSuccessMessage('تم إضافة الصلاحية بنجاح');
      setShowScopeModal(false);
      resetScopeForm();
      await loadAdminScopes(selectedAdmin.id);
      await loadAdmins();
    } else {
      setErrorMessage(result.error || 'خطأ في إضافة الصلاحية');
    }
  };

  const handleDeleteScope = async (scopeId: string) => {
    if (!currentUser || !currentUser.id || !selectedAdmin) return;
    
    if (!confirm('هل أنت متأكد من حذف هذه الصلاحية؟')) return;

    const result = await AdminService.deleteAdminScope(scopeId, currentUser.id);
    
    if (result.success) {
      setSuccessMessage('تم حذف الصلاحية بنجاح');
      await loadAdminScopes(selectedAdmin.id);
      await loadAdmins();
    } else {
      setErrorMessage(result.error || 'خطأ في حذف الصلاحية');
    }
  };

  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    if (!currentUser || !currentUser.id) return;

    const result = await AdminService.toggleAdminStatus(adminId, !currentStatus, currentUser.id);
    
    if (result.success) {
      setSuccessMessage(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} الأدمن بنجاح`);
      await loadAdmins();
    } else {
      setErrorMessage(result.error || 'خطأ في تغيير حالة الأدمن');
    }
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (!currentUser || !currentUser.id) return;
    
    if (!confirm('هل أنت متأكد من حذف هذا الأدمن؟ سيتم حذف جميع صلاحياته أيضاً.')) return;

    const result = await AdminService.deleteAdmin(adminId, currentUser.id);
    
    if (result.success) {
      setSuccessMessage('تم حذف الأدمن بنجاح');
      setSelectedAdmin(null);
      setAdminScopes([]);
      await loadAdmins();
    } else {
      setErrorMessage(result.error || 'خطأ في حذف الأدمن');
    }
  };

  const resetScopeForm = () => {
    setScopeForm({
      department: '',
      year: '',
      term: '',
      canManageMaterials: false,
      canManagePdfs: false,
      canManageVideos: false,
      canManageSchedules: false,
      canManageMessages: false,
      canViewAnalytics: false,
      canManageUsers: false,
      canManageAdmins: false,
      description: ''
    });
  };

  const getScopeDescription = (scope: AdminScope) => {
    const parts = [];
    if (scope.department) parts.push(scope.department);
    if (scope.year) parts.push(`السنة ${scope.year}`);
    if (scope.term) parts.push(scope.term === 'FIRST' ? 'الترم الأول' : 'الترم الثاني');
    if (parts.length === 0) parts.push('جميع الأقسام والسنوات');
    return parts.join(' - ');
  };

  const getPermissionsList = (scope: AdminScope) => {
    const permissions = [];
    if (scope.canManageMaterials) permissions.push('المواد');
    if (scope.canManagePdfs) permissions.push('PDF');
    if (scope.canManageVideos) permissions.push('الفيديو');
    if (scope.canManageSchedules) permissions.push('الجداول');
    if (scope.canManageMessages) permissions.push('الرسائل');
    if (scope.canViewAnalytics) permissions.push('الإحصائيات');
    if (scope.canManageUsers) permissions.push('المستخدمين');
    if (scope.canManageAdmins) permissions.push('الأدمنز');
    return permissions.join(', ') || 'لا توجد صلاحيات';
  };

  if (!currentUser || currentUser.role !== 'super_admin') {
  return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#FAFAD2'}}>
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">جاري التحميل...</h2>
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
        {/* Header */}
      <div className="bg-black/95 backdrop-blur-sm sticky top-0 z-10 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
            <button
                onClick={() => router.push('/admin/dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-2xl">←</span>
            </button>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                  إدارة الأدمنز والصلاحيات
                </h1>
                <p className="text-gray-400 text-sm mt-1">إضافة وإدارة المديرين وصلاحياتهم</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-500/30"
            >
              + إضافة أدمن جديد
            </button>
          </div>
          </div>
        </div>

      {/* Messages */}
      {successMessage && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 text-yellow-300">
            {successMessage}
            </div>
          </div>
        )}

      {errorMessage && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 text-red-300">
            {errorMessage}
            </div>
          </div>
        )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admins List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">قائمة الأدمنز ({admins.length})</h2>
              
              {loading ? (
                <div className="text-center py-8 text-gray-400">جاري التحميل...</div>
              ) : admins.length === 0 ? (
                <div className="text-center py-8 text-gray-400">لا يوجد أدمنز</div>
              ) : (
                <div className="space-y-3">
                    {admins.map((admin) => (
                    <div
                      key={admin.id}
                      onClick={() => handleSelectAdmin(admin)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedAdmin?.id === admin.id
                          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/50'
                          : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-white">{admin.name}</h3>
                          <p className="text-sm text-gray-400">{admin.email}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                            admin.role === 'super_admin' 
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                              {admin.role === 'super_admin' ? 'مدير رئيسي' : 'أدمن'}
                          </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                            admin.isActive 
                                ? 'bg-yellow-500/20 text-yellow-300'
                                : 'bg-red-500/20 text-red-300'
                          }`}>
                            {admin.isActive ? 'نشط' : 'غير نشط'}
                          </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            الصلاحيات: {admin.scopesCount}
                          </p>
              </div>
            </div>
                    </div>
                  ))}
          </div>
        )}
            </div>
          </div>

          {/* Admin Details and Scopes */}
          <div className="lg:col-span-2">
            {!selectedAdmin ? (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700/50 text-center">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-gray-400 text-lg">اختر أدمن لعرض تفاصيله وصلاحياته</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Admin Info Card */}
                <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedAdmin.name}</h2>
                      <p className="text-gray-400 mt-1">{selectedAdmin.email}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          selectedAdmin.role === 'super_admin'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                        }`}>
                          {selectedAdmin.role === 'super_admin' ? '👑 مدير رئيسي' : '⚡ أدمن'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          selectedAdmin.isActive
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                            : 'bg-red-500/20 text-red-300 border border-red-500/50'
                        }`}>
                          {selectedAdmin.isActive ? '✓ نشط' : '✗ غير نشط'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {selectedAdmin.role !== 'super_admin' && (
                        <>
                          <button
                            onClick={() => handleToggleAdminStatus(selectedAdmin.id, selectedAdmin.isActive)}
                            className="px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all border border-yellow-500/50"
                          >
                            {selectedAdmin.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(selectedAdmin.id)}
                            className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all border border-red-500/50"
                          >
                            حذف
                          </button>
                        </>
                      )}
                </div>
              </div>
          </div>

                {/* Scopes Section */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                      نطاقات الصلاحيات ({adminScopes.length})
                </h3>
                    {selectedAdmin.role !== 'super_admin' && (
                      <button
                        onClick={() => setShowScopeModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg shadow-yellow-500/30"
                      >
                        + إضافة صلاحية
                      </button>
                    )}
                  </div>

                  {selectedAdmin.role === 'super_admin' ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">👑</div>
                      <p className="text-gray-400">المدير الرئيسي له صلاحيات كاملة على النظام</p>
                    </div>
                  ) : adminScopes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🔐</div>
                      <p className="text-gray-400">لا توجد صلاحيات محددة لهذا الأدمن</p>
                      <button
                        onClick={() => setShowScopeModal(true)}
                        className="mt-4 px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all border border-yellow-500/50"
                      >
                        إضافة أول صلاحية
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {adminScopes.map((scope) => (
                        <div
                          key={scope.id}
                          className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-bold text-white">{getScopeDescription(scope)}</h4>
                              {scope.description && (
                                <p className="text-sm text-gray-400 mt-1">{scope.description}</p>
                              )}
                              <div className="mt-2">
                                <p className="text-sm text-gray-300">
                                  <span className="font-semibold">الصلاحيات:</span> {getPermissionsList(scope)}
                                </p>
                              </div>
                              {scope.grantedByName && (
                                <p className="text-xs text-gray-500 mt-2">
                                  منحت بواسطة: {scope.grantedByName}
                                </p>
                              )}
                    </div>
                            <button
                              onClick={() => handleDeleteScope(scope.id)}
                              className="text-red-400 hover:text-red-300 transition-colors ml-4"
                            >
                              🗑️
                            </button>
                </div>
              </div>
            ))}
          </div>
        )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">إضافة أدمن جديد</h2>
              
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">الاسم</label>
                    <input
                      type="text"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                      required
                    />
                  </div>
                  
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">كلمة المرور</label>
                    <input
                      type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                      required
                  minLength={6}
                    />
                  </div>
                  
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">الدور</label>
                    <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as 'admin' | 'super_admin' })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-500"
                >
                  <option value="admin">أدمن</option>
                  <option value="super_admin">مدير رئيسي</option>
                    </select>
                </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-bold hover:from-yellow-600 hover:to-yellow-700 transition-all"
                >
                  إنشاء
                </button>
                    <button
                      type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setAdminForm({ name: '', email: '', password: '', role: 'admin' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg font-bold hover:bg-gray-600 transition-all"
                >
                  إلغاء
                    </button>
                  </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Scope Modal */}
      {showScopeModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-3xl w-full border-2 border-gray-700 my-4 sm:my-8 shadow-2xl">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <span className="text-2xl">🔐</span>
              إضافة صلاحية لـ {selectedAdmin.name}
            </h2>
            
            <form onSubmit={handleCreateScope} className="space-y-4 sm:space-y-6">
              {/* Scope Selection */}
              <div className="bg-gray-700/50 rounded-xl p-3 sm:p-4 border border-gray-600">
                <h3 className="text-sm font-bold text-yellow-300 mb-3 flex items-center gap-2">
                  🎯 نطاق الصلاحية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                    <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-2">📚 القسم</label>
                        <select
                    value={scopeForm.department}
                    onChange={(e) => setScopeForm({ ...scopeForm, department: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  >
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                    <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-2">🎓 السنة</label>
                        <select
                    value={scopeForm.year}
                    onChange={(e) => setScopeForm({ ...scopeForm, year: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  >
                    {years.map(year => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                        </select>
                      </div>
                      
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-2">📅 الترم</label>
                          <select
                    value={scopeForm.term}
                    onChange={(e) => setScopeForm({ ...scopeForm, term: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                  >
                    {terms.map(term => (
                      <option key={term.value} value={term.value}>{term.label}</option>
                            ))}
                          </select>
                  </div>
                </div>
                        </div>
                        
              {/* Permissions */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <label className="block text-gray-300 text-sm font-bold flex items-center gap-2">
                    <span>⚙️</span> الصلاحيات
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setScopeForm({
                          ...scopeForm,
                          canManageMaterials: true,
                          canManagePdfs: true,
                          canManageVideos: true,
                          canManageSchedules: true,
                          canManageMessages: true,
                          canViewAnalytics: true,
                          canManageUsers: true,
                          canManageAdmins: true
                        });
                      }}
                      className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-all font-bold"
                    >
                      ✅ اختيار الكل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setScopeForm({
                          ...scopeForm,
                          canManageMaterials: false,
                          canManagePdfs: false,
                          canManageVideos: false,
                          canManageSchedules: false,
                          canManageMessages: false,
                          canViewAnalytics: false,
                          canManageUsers: false,
                          canManageAdmins: false
                        });
                      }}
                      className="flex-1 sm:flex-none text-xs sm:text-sm px-3 sm:px-4 py-2 bg-gray-600 border border-gray-500 text-gray-300 rounded-lg hover:bg-gray-500 transition-all font-bold"
                    >
                      ❌ إلغاء الكل
                    </button>
                  </div>
                </div>
                
                {/* Read-only Permission - Highlighted */}
                <div className="mb-4">
                  <div className="bg-gradient-to-r from-blue-900/40 to-blue-800/30 border-2 border-blue-500/50 rounded-xl p-3 sm:p-4 shadow-lg">
                    <label className="flex items-start sm:items-center space-x-3 space-x-reverse cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scopeForm.canViewAnalytics}
                        onChange={(e) => setScopeForm({ ...scopeForm, canViewAnalytics: e.target.checked })}
                        className="w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 text-blue-500 focus:ring-blue-500 flex-shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-blue-300 text-sm sm:text-base font-bold block">📊 عرض الإحصائيات (قراءة فقط)</span>
                        <p className="text-blue-400 text-xs sm:text-sm mt-1">
                          يسمح بمشاهدة نظرة عامة على النظام فقط - بدون صلاحيات تعديل
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Management Permissions */}
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/20 border border-yellow-500/30 rounded-xl p-3 sm:p-4 mb-3 shadow-lg">
                  <p className="text-yellow-300 text-xs sm:text-sm font-bold flex items-center gap-2">
                    <span className="text-lg">🔐</span>
                    صلاحيات الإدارة والتعديل
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { key: 'canManageMaterials', label: '📚 إدارة المواد', desc: 'إضافة وتعديل وحذف' },
                    { key: 'canManagePdfs', label: '📄 إدارة PDF', desc: 'رفع وحذف ملفات PDF' },
                    { key: 'canManageVideos', label: '🎥 إدارة الفيديو', desc: 'إضافة وحذف فيديوهات' },
                    { key: 'canManageSchedules', label: '📅 إدارة الجداول', desc: 'رفع وتعديل الجداول' },
                    { key: 'canManageMessages', label: '💬 إدارة الرسائل', desc: 'عرض والرد على الرسائل' },
                    { key: 'canManageUsers', label: '👥 إدارة المستخدمين', desc: 'إدارة حسابات الطلاب' },
                    { key: 'canManageAdmins', label: '👑 إدارة الأدمنز', desc: 'إضافة وحذف مديرين' }
                  ].map(perm => (
                    <label key={perm.key} className="flex items-start space-x-2 sm:space-x-3 space-x-reverse p-2.5 sm:p-3 bg-gray-700/50 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700 hover:border-yellow-500/30 transition-all">
                      <input
                        type="checkbox"
                        checked={scopeForm[perm.key as keyof typeof scopeForm] as boolean}
                        onChange={(e) => setScopeForm({ ...scopeForm, [perm.key]: e.target.checked })}
                        className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-yellow-500 focus:ring-yellow-500 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white text-xs sm:text-sm block font-semibold">{perm.label}</span>
                        <span className="text-gray-400 text-xs block mt-0.5">{perm.desc}</span>
                      </div>
                    </label>
                  ))}
                      </div>
                    </div>

              {/* Description */}
                      <div>
                <label className="block text-gray-300 text-xs sm:text-sm font-bold mb-2 flex items-center gap-2">
                  <span>📝</span> وصف الصلاحية (اختياري)
                </label>
                <textarea
                  value={scopeForm.description}
                  onChange={(e) => setScopeForm({ ...scopeForm, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all resize-none"
                  rows={3}
                  placeholder="مثال: مسؤول عن الأمن السيبراني - السنة الثانية"
                />
                </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base shadow-lg shadow-yellow-500/30 hover:shadow-xl transition-all transform hover:scale-105"
                >
                  ✅ إضافة الصلاحية
                </button>
                  <button
                    type="button"
                  onClick={() => {
                    setShowScopeModal(false);
                    resetScopeForm();
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-3.5 bg-gray-700 hover:bg-gray-600 border-2 border-gray-600 text-white rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all transform hover:scale-105"
                  >
                  ❌ إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}

