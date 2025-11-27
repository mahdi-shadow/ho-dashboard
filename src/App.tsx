
import React, { useState, useEffect } from 'react';
import type { Page, User, Event, FinancialRecord, SportRecord, AdminView, AdminUser, AdminSettings, ManagedItem, AdminUserDetail, Coach, EventCategory, FrontendConfig } from './types';
import * as api from './api';
import { 
    DashboardIcon, UserIcon, ShieldIcon, UsersIcon, CalendarIcon, DollarSignIcon, LogoutIcon, UploadCloudIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, SettingsIcon, EyeIcon, SearchIcon, DatabaseIcon, PlusCircleIcon, Trash2Icon, CodeIcon,
    PaletteIcon, DownloadIcon, EditIcon
} from './components/Icons';

// --- Global Overrides ---
const GlobalStyles = () => (
    <style>{`
        /* Force light scheme for the app container to prevent dark mode inputs */
        #karate-app-container {
            color-scheme: light !important;
        }

        /* Aggressive override for inputs */
        #karate-app-container input:not([type="checkbox"]):not([type="radio"]),
        #karate-app-container select,
        #karate-app-container textarea {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-text-fill-color: #000000 !important;
            border: 1px solid #d1d5db !important;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
        }

        /* Placeholder color override */
        #karate-app-container ::placeholder {
            color: #6b7280 !important;
            opacity: 1 !important;
        }

        /* Disabled state override */
        #karate-app-container input:disabled,
        #karate-app-container select:disabled,
        #karate-app-container textarea:disabled {
            background-color: #f3f4f6 !important;
            background: #f3f4f6 !important;
            color: #6b7280 !important;
            -webkit-text-fill-color: #6b7280 !important;
            cursor: not-allowed !important;
        }

        /* Option elements inside select */
        #karate-app-container option {
            background-color: #ffffff !important;
            color: #000000 !important;
        }

        /* Autofill override - aggressively forces white background using box-shadow hack */
        #karate-app-container input:-webkit-autofill,
        #karate-app-container input:-webkit-autofill:hover, 
        #karate-app-container input:-webkit-autofill:focus, 
        #karate-app-container input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px white inset !important;
            box-shadow: 0 0 0 30px white inset !important;
            -webkit-text-fill-color: #000000 !important;
            color: #000000 !important;
            transition: background-color 5000s ease-in-out 0s;
            background-color: #ffffff !important;
        }
    `}</style>
);

// --- Reusable UI Components ---
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>
);
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{children}</button>
);
const TextInput: React.FC<{ label: string; id: string; name?: string; type?: string; placeholder?: string; defaultValue?: string | number; disabled?: boolean; icon?: React.ReactNode }> = ({ label, id, name, type = 'text', placeholder = '', defaultValue, disabled=false, icon }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">{icon}</div>}
            <input 
                type={type} 
                id={id} 
                name={name || id} 
                placeholder={placeholder} 
                defaultValue={defaultValue} 
                disabled={disabled} 
                style={{ backgroundColor: disabled ? '#f3f4f6' : '#ffffff', color: disabled ? '#6b7280' : '#000000' }}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary !bg-white !text-gray-900 disabled:!bg-gray-100 disabled:!text-gray-500 ${icon ? 'ps-10' : ''}`}
            />
        </div>
    </div>
);
const ToggleSwitch: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void }> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between py-3">
        <span className="text-sm font-medium text-gray-900">{label}</span>
        <button 
            type="button" 
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-primary' : 'bg-gray-200'}`}
        >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-0' : '-translate-x-5'}`} />
        </button>
    </div>
);

const FileUploadWithProgress: React.FC<{ label: string, description: string }> = ({ label, description }) => {
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setUploadStatus('uploading');
            setProgress(0);

            // Simulate upload progress
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        // Simulate success/error
                        const success = Math.random() > 0.2;
                        setUploadStatus(success ? 'success' : 'error');
                        return 100;
                    }
                    return prev + 10;
                });
            }, 200);
        }
    };
    
    const reset = () => {
        setUploadStatus('idle');
        setProgress(0);
        setFileName('');
    };

    if (uploadStatus === 'idle') {
        return (
             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <UploadCloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">{label}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
                <label className="mt-4 cursor-pointer px-4 py-2 bg-white text-sm font-semibold text-primary rounded-md border border-gray-300 hover:bg-gray-50">
                    انتخاب فایل
                    <input type="file" className="sr-only" onChange={handleFileChange} />
                </label>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
                 {uploadStatus === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500" />}
                 {uploadStatus === 'error' && <AlertCircleIcon className="w-6 h-6 text-red-500" />}
            </div>
             {uploadStatus === 'uploading' && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
                </div>
            )}
            {uploadStatus === 'success' && (
                 <div className="text-center mt-2">
                    <p className="text-sm text-green-600">آپلود موفقیت آمیز بود!</p>
                    <button onClick={reset} className="text-xs text-red-500 hover:underline mt-1">حذف فایل</button>
                 </div>
            )}
            {uploadStatus === 'error' && (
                 <div className="text-center mt-2">
                    <p className="text-sm text-red-600">آپلود با خطا مواجه شد.</p>
                    <button onClick={reset} className="text-xs text-primary hover:underline mt-1">تلاش مجدد</button>
                 </div>
            )}
        </div>
    );
};


const StatusBadge: React.FC<{ status: 'approved' | 'pending' | 'rejected' }> = ({ status }) => {
    const statusMap = {
        approved: { text: 'تایید شده', icon: <CheckCircleIcon className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
        pending: { text: 'در انتظار تایید', icon: <ClockIcon className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
        rejected: { text: 'رد شده', icon: <AlertCircleIcon className="w-4 h-4" />, color: 'bg-red-100 text-red-800' },
    };
    const { text, icon, color } = statusMap[status];
    return (<span className={`inline-flex items-center gap-x-1.5 rounded-md px-2 py-1 text-xs font-medium ${color}`}>{icon}{text}</span>);
};
const LoadingSpinner: React.FC = () => (<div className="flex justify-center items-center h-full p-16"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div></div>);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-full overflow-auto" onClick={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

// --- USER DASHBOARD PAGE COMPONENTS ---
const DashboardPage: React.FC<{ user: User }> = ({ user }) => {
    const infoItems = [{ label: 'کد ملی', value: user.nationalId }, { label: 'نام پدر', value: user.fatherName }, { label: 'تاریخ تولد', value: user.birthDate }, { label: 'کد اختصاصی', value: user.uniqueId }, { label: 'سبک', value: user.style }, { label: 'هیات', value: user.association }];
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1><p className="mt-2 text-gray-600">خوش آمدید، {user.name}!</p>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center border-b pb-6 mb-6">
                        <img src={user.avatarUrl} alt="User Avatar" className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0" />
                        <div className="me-4 sm:ms-4">
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500 font-mono tracking-wider mb-1">{user.nameLatin}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">{infoItems.map(item => (<div key={item.label} className="flex justify-between py-2 border-b border-gray-100"><span className="text-sm text-gray-500">{item.label}:</span><span className="font-semibold text-gray-800 text-sm">{item.value}</span></div>))}</div>
                </Card>
                <div className="space-y-6">
                    <Card className="bg-primary text-white">
                        <h3 className="font-semibold">وضعیت عضویت</h3><p className="mt-4 text-lg">تاریخ پایان عضویت: <span className="font-bold">{user.membershipEndDate}</span></p><div className="mt-2 flex items-center"><div className="w-full bg-white/30 rounded-full h-2.5"><div className="bg-white h-2.5 rounded-full" style={{ width: `${(user.daysRemaining / 365) * 100}%` }}></div></div><span className="me-3 text-sm font-medium">{user.daysRemaining} روز باقی‌مانده</span></div>
                    </Card>
                    <Card><h2 className="text-lg font-bold text-gray-800 mb-4">اطلاعیه‌ها</h2><div className="flex items-start"><div className="flex-shrink-0 pt-1"><AlertCircleIcon className="h-5 w-5 text-yellow-500"/></div><div className="me-3 flex-1"><p className="text-sm font-medium text-gray-900">مدارک هویتی شما رد شد.</p><p className="mt-1 text-sm text-gray-500">دلیل: تصویر کارت ملی ناخوانا است. لطفاً تصویر واضح‌تری بارگذاری کنید.</p></div></div></Card>
                </div>
            </div>
        </div>
    );
};
const PersonalInformationPage: React.FC<{user: User, onUpdate: () => void}> = ({ user, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<'basic' | 'docs' | 'identity'>('basic');
    const [isSaving, setIsSaving] = useState(false);

    const handleBasicInfoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        
        const updates: Partial<User> = {
            name: formData.get('displayName') as string,
        };
        
        await api.updateUserInfo(updates);
        await onUpdate();
        setIsSaving(false);
        alert('اطلاعات پایه با موفقیت به‌روزرسانی شد.');
    };

    const handleIdentitySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        
        const updates: Partial<User> = {
            nameLatin: (formData.get('firstNameLatin') as string) + ' ' + (formData.get('lastNameLatin') as string),
            fatherName: formData.get('fatherName') as string,
            fatherNameLatin: formData.get('fatherNameLatin') as string,
            nationalId: formData.get('nationalId') as string,
            birthCertNumber: formData.get('birthCertId') as string,
            gender: formData.get('gender') === 'مرد' ? 'male' : 'female',
            bloodType: formData.get('bloodType') as string,
            weight: Number(formData.get('weight')),
            height: Number(formData.get('height')),
            birthDate: formData.get('birthDateShamsi') as string,
            birthDateGregorian: formData.get('birthDateGregorian') as string,
            nationality: formData.get('nationality') as string,
            birthPlace: formData.get('birthPlace') as string,
            maritalStatus: formData.get('maritalStatus') as string,
            city: formData.get('city') as string,
            address: formData.get('address') as string,
            mobile: formData.get('mobile') as string,
            phone: formData.get('phone') as string,
        };

        await api.updateUserInfo(updates);
        await onUpdate();
        setIsSaving(false);
        alert('اطلاعات هویتی با موفقیت به‌روزرسانی شد.');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">اطلاعات شخصی</h1>
            <div className="mt-6 border-b border-gray-200 overflow-x-auto"><div className="flex space-s-4 pb-1"><TabButton active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>اطلاعات پایه</TabButton><TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')}>مدارک شخصی</TabButton><TabButton active={activeTab === 'identity'} onClick={() => setActiveTab('identity')}>اطلاعات هویتی تکمیلی</TabButton></div></div>
            <div className="mt-8">
                {activeTab === 'basic' && <Card><form onSubmit={handleBasicInfoSubmit} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><TextInput label="نام و نام خانوادگی" id="fullName" defaultValue={user.name} disabled/><TextInput label="نام نمایشی" id="displayName" name="displayName" defaultValue={user.name} /><TextInput label="آدرس ایمیل" id="email" type="email" defaultValue={`${user.nameLatin.toLowerCase().replace(' ','-')}@example.com`} disabled /></div><hr /><h3 className="text-lg font-medium text-gray-900">تغییر رمز عبور</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><TextInput label="رمز عبور فعلی" id="currentPassword" type="password" /><TextInput label="رمز عبور جدید" id="newPassword" type="password" /></div><div className="flex justify-start"><button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">{isSaving ? 'در حال ذخیره...' : 'ذخیره اطلاعات'}</button></div></form></Card>}
                {activeTab === 'docs' && <Card><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><FileUploadWithProgress label="تصویر پرسنلی" description="یک فایل PNG یا JPG آپلود کنید." /><FileUploadWithProgress label="روی کارت ملی" description="تصویر روی کارت ملی" /><FileUploadWithProgress label="شناسنامه (صفحه اول)" description="صفحه اول شناسنامه" /><FileUploadWithProgress label="شناسنامه (توضیحات)" description="صفحه توضیحات شناسنامه" /><FileUploadWithProgress label="تصویر گذرنامه" description="صفحه اصلی گذرنامه" /><FileUploadWithProgress label="بیمه ورزشی" description="کارت بیمه ورزشی معتبر" /><FileUploadWithProgress label="آخرین مدرک تحصیلی" description="گواهی تحصیلی" /><FileUploadWithProgress label="کارت پایان خدمت" description="مخصوص آقایان" /><FileUploadWithProgress label="سایر مدارک ۱" description="اختیاری" /></div><div className="flex justify-start mt-8"><button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">ذخیره مدارک</button></div></Card>}
                {activeTab === 'identity' && <Card><form onSubmit={handleIdentitySubmit} className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><TextInput label="نام (لاتین)" id="firstNameLatin" name="firstNameLatin" defaultValue={user.nameLatin.split(' ')[0]} /><TextInput label="نام خانوادگی (لاتین)" id="lastNameLatin" name="lastNameLatin" defaultValue={user.nameLatin.split(' ').slice(1).join(' ')} /><TextInput label="نام پدر" id="fatherName" name="fatherName" defaultValue={user.fatherName} /><TextInput label="نام پدر (لاتین)" id="fatherNameLatin" name="fatherNameLatin" defaultValue={user.fatherNameLatin} /><TextInput label="کد ملی" id="nationalId" name="nationalId" defaultValue={user.nationalId} /><TextInput label="شماره شناسنامه" id="birthCertId" name="birthCertId" defaultValue={user.birthCertNumber} /><div><label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">جنسیت</label><select id="gender" name="gender" defaultValue={user.gender === 'male' ? 'مرد' : 'زن'} style={{ backgroundColor: '#ffffff', color: '#000000' }} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary !bg-white !text-gray-900"><option>مرد</option><option>زن</option></select></div><div><label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 mb-1">گروه خونی</label><select id="bloodType" name="bloodType" defaultValue={user.bloodType} style={{ backgroundColor: '#ffffff', color: '#000000' }} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary !bg-white !text-gray-900"><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option></select></div><TextInput label="وزن (کیلوگرم)" id="weight" name="weight" type="number" defaultValue={user.weight} /><TextInput label="قد (سانتی‌متر)" id="height" name="height" type="number" defaultValue={user.height} /><TextInput label="تاریخ تولد (شمسی)" id="birthDateShamsi" name="birthDateShamsi" defaultValue={user.birthDate} placeholder="مثال: ۱۳۷۰/۰۱/۱۵" /><TextInput label="تاریخ تولد (میلادی)" id="birthDateGregorian" name="birthDateGregorian" defaultValue={user.birthDateGregorian} placeholder="مثال: 1991-04-04" /><TextInput label="ملیت" id="nationality" name="nationality" defaultValue={user.nationality} /><TextInput label="محل تولد" id="birthPlace" name="birthPlace" defaultValue={user.birthPlace} /><div><label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700 mb-1">وضعیت تاهل</label><select id="maritalStatus" name="maritalStatus" defaultValue={user.maritalStatus} style={{ backgroundColor: '#ffffff', color: '#000000' }} className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary !bg-white !text-gray-900"><option>مجرد</option><option>متاهل</option></select></div><TextInput label="شهر" id="city" name="city" defaultValue={user.city} /><TextInput label="آدرس" id="address" name="address" defaultValue={user.address} /><TextInput label="تلفن همراه" id="mobile" name="mobile" defaultValue={user.mobile} /><TextInput label="تلفن ثابت" id="phone" name="phone" defaultValue={user.phone} /></div><div className="flex justify-start pt-4"><button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400">{isSaving ? 'در حال ارسال...' : 'ارسال اطلاعات'}</button></div></form></Card>}
            </div>
        </div>
    );
};
const SportsInformationPage: React.FC<{ records: SportRecord[] }> = ({ records }) => {
    const [activeTab, setActiveTab] = useState<'belt' | 'coaching' | 'judging'>('belt');
    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-800">اطلاعات ورزشی</h1>
            <div className="mt-6 border-b border-gray-200"><div className="flex space-s-4"><TabButton active={activeTab === 'belt'} onClick={() => setActiveTab('belt')}>کمربند من</TabButton><TabButton active={activeTab === 'coaching'} onClick={() => setActiveTab('coaching')}>مربیگری من</TabButton><TabButton active={activeTab === 'judging'} onClick={() => setActiveTab('judging')}>داوری من</TabButton></div></div>
            <div className="mt-8">
                {activeTab === 'belt' && <Card><h2 className="text-xl font-bold text-gray-800 mb-4">ثبت حکم کمربند جدید</h2><form><div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><TextInput label="شماره حکم" id="beltCertNumber" /><TextInput label="سبک" id="beltStyle" /><TextInput label="درجه" id="beltRank" /><TextInput label="تاریخ آزمون" id="beltExamDate" placeholder="روز/ماه/سال" /><TextInput label="تاریخ صدور" id="beltIssueDate" placeholder="روز/ماه/سال" /><TextInput label="محل آزمون" id="beltLocation" /></div><div><FileUploadWithProgress label="تصویر حکم" description="تصویر حکم کمربند خود را آپلود کنید" /></div></div><div className="mt-6 flex justify-start border-t pt-6"><button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">ارسال</button></div></form><hr className="my-8"/><h2 className="text-xl font-bold text-gray-800 mb-4">احکام ثبت شده</h2><div className="space-y-4">{records.filter(r => r.type === 'belt').map(record => (<div key={record.id} className="border rounded-lg p-4 flex justify-between items-center"><div><p className="font-semibold">{record.rank} - {record.style}</p><p className="text-sm text-gray-500">شماره حکم: {record.certificateNumber} | تاریخ صدور: {record.issueDate}</p></div><StatusBadge status={record.status} /></div>))}</div></Card>}
                {activeTab === 'coaching' && <Card><h2 className="text-xl font-bold text-gray-800 mb-4">ثبت حکم مربیگری جدید</h2><form><div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><TextInput label="شماره حکم" id="coachCertNumber" /><TextInput label="سبک" id="coachStyle" /><TextInput label="درجه" id="coachRank" /><div><label htmlFor="coachExaminer" className="block text-sm font-medium text-gray-700 mb-1">آزمون گیرنده</label><select id="coachExaminer" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary !bg-white !text-gray-900" style={{ backgroundColor: '#ffffff', color: '#000000' }}><option>استاد فلانی</option><option>هیئت کاراته استان</option></select></div><TextInput label="تاریخ آغاز" id="coachStartDate" placeholder="روز/ماه/سال" /><TextInput label="تاریخ آزمون" id="coachExamDate" placeholder="روز/ماه/سال" /><div><label htmlFor="coachLocation" className="block text-sm font-medium text-gray-700 mb-1">محل آزمون</label><select id="coachLocation" className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary !bg-white !text-gray-900" style={{ backgroundColor: '#ffffff', color: '#000000' }}><option>تهران</option><option>اصفهان</option><option>شیراز</option></select></div></div><div><FileUploadWithProgress label="تصویر حکم" description="تصویر حکم مربیگری خود را آپلود کنید" /></div></div><div className="mt-6 flex justify-start border-t pt-6"><button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">ارسال</button></div></form><hr className="my-8"/><h2 className="text-xl font-bold text-gray-800 mb-4">احکام ثبت شده</h2><div className="space-y-4">{records.filter(r => r.type === 'coaching').map(record => (<div key={record.id} className="border rounded-lg p-4 flex justify-between items-center"><div><p className="font-semibold">مربیگری {record.rank} - {record.style}</p><p className="text-sm text-gray-500">شماره حکم: {record.certificateNumber} | تاریخ صدور: {record.issueDate}</p></div><StatusBadge status={record.status} /></div>))}</div></Card>}
                {activeTab === 'judging' && <Card><h2 className="text-xl font-bold text-gray-800 mb-4">ثبت حکم داوری جدید</h2><form><div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><TextInput label="شماره حکم" id="judgeCertNumber" /><TextInput label="سبک" id="judgeStyle" /><TextInput label="آزمون گیرنده" id="judgeExaminer" /><TextInput label="درجه کمیته" id="kumiteRank" /><TextInput label="سطح کمیته" id="kumiteLevel" /><TextInput label="درجه کاتا" id="kataRank" /><TextInput label="سطح کاتا" id="kataLevel" /><TextInput label="تاریخ آزمون" id="judgeExamDate" placeholder="روز/ماه/سال" /><TextInput label="تاریخ صدور" id="judgeIssueDate" placeholder="روز/ماه/سال" /><TextInput label="محل آزمون" id="judgeLocation" /></div><div><FileUploadWithProgress label="تصویر حکم" description="تصویر حکم داوری خود را آپلود کنید" /></div></div><div className="mt-6 flex justify-start border-t pt-6"><button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors">ارسال</button></div></form></Card>}
            </div>
        </div>
    );
};
const MyCoachPage: React.FC<{ coaches: Coach[], user: User, onCoachUpdate: (id: number) => void }> = ({ coaches, user, onCoachUpdate }) => {
    const [selectedId, setSelectedId] = useState<number | null>(user.selectedCoachId);
    const [isSaving, setIsSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [randomCoaches, setRandomCoaches] = useState<Coach[]>([]);

    useEffect(() => {
        if (coaches.length > 0) {
            const shuffled = [...coaches].sort(() => 0.5 - Math.random());
            setRandomCoaches(shuffled.slice(0, 8)); // Display 8 random coaches
        }
    }, [coaches]);

    const handleSave = () => {
        if (selectedId === null) return;
        setIsSaving(true);
        api.updateSelectedCoach(selectedId).then(() => {
            onCoachUpdate(selectedId);
            setIsSaving(false);
        });
    };
    
    const currentCoach = coaches.find(c => c.id === user.selectedCoachId);

    const searchResults = searchQuery.length > 1
        ? coaches.filter(coach =>
            coach.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

    const coachesToDisplay = searchQuery.length > 1 ? searchResults : randomCoaches;
    const listTitle = searchQuery.length > 1 ? `نتایج جستجو برای "${searchQuery}"` : 'مربیان پیشنهادی';

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">مربی من</h1>
            <p className="mt-2 text-gray-600">مربی فعلی خود را مشاهده و در صورت نیاز آن را تغییر دهید.</p>
            
            {currentCoach && (
                <Card className="mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">مربی فعلی شما</h2>
                    <div className="flex items-center">
                        <img src={currentCoach.avatarUrl} alt={currentCoach.name} className="w-16 h-16 rounded-full object-cover"/>
                        <div className="ms-4">
                            <p className="font-bold text-lg text-gray-900">{currentCoach.name}</p>
                            <p className="text-sm text-gray-500">{currentCoach.style}</p>
                        </div>
                    </div>
                </Card>
            )}

            <Card className="mt-6">
                 <h2 className="text-xl font-bold text-gray-800 mb-4">انتخاب مربی جدید</h2>
                 <div className="relative mb-4">
                     <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                         <SearchIcon className="w-4 h-4 text-gray-500" />
                     </div>
                     <input 
                         type="search" 
                         placeholder="جستجوی نام مربی..." 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         style={{ backgroundColor: '#ffffff', color: '#000000' }}
                         className="block w-full p-2 ps-10 text-sm !text-gray-900 border border-gray-300 rounded-lg !bg-white focus:ring-primary focus:border-primary"
                     />
                 </div>
                 
                 <h3 className="text-lg font-semibold text-gray-700 mb-4">{listTitle}</h3>
                 
                 {coachesToDisplay.length > 0 ? (
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {coachesToDisplay.map(coach => (
                            <div 
                                key={coach.id} 
                                onClick={() => setSelectedId(coach.id)}
                                className={`p-4 border-2 rounded-lg text-center cursor-pointer transition-all duration-200 ${selectedId === coach.id ? 'border-primary bg-primary-extralight ring-2 ring-primary' : 'border-gray-200 hover:border-primary-light'}`}
                            >
                                <img src={coach.avatarUrl} alt={coach.name} className="w-20 h-20 rounded-full object-cover mx-auto"/>
                                <p className="font-semibold mt-3 text-sm">{coach.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{coach.style}</p>
                            </div>
                        ))}
                     </div>
                 ) : (
                    <div className="text-center py-8 text-gray-500">
                        {searchQuery.length > 1 ? 'مربی با این نام یافت نشد.' : (randomCoaches.length === 0 ? <div className="p-8"><LoadingSpinner /></div> : 'مربی برای نمایش وجود ندارد.')}
                    </div>
                 )}
                 <div className="mt-6 flex justify-start">
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving || selectedId === user.selectedCoachId || selectedId === null}
                        className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                 </div>
            </Card>
        </div>
    );
};
const EventsPage: React.FC<{ events: Event[] }> = ({ events }) => {
    const [activeTab, setActiveTab] = useState<EventCategory>('competitions');

    const filteredEvents = events.filter(event => event.category === activeTab);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800">رویدادهای جاری</h1>
            <p className="mt-2 text-gray-600">در رویدادهای پیش رو ثبت نام کنید و مهارت‌های خود را به چالش بکشید.</p>
            
            <div className="mt-6 border-b border-gray-200">
                <div className="flex space-s-4">
                    <TabButton active={activeTab === 'competitions'} onClick={() => setActiveTab('competitions')}>مسابقات</TabButton>
                    <TabButton active={activeTab === 'training'} onClick={() => setActiveTab('training')}>آموزش</TabButton>
                    <TabButton active={activeTab === 'judging'} onClick={() => setActiveTab('judging')}>داوری</TabButton>
                    <TabButton active={activeTab === 'certificates'} onClick={() => setActiveTab('certificates')}>احکام</TabButton>
                </div>
            </div>

            <div className="mt-8">
                {filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map(event => (
                            <Card key={event.id} className="flex flex-col">
                                <h2 className="text-lg font-bold text-gray-900">{event.title}</h2>
                                <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                                <p className="mt-4 text-gray-700 flex-grow">{event.description}</p>
                                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm text-gray-500">هزینه: <span className="font-semibold text-gray-800">{event.price.toLocaleString()} تومان</span></p>
                                        <p className="text-sm text-gray-500">ظرفیت: <span className="font-semibold text-gray-800">{event.capacity} نفر</span></p>
                                    </div>
                                    {event.registered ? (
                                        <button disabled className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg text-sm cursor-not-allowed">ثبت‌نام شده</button>
                                    ) : (
                                        <button className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors text-sm">ثبت‌نام و پرداخت</button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <p className="text-gray-500">در حال حاضر رویدادی در این دسته بندی وجود ندارد.</p>
                    </Card>
                )}
            </div>
        </div>
    );
};
const FinancialsPage: React.FC<{ records: FinancialRecord[] }> = ({ records }) => { const statusClasses = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', failed: 'bg-red-100 text-red-800', }; const statusText = { paid: 'پرداخت شده', pending: 'در انتظار پرداخت', failed: 'ناموفق', }; return ( <div><h1 className="text-3xl font-bold text-gray-800">امور مالی</h1><p className="mt-2 text-gray-600">تاریخچه تراکنش‌ها و پرداخت‌های شما.</p><Card className="mt-8"><div className="overflow-x-auto"><table className="w-full text-sm text-right text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th scope="col" className="px-6 py-3">تاریخ</th><th scope="col" className="px-6 py-3">شرح</th><th scope="col" className="px-6 py-3">مبلغ (تومان)</th><th scope="col" className="px-6 py-3">وضعیت</th></tr></thead><tbody>{records.map(record => (<tr key={record.id} className="bg-white border-b hover:bg-gray-50"><td className="px-6 py-4">{record.date}</td><td className="px-6 py-4 font-medium text-gray-900">{record.description}</td><td className="px-6 py-4">{record.amount.toLocaleString()}</td><td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClasses[record.status]}`}>{statusText[record.status]}</span></td></tr>))}</tbody></table></div></Card></div>);};

// --- ADMIN DASHBOARD COMPONENTS ---
const AdminDashboardPage: React.FC<{ users: AdminUser[] }> = ({ users }) => {
    const stats = [{ label: 'کل کاربران', value: users.length, icon: UsersIcon, color: 'bg-primary' }, { label: 'در انتظار بررسی', value: users.filter(u => u.status === 'pending').length, icon: ClockIcon, color: 'bg-yellow-500' }, { label: 'اعضای تایید شده', value: users.filter(u => u.status === 'approved').length, icon: CheckCircleIcon, color: 'bg-green-500' }, { label: 'رد شده', value: users.filter(u => u.status === 'rejected').length, icon: AlertCircleIcon, color: 'bg-red-500' }];
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">گزارش‌ها</h1>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{stats.map(stat => (<div key={stat.label} className="bg-white p-6 rounded-lg shadow flex items-center"><div className={`p-3 rounded-full text-white ${stat.color}`}><stat.icon className="w-6 h-6" /></div><div className="ms-4"><p className="text-gray-500">{stat.label}</p><p className="text-2xl font-bold text-gray-900">{stat.value}</p></div></div>))}</div>
            <div className="mt-8 bg-white p-6 rounded-lg shadow"><h2 className="text-lg font-bold text-gray-900 mb-4">کاربران اخیر</h2><div className="overflow-x-auto"><table className="w-full text-sm text-right text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">نام</th><th className="px-6 py-3">تاریخ عضویت</th><th className="px-6 py-3">وضعیت</th></tr></thead><tbody>{users.slice(0, 5).map(user => (<tr key={user.id} className="bg-white border-b"><td className="px-6 py-4 font-medium text-gray-900">{user.name}</td><td className="px-6 py-4">{user.joinDate}</td><td className="px-6 py-4"><StatusBadge status={user.status} /></td></tr>))}</tbody></table></div></div>
        </div>
    );
};
const AdminUsersListPage: React.FC<{ users: AdminUser[], onSelectUser: (user: AdminUser) => void }> = ({ users, onSelectUser }) => (
    <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">لیست کاربران</h1>
        <div className="flex justify-between items-center mb-4"><div className="relative"><div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"><SearchIcon className="w-4 h-4 text-gray-500" /></div><input type="search" placeholder="جستجو کاربر..." style={{ backgroundColor: '#ffffff', color: '#000000' }} className="block p-2 ps-10 text-sm !text-gray-900 border border-gray-300 rounded-lg w-80 !bg-white focus:ring-primary focus:border-primary" /></div><div><select style={{ backgroundColor: '#ffffff', color: '#000000' }} className="!bg-white border border-gray-300 !text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"><option value="">همه وضعیت‌ها</option><option value="pending">در انتظار تایید</option><option value="approved">تایید شده</option><option value="rejected">رد شده</option></select></div></div>
        <div className="overflow-x-auto"><table className="w-full text-sm text-right text-gray-500"><thead className="text-xs text-gray-700 uppercase bg-gray-50"><tr><th className="px-6 py-3">کاربر</th><th className="px-6 py-3">کد ملی</th><th className="px-6 py-3">تاریخ عضویت</th><th className="px-6 py-3">وضعیت</th><th className="px-6 py-3">عملیات</th></tr></thead><tbody>{users.map(user => (<tr key={user.id} className="bg-white border-b hover:bg-gray-50"><td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap flex items-center"><img className="w-8 h-8 rounded-full" src={user.avatarUrl} alt={user.name} /><span className="ps-3">{user.name}</span></td><td className="px-6 py-4">{user.nationalId}</td><td className="px-6 py-4">{user.joinDate}</td><td className="px-6 py-4"><StatusBadge status={user.status} /></td><td className="px-6 py-4"><button onClick={() => onSelectUser(user)} className="font-medium text-primary hover:underline">مشاهده</button></td></tr>))}</tbody></table></div>
    </div>
);
const AdminUserDetailPage: React.FC<{ user: AdminUser, onBack: () => void }> = ({ user, onBack }) => {
    const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageUrl, setModalImageUrl] = useState('');

    useEffect(() => {
        setLoading(true);
        api.getAdminUserDetail(user.id).then(data => {
            setUserDetail(data);
            setLoading(false);
        });
    }, [user.id]);

    const openModal = (url: string) => {
        setModalImageUrl(url);
        setIsModalOpen(true);
    };
    
    const handleDownload = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDelete = async (docId: string) => {
        if (!window.confirm('آیا از حذف این مدرک اطمینان دارید؟')) return;
        if (!userDetail) return;
        
        await api.deleteUserDocument(user.id, docId);
        const updatedDocs = userDetail.documents.filter(d => d.id !== docId);
        setUserDetail({ ...userDetail, documents: updatedDocs });
    };

    const handleDocStatusChange = (docId: string, status: 'approved' | 'rejected') => {
        if (!userDetail) return;
        const updatedDocs = userDetail.documents.map(doc => 
            doc.id === docId ? { ...doc, status } : doc
        );
        setUserDetail({ ...userDetail, documents: updatedDocs });
    };

    if (loading || !userDetail) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <button onClick={onBack} className="text-primary hover:underline mb-4 text-sm">&larr; بازگشت به لیست کاربران</button>
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">بررسی کاربر: {userDetail.name}</h1>
                        <p className="text-gray-500">تاریخ عضویت: {userDetail.joinDate}</p>
                    </div>
                    <StatusBadge status={userDetail.status} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">اطلاعات پایه</h2>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><span className="text-gray-500">نام:</span> {userDetail.name}</p>
                                <p><span className="text-gray-500">کد ملی:</span> {userDetail.nationalId}</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">بررسی مدارک ارسالی</h2>
                            {userDetail.documents.length === 0 ? (
                                <p className="text-sm text-gray-500">هیچ مدرکی برای بررسی وجود ندارد.</p>
                            ) : (
                                <div className="space-y-4">
                                    {userDetail.documents.map(doc => (
                                        <div key={doc.id} className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4">
                                                    <p className="font-semibold text-gray-900">{doc.docType}</p>
                                                    <StatusBadge status={doc.status} />
                                                </div>
                                                {doc.status === 'rejected' && doc.rejectionReason && (
                                                    <p className="text-xs text-red-600 mt-1">دلیل رد: {doc.rejectionReason}</p>
                                                )}
                                                <div className="flex gap-3 mt-2">
                                                    <button onClick={() => openModal(doc.fileUrl)} className="flex items-center text-primary hover:underline text-sm"><EyeIcon className="w-4 h-4 mr-1"/> مشاهده</button>
                                                    <button onClick={() => handleDownload(doc.fileUrl, `${doc.docType}-${userDetail.name}.jpg`)} className="flex items-center text-gray-600 hover:text-gray-900 text-sm"><DownloadIcon className="w-4 h-4 mr-1"/> دانلود</button>
                                                    <button onClick={() => handleDelete(doc.id)} className="flex items-center text-red-500 hover:text-red-700 text-sm"><Trash2Icon className="w-4 h-4 mr-1"/> حذف</button>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 flex gap-2 self-end sm:self-center">
                                                <button onClick={() => handleDocStatusChange(doc.id, 'approved')} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded hover:bg-green-200 disabled:opacity-50" disabled={doc.status === 'approved'}>تایید</button>
                                                <button onClick={() => handleDocStatusChange(doc.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded hover:bg-red-200 disabled:opacity-50" disabled={doc.status === 'rejected'}>رد</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg self-start">
                         <h3 className="font-semibold text-gray-800 mb-4">عملیات کلی کاربر</h3>
                         <div className="space-y-3">
                            <button className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">تایید نهایی کاربر</button>
                            <button className="w-full px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">رد نهایی کاربر</button>
                            <hr className="my-2"/>
                            <textarea placeholder="دلیل رد نهایی (اختیاری)" rows={3} style={{ backgroundColor: '#ffffff', color: '#000000' }} className="w-full p-2 border border-gray-300 rounded-lg text-sm !bg-white !text-gray-900"></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div className="p-4">
                    <img src={modalImageUrl} alt="Document View" className="w-full h-auto rounded-md" />
                </div>
            </Modal>
        </div>
    );
};
const AdminSettingsPage: React.FC<{ settings: AdminSettings }> = ({ settings }) => (
    <div className="bg-white p-6 rounded-lg shadow max-w-2xl"><h1 className="text-2xl font-bold text-gray-900 mb-6">تنظیمات افزونه</h1><form className="space-y-6"><TextInput label="شناسه محصول ووکامرس" id="wooId" defaultValue={settings.woocommerceProductId} /><TextInput label="حداکثر حجم آپلود فایل (MB)" id="maxSize" type="number" defaultValue={settings.maxUploadSizeMb} /><div><label className="block text-sm font-medium text-gray-700 mb-1">انواع فایل مجاز</label><input type="text" defaultValue={settings.allowedFileTypes.join(', ')} style={{ backgroundColor: '#ffffff', color: '#000000' }} className="w-full px-3 py-2 border border-gray-300 rounded-lg !bg-white !text-gray-900" placeholder="مثال: jpg, png, pdf" /><p className="text-xs text-gray-500 mt-1">فرمت‌ها را با کاما (,) جدا کنید.</p></div><div className="pt-2"><button type="submit" className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark">ذخیره تنظیمات</button></div></form></div>
);
const AdminFrontendConfigPage: React.FC = () => {
    const [config, setConfig] = useState<FrontendConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.getFrontendConfig().then(data => {
            setConfig(data);
            setLoading(false);
        });
    }, []);

    const handleToggle = (key: keyof FrontendConfig, value: boolean) => {
        if (config) {
            setConfig({ ...config, [key]: value });
        }
    };

    const handleSave = () => {
        if (config) {
            setSaving(true);
            api.updateFrontendConfig(config).then(() => {
                setSaving(false);
            });
        }
    };

    if (loading || !config) return <LoadingSpinner />;

    return (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">مدیریت پوسته کاربر</h1>
            <p className="text-gray-600 mb-6">در اینجا می‌توانید بخش‌های مختلف پنل کاربری را فعال یا غیرفعال کنید.</p>
            <div className="space-y-2 divide-y divide-gray-100">
                <ToggleSwitch label="نمایش بخش اطلاعات ورزشی" checked={config.enableSportsInfo} onChange={(v) => handleToggle('enableSportsInfo', v)} />
                <ToggleSwitch label="نمایش بخش مربی من" checked={config.enableMyCoach} onChange={(v) => handleToggle('enableMyCoach', v)} />
                <ToggleSwitch label="نمایش بخش رویدادهای جاری" checked={config.enableEvents} onChange={(v) => handleToggle('enableEvents', v)} />
                <ToggleSwitch label="نمایش بخش امور مالی" checked={config.enableFinancials} onChange={(v) => handleToggle('enableFinancials', v)} />
            </div>
            <div className="mt-8 pt-4 border-t">
                <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark disabled:bg-gray-400">
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
            </div>
        </div>
    );
};
const AdminDataManagementPage: React.FC = () => {
    const [managedData, setManagedData] = useState<{ [key: string]: ManagedItem[] } | null>(null);
    const [coaches, setCoaches] = useState<Coach[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'basic' | 'coaches'>('basic');
    
    // Coach Modal State
    const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
    const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

    const refreshData = () => {
        setLoading(true);
        Promise.all([api.getManagedData(), api.getCoaches()]).then(([data, coachesData]) => {
            setManagedData(data);
            setCoaches(coachesData);
            setLoading(false);
        });
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleAddItem = async (type: string, inputId: string) => {
        const input = document.getElementById(inputId) as HTMLInputElement;
        if (input && input.value.trim()) {
            await api.addManagedItem(type, input.value.trim());
            input.value = '';
            refreshData();
        }
    };

    const handleDeleteItem = async (type: string, id: number) => {
        if(window.confirm('آیا از حذف این مورد اطمینان دارید؟')) {
            await api.deleteManagedItem(type, id);
            refreshData();
        }
    };

    const handleSaveCoach = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const coachData = {
            name: formData.get('name') as string,
            style: formData.get('style') as string,
            avatarUrl: formData.get('avatarUrl') as string || 'https://i.pravatar.cc/150?u=default',
        };

        if (editingCoach) {
            await api.updateCoach({ ...editingCoach, ...coachData });
        } else {
            await api.addCoach(coachData as any);
        }
        setIsCoachModalOpen(false);
        setEditingCoach(null);
        refreshData();
    };

    const handleDeleteCoach = async (id: number) => {
         if(window.confirm('آیا از حذف این مربی اطمینان دارید؟')) {
             await api.deleteCoach(id);
             refreshData();
         }
    };

    const openCoachModal = (coach?: Coach) => {
        setEditingCoach(coach || null);
        setIsCoachModalOpen(true);
    }

    if (loading || !managedData || !coaches) return <LoadingSpinner />;

    const dataLabels: { [key: string]: string } = { styles: 'سبک‌ها', examiners: 'آزمون گیرنده‌ها', locations: 'محل‌های آزمون' };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">مدیریت داده‌ها</h1>
            
            <div className="flex space-s-4 mb-6 border-b pb-1">
                 <TabButton active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>اطلاعات پایه</TabButton>
                 <TabButton active={activeTab === 'coaches'} onClick={() => setActiveTab('coaches')}>مدیریت مربیان</TabButton>
            </div>

            {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.keys(managedData).map(key => (
                        <div key={key} className="border p-4 rounded-lg bg-gray-50">
                            <h2 className="font-bold text-gray-800 mb-3">{dataLabels[key]}</h2>
                            <ul className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                {managedData[key].map(item => (
                                    <li key={item.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                                        <button onClick={() => handleDeleteItem(key, item.id)} className="p-1 hover:bg-red-100 rounded">
                                            <Trash2Icon className="w-4 h-4 text-red-500" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="flex gap-2">
                                <input id={`input-${key}`} type="text" placeholder="نام جدید..." style={{ backgroundColor: '#ffffff', color: '#000000' }} className="flex-grow p-2 text-sm border border-gray-300 rounded-lg focus:ring-primary focus:border-primary !bg-white !text-gray-900"/>
                                <button onClick={() => handleAddItem(key, `input-${key}`)} className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark">
                                    <PlusCircleIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'coaches' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">لیست مربیان</h2>
                        <button onClick={() => openCoachModal()} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm">
                            <PlusCircleIcon className="w-4 h-4 ms-2"/> افزودن مربی
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3">نام مربی</th>
                                    <th className="px-6 py-3">سبک</th>
                                    <th className="px-6 py-3">عملیات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coaches.map(coach => (
                                    <tr key={coach.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 flex items-center font-medium text-gray-900">
                                            <img src={coach.avatarUrl} alt="" className="w-8 h-8 rounded-full me-3 object-cover"/>
                                            {coach.name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-900">{coach.style}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-3">
                                                <button onClick={() => openCoachModal(coach)} className="text-blue-600 hover:underline flex items-center"><EditIcon className="w-4 h-4 me-1"/> ویرایش</button>
                                                <button onClick={() => handleDeleteCoach(coach.id)} className="text-red-600 hover:underline flex items-center"><Trash2Icon className="w-4 h-4 me-1"/> حذف</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Modal isOpen={isCoachModalOpen} onClose={() => setIsCoachModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{editingCoach ? 'ویرایش مربی' : 'افزودن مربی جدید'}</h2>
                    <form onSubmit={handleSaveCoach} className="space-y-4">
                        <TextInput label="نام و نام خانوادگی" id="coachName" name="name" defaultValue={editingCoach?.name} />
                        <TextInput label="سبک تخصصی" id="coachStyleInput" name="style" defaultValue={editingCoach?.style} />
                        <TextInput label="لینک تصویر پروفایل" id="coachAvatar" name="avatarUrl" defaultValue={editingCoach?.avatarUrl} placeholder="https://..." />
                        
                        <div className="flex justify-end pt-4 gap-3">
                            <button type="button" onClick={() => setIsCoachModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">انصراف</button>
                            <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark">ذخیره</button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};
const AdminShortcodesPage: React.FC = () => {
    const shortcode = '[karate_user_dashboard]';
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shortcode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">کدهای کوتاه</h1>
            <p className="text-gray-600 mb-6">از کدهای کوتاه زیر برای نمایش پنل کاربری در برگه‌ها یا نوشته‌های خود استفاده کنید.</p>
            <div className="border rounded-lg p-4 bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-800">پنل کاربری</h2>
                <p className="text-sm text-gray-500 mt-1 mb-4">این کد کوتاه، پنل کاربری کامل را برای کاربر وارد شده نمایش می‌دهد.</p>
                <div className="flex items-center gap-2 bg-gray-200 p-3 rounded-md">
                    <code className="text-gray-800 font-mono flex-grow">{shortcode}</code>
                    <button onClick={copyToClipboard} className="px-4 py-1.5 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-dark">
                        {copied ? 'کپی شد!' : 'کپی'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- LAYOUT COMPONENTS ---
const UserLayout: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>('dashboard');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [sportsRecords, setSportsRecords] = useState<SportRecord[] | null>(null);
    const [events, setEvents] = useState<Event[] | null>(null);
    const [financials, setFinancials] = useState<FinancialRecord[] | null>(null);
    const [coaches, setCoaches] = useState<Coach[] | null>(null);
    const [frontendConfig, setFrontendConfig] = useState<FrontendConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = () => {
        api.getCurrentUser().then(setCurrentUser);
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.getCurrentUser(),
            api.getSportsRecords(),
            api.getEvents(),
            api.getFinancials(),
            api.getCoaches(),
            api.getFrontendConfig(),
        ]).then(([user, sports, evts, fins, coachList, config]) => {
            setCurrentUser(user);
            setSportsRecords(sports);
            setEvents(evts);
            setFinancials(fins);
            setCoaches(coachList);
            setFrontendConfig(config);
            setLoading(false);
        });
    }, []);

    // Determine available menu items based on config
    const getMenuItems = () => {
        const items = [
            { id: 'dashboard', label: 'داشبورد', icon: DashboardIcon },
            { id: 'personal-info', label: 'اطلاعات شخصی', icon: UserIcon },
        ];
        
        if (frontendConfig?.enableSportsInfo) items.push({ id: 'sports-info', label: 'اطلاعات ورزشی', icon: ShieldIcon });
        if (frontendConfig?.enableMyCoach) items.push({ id: 'my-coach', label: 'مربی من', icon: UsersIcon });
        if (frontendConfig?.enableEvents) items.push({ id: 'events', label: 'رویدادهای جاری', icon: CalendarIcon });
        if (frontendConfig?.enableFinancials) items.push({ id: 'financials', label: 'امور مالی', icon: DollarSignIcon });
        
        return items as { id: Page; label: string; icon: any }[];
    };

    const handleCoachUpdate = (coachId: number) => {
        if (currentUser) {
            setCurrentUser({ ...currentUser, selectedCoachId: coachId });
        }
    };

    const renderContent = () => {
        if (loading || !currentUser || !sportsRecords || !events || !financials || !coaches) return <LoadingSpinner />;
        switch (activePage) {
            case 'dashboard': return <DashboardPage user={currentUser} />;
            case 'personal-info': return <PersonalInformationPage user={currentUser} onUpdate={refreshUser}/>;
            case 'sports-info': return frontendConfig?.enableSportsInfo ? <SportsInformationPage records={sportsRecords} /> : null;
            case 'my-coach': return frontendConfig?.enableMyCoach ? <MyCoachPage coaches={coaches} user={currentUser} onCoachUpdate={handleCoachUpdate} /> : null;
            case 'events': return frontendConfig?.enableEvents ? <EventsPage events={events} /> : null;
            case 'financials': return frontendConfig?.enableFinancials ? <FinancialsPage records={financials} /> : null;
            default: return <DashboardPage user={currentUser} />;
        }
    };
    
    const menuItems = getMenuItems();
    
    return (
        <div className="bg-gray-50 min-h-screen flex">
            <aside className="w-64 bg-white shadow-lg flex flex-col">
                 <div className="h-20 flex items-center justify-center border-b"> <h1 className="text-2xl font-bold text-primary">پنل کاربری</h1> </div>
                <nav className="flex-grow px-4 py-6 space-y-2">{menuItems.map(item => (<a key={item.id} href="#" onClick={(e) => { e.preventDefault(); setActivePage(item.id); }} className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${ activePage === item.id ? 'bg-primary text-white shadow' : 'text-gray-600 hover:bg-gray-100' }`}><item.icon className="w-5 h-5 me-3" /> <span className="font-medium">{item.label}</span></a>))}</nav>
                <div className="px-4 py-6 border-t"><a href={`/wp-login.php?action=logout`} className="flex items-center px-4 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100"><LogoutIcon className="w-5 h-5 me-3" /> <span className="font-medium">خروج</span></a></div>
            </aside>
            <main className="flex-1">
                 <header className="h-20 bg-white shadow-sm flex items-center justify-end px-8"><div className="flex items-center"><span className="font-semibold text-gray-700">{currentUser?.name || '...'}</span><img src={currentUser?.avatarUrl} alt="User Avatar" className="w-10 h-10 rounded-full object-cover ms-4" /></div></header>
                <div className="p-8">{renderContent()}</div>
            </main>
        </div>
    );
};

const AdminLayout: React.FC = () => {
    const [adminView, setAdminView] = useState<AdminView>('dashboard');
    const [adminUsers, setAdminUsers] = useState<AdminUser[] | null>(null);
    const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getAdminUsers(),
            api.getAdminSettings(),
        ]).then(([users, settings]) => {
            setAdminUsers(users);
            setAdminSettings(settings);
            setLoading(false);
        })
    }, []);

    const menuItems = [
        { id: 'dashboard', label: 'گزارش‌ها', icon: DashboardIcon }, 
        { id: 'users', label: 'کاربران', icon: UsersIcon }, 
        { id: 'frontend-config', label: 'مدیریت پوسته', icon: PaletteIcon }, 
        { id: 'data-management', label: 'مدیریت داده‌ها', icon: DatabaseIcon }, 
        { id: 'settings', label: 'تنظیمات', icon: SettingsIcon }, 
        { id: 'shortcodes', label: 'کدهای کوتاه', icon: CodeIcon }
    ] as const;
    
    const AdminHeaderNav = () => (
         <div className="mb-6 border-b border-gray-200 bg-white p-4 rounded-lg shadow">
             <div className="flex items-center mb-4">
                <div className="p-2 bg-primary rounded-lg text-white mr-3 ml-3">
                    <ShieldIcon className="w-6 h-6"/>
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900">پیشخوان افزونه هیولا داشبورد</h1>
                    <p className="text-xs text-gray-500">نسخه ۱.۰.۰</p>
                </div>
             </div>
             <nav className="-mb-px flex space-x-6 overflow-x-auto pb-2" aria-label="Tabs">
                 {menuItems.map(item => (
                     <a key={item.id} href="#" onClick={e => { e.preventDefault(); setAdminView(item.id as AdminView); setSelectedUser(null); }}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${ adminView === item.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                         <item.icon className="w-5 h-5" />
                         {item.label}
                     </a>
                 ))}
             </nav>
         </div>
    );

    const renderContent = () => {
        if (loading || !adminUsers || !adminSettings) return <LoadingSpinner />;
        switch (adminView) {
            case 'dashboard': return <AdminDashboardPage users={adminUsers} />;
            case 'users': return <AdminUsersListPage users={adminUsers} onSelectUser={(user) => { setSelectedUser(user); setAdminView('user-detail'); }} />;
            case 'user-detail': return selectedUser ? <AdminUserDetailPage user={selectedUser} onBack={() => { setAdminView('users'); setSelectedUser(null); }} /> : null;
            case 'frontend-config': return <AdminFrontendConfigPage />;
            case 'settings': return <AdminSettingsPage settings={adminSettings} />;
            case 'data-management': return <AdminDataManagementPage />;
            case 'shortcodes': return <AdminShortcodesPage />;
            default: return <AdminDashboardPage users={adminUsers} />;
        }
    };
    
    return (
        <div className="p-8 bg-gray-100 min-h-screen text-right" dir="rtl">
            <AdminHeaderNav />
            {renderContent()}
        </div>
    );
};

// --- Main App Component ---
const App: React.FC = () => {
    const { view: initialView } = window.karateDashboardData;
    const [currentView, setCurrentView] = useState<'user' | 'admin'>(initialView);

    return (
        <div id="karate-app-container" className="min-h-screen bg-gray-50 text-right" dir="rtl">
            <GlobalStyles />
            <div className="pt-12">
                <div className="fixed top-0 left-0 right-0 h-12 bg-gray-900 text-white flex items-center justify-between px-4 z-[100] shadow-lg">
                    <span className="font-mono text-xs text-gray-400">Karate Plugin Dev Toolbar</span>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setCurrentView('user')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${currentView === 'user' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            پنل کاربر
                        </button>
                        <button 
                            onClick={() => setCurrentView('admin')}
                            className={`px-3 py-1 rounded text-xs font-bold transition-colors ${currentView === 'admin' ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            پنل مدیریت
                        </button>
                    </div>
                </div>
                {currentView === 'admin' ? <AdminLayout /> : <UserLayout />}
            </div>
        </div>
    );
};

export default App;
