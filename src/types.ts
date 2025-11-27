

export type Page = 'dashboard' | 'personal-info' | 'sports-info' | 'my-coach' | 'events' | 'financials';

export type EventCategory = 'competitions' | 'training' | 'judging' | 'certificates';

export interface User {
  name: string;
  nameLatin: string;
  avatarUrl: string;
  membershipEndDate: string;
  daysRemaining: number;
  nationalId: string;
  fatherName: string;
  birthDate: string;
  association: string;
  style: string;
  uniqueId: string;
  selectedCoachId: number | null;
  // Fields from registration form
  gender?: 'male' | 'female';
  nationality?: string;
  mobile?: string;
  province?: string;
  // Extended Identity Fields
  fatherNameLatin?: string;
  birthCertNumber?: string;
  bloodType?: string;
  weight?: number;
  height?: number;
  birthPlace?: string;
  maritalStatus?: string;
  city?: string;
  address?: string;
  phone?: string;
  birthDateGregorian?: string;
}

export interface Coach {
  id: number;
  name: string;
  style: string;
  avatarUrl:string;
}

export interface Document {
  name: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  file?: File;
}

export interface SportRecord {
  id: string;
  type: 'belt' | 'coaching' | 'judging';
  certificateNumber: string;
  style: string;
  rank: string;
  examDate: string;
  issueDate: string;
  location: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Event {
  id: string;
  title: string;
  date: string;
  capacity: number;
  price: number;
  registered: boolean;
  description: string;
  category: EventCategory;
}

export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
}

// --- Admin Types ---

export type AdminView = 'dashboard' | 'users' | 'user-detail' | 'settings' | 'frontend-config' | 'data-management' | 'shortcodes';

export interface AdminUser {
  id: number;
  name: string;
  nationalId: string;
  joinDate: string;
  status: 'approved' | 'pending' | 'rejected';
  avatarUrl: string;
}

export interface AdminSettings {
    woocommerceProductId: string;
    maxUploadSizeMb: number;
    allowedFileTypes: string[];
}

export interface FrontendConfig {
    enableSportsInfo: boolean;
    enableMyCoach: boolean;
    enableEvents: boolean;
    enableFinancials: boolean;
}

export interface ManagedItem {
    id: number;
    name: string;
}

export interface UserDocument {
  id: string;
  docType: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface AdminUserDetail extends AdminUser {
    documents: UserDocument[];
}