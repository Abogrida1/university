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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">جاري التحميل...</h2>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-10">
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
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  إدارة الأدمنز والصلاحيات
                </h1>
                <p className="text-gray-400 text-sm mt-1">إضافة وإدارة المديرين وصلاحياتهم</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30"
            >
              + إضافة أدمن جديد
            </button>
          </div>
          </div>
        </div>

      {/* Messages */}
      {successMessage && (
        <div className="container mx-auto px-4 mt-4">
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 text-green-300">
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
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50'
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
                                ? 'bg-purple-500/20 text-purple-300'
                                : 'bg-blue-500/20 text-blue-300'
                          }`}>
                              {admin.role === 'super_admin' ? 'مدير رئيسي' : 'أدمن'}
                          </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                            admin.isActive 
                                ? 'bg-green-500/20 text-green-300'
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
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                        }`}>
                          {selectedAdmin.role === 'super_admin' ? '👑 مدير رئيسي' : '⚡ أدمن'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          selectedAdmin.isActive
                            ? 'bg-green-500/20 text-green-300 border border-green-500/50'
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
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
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
                        className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-all border border-cyan-500/50"
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
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">البريد الإلكتروني</label>
                    <input
                      type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">كلمة المرور</label>
                    <input
                      type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      required
                  minLength={6}
                    />
                  </div>
                  
                  <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">الدور</label>
                    <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as 'admin' | 'super_admin' })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="admin">أدمن</option>
                  <option value="super_admin">مدير رئيسي</option>
                    </select>
                </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition-all"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full border border-gray-700 my-8">
            <h2 className="text-2xl font-bold text-white mb-4">إضافة صلاحية لـ {selectedAdmin.name}</h2>
            
            <form onSubmit={handleCreateScope} className="space-y-4">
              {/* Scope Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">القسم</label>
                        <select
                    value={scopeForm.department}
                    onChange={(e) => setScopeForm({ ...scopeForm, department: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    {departments.map(dept => (
                      <option key={dept.value} value={dept.value}>{dept.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">السنة</label>
                        <select
                    value={scopeForm.year}
                    onChange={(e) => setScopeForm({ ...scopeForm, year: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    {years.map(year => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                        </select>
                      </div>
                      
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-2">الترم</label>
                          <select
                    value={scopeForm.term}
                    onChange={(e) => setScopeForm({ ...scopeForm, term: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    {terms.map(term => (
                      <option key={term.value} value={term.value}>{term.label}</option>
                            ))}
                          </select>
                </div>
                        </div>
                        
              {/* Permissions */}
              <div>
                <label className="block text-gray-300 text-sm font-bold mb-3">الصلاحيات</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: 'canManageMaterials', label: '📚 إدارة المواد' },
                    { key: 'canManagePdfs', label: '📄 إدارة PDF' },
                    { key: 'canManageVideos', label: '🎥 إدارة الفيديو' },
                    { key: 'canManageSchedules', label: '📅 إدارة الجداول' },
                    { key: 'canManageMessages', label: '💬 إدارة الرسائل' },
                    { key: 'canViewAnalytics', label: '📊 عرض الإحصائيات' },
                    { key: 'canManageUsers', label: '👥 إدارة المستخدمين' },
                    { key: 'canManageAdmins', label: '👑 إدارة الأدمنز' }
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-700 transition-all">
                      <input
                        type="checkbox"
                        checked={scopeForm[perm.key as keyof typeof scopeForm] as boolean}
                        onChange={(e) => setScopeForm({ ...scopeForm, [perm.key]: e.target.checked })}
                        className="w-5 h-5 text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-white text-sm">{perm.label}</span>
                    </label>
                  ))}
                      </div>
                    </div>

              {/* Description */}
                      <div>
                <label className="block text-gray-300 text-sm font-bold mb-2">وصف الصلاحية (اختياري)</label>
                <textarea
                  value={scopeForm.description}
                  onChange={(e) => setScopeForm({ ...scopeForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  rows={3}
                  placeholder="مثال: مسؤول عن الأمن السيبراني - السنة الثانية"
                />
                </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
                >
                  إضافة الصلاحية
                </button>
                  <button
                    type="button"
                  onClick={() => {
                    setShowScopeModal(false);
                    resetScopeForm();
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
      </div>
  );
}

