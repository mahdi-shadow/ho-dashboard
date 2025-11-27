


// This file contains functions to fetch data from the WordPress REST API.
// NOTE: For this demonstration, they return mock data with a simulated delay.
// In a real implementation, they would use `fetch()` to call actual REST endpoints.

import type { User, Event, FinancialRecord, SportRecord, AdminUser, AdminSettings, FrontendConfig, ManagedItem, AdminUserDetail, UserDocument, Coach } from './types';

// In a real app, this would be read from the localized script data.
// const { apiUrl, nonce } = window.karateDashboardData || { apiUrl: '', nonce: '' };
// const apiFetch = async (path: string) => { /* fetch logic here */ };

// --- MOCK DATA FOR DEMONSTRATION ---
// This data would be fetched from your WordPress backend.
const mockUser: User = {
  name: 'آرش شفیعی',
  nameLatin: 'Arash Shafiei',
  avatarUrl: 'https://i.pravatar.cc/150?u=arash',
  membershipEndDate: '۱۴۰۴/۰۵/۱۵',
  daysRemaining: 280,
  nationalId: '۱۲۳۴۵۶۷۸۹۰',
  fatherName: 'رضا',
  birthDate: '۱۳۷۰/۰۱/۱۵',
  association: 'هیات کاراته استان تهران',
  style: 'کیوکوشین سنتی',
  uniqueId: 'IRN-910404-1',
  selectedCoachId: 3,
  gender: 'male',
  nationality: 'ایرانی',
  mobile: '09123456789',
  province: 'تهران',
};

const mockSportsRecords: SportRecord[] = [
  { id: 'belt1', type: 'belt', certificateNumber: 'B-12345', style: 'کیوکوشین سنتی', rank: 'کمربند مشکی دان ۱', examDate: '۱۴۰۲/۱۱/۲۰', issueDate: '۱۴۰۲/۱۲/۰۱', location: 'تهران', status: 'approved', },
  { id: 'coach1', type: 'coaching', certificateNumber: 'C-67890', style: 'کیوکوشین سنتی', rank: 'درجه ۳', examDate: '۱۴۰۳/۰۲/۱۰', issueDate: '۱۴۰۳/۰۲/۲۰', location: 'اصفهان', status: 'pending', },
];

const mockEvents: Event[] = [
  { id: 'evt1', title: 'مسابقات قهرمانی کشور', date: '۱۴۰۳/۰۸/۲۵', capacity: 50, price: 250000, registered: true, description: 'مسابقات سالانه کیوکوشین کاراته ایران در رده سنی بزرگسالان.', category: 'competitions' },
  { id: 'evt2', title: 'دوره داوری درجه ۳', date: '۱۴۰۳/۰۹/۱۰', capacity: 30, price: 400000, registered: false, description: 'دوره آموزشی تئوری و عملی داوری برای ارتقا به درجه ۳.', category: 'judging' },
  { id: 'evt3', title: 'اردوی آمادگی تیم ملی', date: '۱۴۰۳/۱۰/۰۵', capacity: 20, price: 750000, registered: false, description: 'اردوی انتخابی و آمادگی تیم ملی برای مسابقات آسیایی.', category: 'training' },
  { id: 'evt4', title: 'آزمون ارتقاء کمربند دان ۱ تا ۳', date: '۱۴۰۳/۱۱/۱۵', capacity: 100, price: 350000, registered: false, description: 'آزمون رسمی فدراسیون برای ارتقاء رتبه کمربندهای مشکی.', category: 'certificates' },
];

const mockFinancials: FinancialRecord[] = [
  { id: 'fin1', date: '۱۴۰۳/۰۵/۱۵', description: 'تمدید عضویت سالانه', amount: 150000, status: 'paid', },
  { id: 'fin2', date: '۱۴۰۳/۰۸/۰۱', description: 'ثبت نام در مسابقات قهرمانی کشور', amount: 250000, status: 'paid', },
  { id: 'fin3', date: '۱۴۰۳/۰۹/۰۲', description: 'خرید لباس کاراته', amount: 950000, status: 'paid', },
];

const mockCoaches: Coach[] = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    name: `استاد نمونه ${i + 1}`,
    style: 'کیوکوشین سنتی',
    avatarUrl: `https://i.pravatar.cc/150?u=coach${i + 1}`
}));

const mockAdminUsers: AdminUser[] = [
  { id: 1, name: 'آرش شفیعی', nationalId: '1234567890', joinDate: '۱۴۰۳/۰۵/۱۵', status: 'approved', avatarUrl: 'https://i.pravatar.cc/150?u=arash' },
  { id: 2, name: 'مریم رضایی', nationalId: '0987654321', joinDate: '۱۴۰۳/۰۸/۲۰', status: 'pending', avatarUrl: 'https://i.pravatar.cc/150?u=maryam' },
  { id: 3, name: 'علی حسینی', nationalId: '1122334455', joinDate: '۱۴۰۳/۰۹/۰۱', status: 'rejected', avatarUrl: 'https://i.pravatar.cc/150?u=ali' },
  { id: 4, name: 'زهرا احمدی', nationalId: '5566778899', joinDate: '۱۴۰۳/۰۹/۱۰', status: 'pending', avatarUrl: 'https://i.pravatar.cc/150?u=zahra' },
];

const mockAdminSettings: AdminSettings = { woocommerceProductId: 'prod_12345', maxUploadSizeMb: 5, allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'], };

let mockFrontendConfig: FrontendConfig = {
    enableSportsInfo: true,
    enableMyCoach: true,
    enableEvents: true,
    enableFinancials: true,
};

const mockManagedData: { [key: string]: ManagedItem[] } = {
    styles: [{ id: 1, name: 'کیوکوشین سنتی' }],
    examiners: [{ id: 1, name: 'استاد احمدی' },{ id: 2, name: 'هیئت کاراته استان تهران' },{ id: 3, name: 'فدراسیون کاراته' }],
    locations: [{ id: 1, name: 'تهران - سالن افراسیابی' },{ id: 2, name: 'اصفهان - سالن پیروزی' },{ id: 3, name: 'شیراز - سالن دستغیب' }],
};

const mockUserDocuments: { [key: number]: UserDocument[] } = {
    1: [ // Arash Shafiei - all approved
        { id: 'doc1-1', docType: 'کارت ملی', fileUrl: 'https://picsum.photos/seed/doc1-1/800/600', status: 'approved' },
        { id: 'doc1-2', docType: 'شناسنامه', fileUrl: 'https://picsum.photos/seed/doc1-2/800/600', status: 'approved' },
    ],
    2: [ // Maryam Rezaei - pending
        { id: 'doc2-1', docType: 'کارت ملی', fileUrl: 'https://picsum.photos/seed/doc2-1/800/600', status: 'pending' },
        { id: 'doc2-2', docType: 'بیمه ورزشی', fileUrl: 'https://picsum.photos/seed/doc2-2/800/600', status: 'pending' },
        { id: 'doc2-3', docType: 'گذرنامه', fileUrl: 'https://picsum.photos/seed/doc2-3/800/600', status: 'pending' },
    ],
    3: [ // Ali Hosseini - some rejected
        { id: 'doc3-1', docType: 'کارت ملی', fileUrl: 'https://picsum.photos/seed/doc3-1/800/600', status: 'rejected', rejectionReason: 'تصویر ناخوانا است.' },
        { id: 'doc3-2', docType: 'شناسنامه', fileUrl: 'https://picsum.photos/seed/doc3-2/800/600', status: 'approved' },
    ],
    4: [ // Zahra Ahmadi - pending
        { id: 'doc4-1', docType: 'کارت ملی', fileUrl: 'https://picsum.photos/seed/doc4-1/800/600', status: 'pending' },
    ]
};

// --- END MOCK DATA ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- User-facing API functions ---
export const getCurrentUser = async (): Promise<User> => {
    await delay(300);
    return Promise.resolve(mockUser);
};

export const updateUserInfo = async (updates: Partial<User>): Promise<User> => {
    await delay(500);
    Object.assign(mockUser, updates);
    return Promise.resolve(mockUser);
};

export const getSportsRecords = async (): Promise<SportRecord[]> => {
    await delay(300);
    return Promise.resolve(mockSportsRecords);
};

export const getEvents = async (): Promise<Event[]> => {
    await delay(300);
    return Promise.resolve(mockEvents);
};

export const getFinancials = async (): Promise<FinancialRecord[]> => {
    await delay(300);
    return Promise.resolve(mockFinancials);
};

export const getCoaches = async (): Promise<Coach[]> => {
    await delay(300);
    return Promise.resolve(mockCoaches);
};

export const updateSelectedCoach = async (coachId: number): Promise<{ success: true }> => {
    await delay(500);
    console.log(`User selected coach with ID: ${coachId}`);
    mockUser.selectedCoachId = coachId;
    return Promise.resolve({ success: true });
};

export const getFrontendConfig = async (): Promise<FrontendConfig> => {
    await delay(200);
    return Promise.resolve(mockFrontendConfig);
};


// --- Admin-facing API functions ---
export const getAdminUsers = async (): Promise<AdminUser[]> => {
    await delay(300);
    return Promise.resolve(mockAdminUsers);
};

export const getAdminSettings = async (): Promise<AdminSettings> => {
    await delay(300);
    return Promise.resolve(mockAdminSettings);
};

export const updateFrontendConfig = async (config: FrontendConfig): Promise<FrontendConfig> => {
    await delay(300);
    mockFrontendConfig = config;
    return Promise.resolve(mockFrontendConfig);
};

export const getManagedData = async (): Promise<{ [key: string]: ManagedItem[] }> => {
    await delay(300);
    return Promise.resolve(mockManagedData);
}

export const addManagedItem = async (type: string, name: string): Promise<ManagedItem> => {
    await delay(300);
    const newItem = { id: Math.floor(Math.random() * 100000), name };
    if (mockManagedData[type]) {
        mockManagedData[type].push(newItem);
    }
    return Promise.resolve(newItem);
};

export const deleteManagedItem = async (type: string, id: number): Promise<void> => {
    await delay(300);
    if (mockManagedData[type]) {
        mockManagedData[type] = mockManagedData[type].filter(i => i.id !== id);
    }
    return Promise.resolve();
};

export const addCoach = async (coach: Omit<Coach, 'id'>): Promise<Coach> => {
    await delay(300);
    const newCoach = { ...coach, id: Math.floor(Math.random() * 100000) };
    mockCoaches.unshift(newCoach); // Add to top
    return Promise.resolve(newCoach);
};

export const updateCoach = async (coach: Coach): Promise<Coach> => {
    await delay(300);
    const index = mockCoaches.findIndex(c => c.id === coach.id);
    if (index !== -1) {
        mockCoaches[index] = coach;
    }
    return Promise.resolve(coach);
};

export const deleteCoach = async (id: number): Promise<void> => {
    await delay(300);
    const index = mockCoaches.findIndex(c => c.id === id);
    if (index !== -1) {
        mockCoaches.splice(index, 1);
    }
    return Promise.resolve();
};

export const getAdminUserDetail = async (userId: number): Promise<AdminUserDetail> => {
    await delay(500);
    const user = mockAdminUsers.find(u => u.id === userId);
    if (!user) {
        return Promise.reject(new Error('User not found'));
    }
    return Promise.resolve({
        ...user,
        documents: mockUserDocuments[userId] || [],
    });
};

export const deleteUserDocument = async (userId: number, docId: string): Promise<{ success: true }> => {
    await delay(500);
    if (mockUserDocuments[userId]) {
        mockUserDocuments[userId] = mockUserDocuments[userId].filter(d => d.id !== docId);
    }
    return Promise.resolve({ success: true });
};