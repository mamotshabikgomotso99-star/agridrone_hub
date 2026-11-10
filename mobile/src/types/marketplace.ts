export type UserRole = 'farmer' | 'operator' | 'admin';
export type VerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected' | 'more_info';
export type JobStatus =
  | 'open'
  | 'application_received'
  | 'confirmed'
  | 'in_progress'
  | 'work_submitted'
  | 'completed'
  | 'cancelled';
export type JobModerationStatus = 'active' | 'flagged' | 'suspended';
export type ApplicationStatus = 'pending' | 'accepted' | 'declined';

export type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  farmName?: string;
  farmType?: string;
  farmSizeHectares?: number;
  droneEquipment?: string[];
  location: string;
  province: string;
  services: string[];
  experienceYears?: number;
  rating?: number;
  reviewCount?: number;
  verificationStatus?: VerificationStatus;
  credentialFileName?: string;
}

export type Job = {
  id: string;
  farmerId: string;
  title: string;
  category: string;
  description: string;
  location: string;
  province: string;
  farmSizeHectares: number;
  budgetMin: number;
  budgetMax: number;
  preferredDate: string;
  requiredSkills: string[];
  requiredEquipment: string[];
  status: JobStatus;
  moderationStatus?: JobModerationStatus;
  createdAt: string;
  acceptedOperatorId?: string;
};

export type Application = {
  id: string;
  jobId: string;
  operatorId: string;
  proposedPrice: number;
  proposedCompletionDate: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
};

export type Booking = {
  id: string;
  jobId: string;
  farmerId: string;
  operatorId: string;
  status: JobStatus;
  scheduledDate: string;
  createdAt: string;
};

export type DemoMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export type Review = {
  id: string;
  jobId: string;
  farmerId: string;
  operatorId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type MarketplaceData = {
  users: User[];
  jobs: Job[];
  applications: Application[];
  bookings: Booking[];
  messages: DemoMessage[];
  notifications: AppNotification[];
  reviews: Review[];
  activeUserId: string | null;
};
