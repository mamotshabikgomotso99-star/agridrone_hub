import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { initialMarketplaceData } from '@/data/mockData';
import { accountApi } from '@/utils/account-api';
import { sessionStorage } from '@/utils/session-storage';
import type { Job, JobModerationStatus, JobStatus, MarketplaceData, User, UserRole, VerificationStatus } from '@/types/marketplace';

const STORAGE_KEY = 'agridrone-hub-demo-v1';
const MarketplaceContext = createContext<{
  data: MarketplaceData;
  ready: boolean;
  storageError: string | null;
  activeUser: User | null;
  authToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  registerAccount: (fullName: string, email: string, password: string, role: Extract<UserRole, 'farmer' | 'operator'>) => Promise<void>;
  updateAccount: (updates: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'location' | 'province' | 'businessName' | 'farmName'>>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
  postJob: (job: Omit<Job, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  applyForJob: (jobId: string, message: string) => Promise<void>;
  acceptApplication: (applicationId: string) => Promise<void>;
  declineApplication: (applicationId: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  updateVerification: (userId: string, status: VerificationStatus) => Promise<void>;
  moderateJob: (jobId: string, status: JobModerationStatus) => Promise<void>;
  submitReview: (jobId: string, rating: number, comment: string) => Promise<void>;
  submitVerification: (fileName: string) => Promise<void>;
  sendMessage: (conversationId: string, body: string) => Promise<void>;
  markNotificationsRead: (userId: string) => Promise<void>;
} | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState(initialMarketplaceData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [accountUser, setAccountUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const dataRef = useRef(data);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let mounted = true;
    async function restore() {
      try {
        const serialized = await AsyncStorage.getItem(STORAGE_KEY);
        if (serialized) {
          const saved = JSON.parse(serialized) as MarketplaceData;
          if (!saved || !Array.isArray(saved.users) || !Array.isArray(saved.jobs) || !Array.isArray(saved.applications) || !Array.isArray(saved.bookings)) {
            throw new Error('Saved marketplace data is incomplete.');
          }
          const migrated: MarketplaceData = {
            ...initialMarketplaceData,
            ...saved,
            users: saved.users.map((user) => {
              const seedUser = initialMarketplaceData.users.find((seed) => seed.id === user.id);
              return seedUser ? { ...seedUser, ...user } : user;
            }),
            messages: Array.isArray(saved.messages) ? saved.messages : initialMarketplaceData.messages,
            notifications: Array.isArray(saved.notifications) ? saved.notifications : initialMarketplaceData.notifications,
            reviews: Array.isArray(saved.reviews) ? saved.reviews : initialMarketplaceData.reviews,
          };
          if (!mounted) return;
          dataRef.current = migrated;
          setData(migrated);
        }
      } catch (error) {
        if (mounted) setStorageError(error instanceof Error ? error.message : 'Could not load saved marketplace data.');
      }

      try {
        const token = await sessionStorage.get();
        if (token) {
          const user = await accountApi.getAccount(token);
          if (!mounted) return;
          const current = dataRef.current;
          const users = current.users.some((item) => item.id === user.id)
            ? current.users.map((item) => item.id === user.id ? { ...item, ...user } : item)
            : [user, ...current.users];
          const next = { ...current, users, activeUserId: user.id };
          dataRef.current = next;
          setData(next);
          setAccountUser(user);
          setAuthToken(token);
        }
      } catch {
        // A missing or expired session returns the user to sign-in.
      } finally {
        if (mounted) setReady(true);
      }
    }

    void restore();
    return () => {
      mounted = false;
    };
  }, []);

  const update = useCallback((transform: (current: MarketplaceData) => MarketplaceData) => {
    const operation = writeQueue.current.then(async () => {
      const next = transform(dataRef.current);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      dataRef.current = next;
      setData(next);
      setStorageError(null);
    });
    writeQueue.current = operation.catch((error: unknown) => {
      setStorageError(error instanceof Error ? error.message : 'Could not save demo data.');
    });
    return operation;
  }, []);

  const establishSession = useCallback(async (user: User, token: string) => {
    await sessionStorage.set(token);
    await update((current) => ({
      ...current,
      activeUserId: user.id,
      users: current.users.some((item) => item.id === user.id)
        ? current.users.map((item) => item.id === user.id ? { ...item, ...user } : item)
        : [user, ...current.users],
    }));
    setAccountUser(user);
    setAuthToken(token);
  }, [update]);

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await accountApi.signIn(email.trim(), password);
    await establishSession(result.user, result.token);
  }, [establishSession]);

  const registerAccount = useCallback(async (fullName: string, email: string, password: string, role: Extract<UserRole, 'farmer' | 'operator'>) => {
    const result = await accountApi.register(fullName.trim(), email.trim(), password, role);
    await establishSession(result.user, result.token);
  }, [establishSession]);

  const updateAccount = useCallback(async (updates: Partial<Pick<User, 'fullName' | 'email' | 'phone' | 'location' | 'province' | 'businessName' | 'farmName'>>) => {
    if (!authToken) throw new Error('Sign in to update account settings.');
    const user = await accountApi.updateAccount(authToken, updates);
    await update((current) => ({
      ...current,
      users: current.users.map((item) => item.id === user.id ? { ...item, ...user } : item),
    }));
    setAccountUser(user);
  }, [authToken, update]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!authToken) throw new Error('Sign in to change your password.');
    await accountApi.changePassword(authToken, currentPassword, newPassword);
  }, [authToken]);

  const signOut = useCallback(async () => {
    try {
      if (authToken) await accountApi.signOut(authToken);
    } catch {
      // Clear the local session even if the server cannot be reached.
    }
    await sessionStorage.remove();
    setAuthToken(null);
    setAccountUser(null);
    await update((current) => ({ ...current, activeUserId: null }));
  }, [authToken, update]);

  const postJob = useCallback((job: Omit<Job, 'id' | 'createdAt' | 'status'>) => update((current) => {
    const farmer = current.users.find((user) => user.id === current.activeUserId);
    if (farmer?.role !== 'farmer' || farmer.id !== job.farmerId) throw new Error('Only the active farm-owner account can post this request.');
    const jobId = `job-${Date.now()}`;
    const createdAt = new Date().toISOString();
    return {
      ...current,
      jobs: [{ ...job, id: jobId, status: 'open', createdAt: createdAt.slice(0, 10) }, ...current.jobs],
      notifications: [
        ...current.users.filter((user) => user.role === 'operator' && user.verificationStatus === 'verified').map((user) => ({
          id: `notification-${jobId}-${user.id}`,
          userId: user.id,
          title: 'New service opportunity',
          message: `${job.title} is available in ${job.location}.`,
          createdAt,
          read: false,
        })),
        ...current.notifications,
      ],
    };
  }), [update]);

  const applyForJob = useCallback((jobId: string, message: string) => update((current) => {
    const operator = current.users.find((user) => user.id === current.activeUserId);
    const job = current.jobs.find((item) => item.id === jobId);
    if (operator?.role !== 'operator' || operator.verificationStatus !== 'verified') {
      throw new Error('Only verified demonstration operators can apply for jobs.');
    }
    if (!job || job.moderationStatus === 'suspended' || !['open', 'application_received'].includes(job.status)) throw new Error('This job is no longer accepting applications.');
    if (current.applications.some((application) => application.jobId === jobId && application.operatorId === operator.id)) {
      throw new Error('You have already applied for this job.');
    }
    return {
      ...current,
      jobs: current.jobs.map((item) => item.id === jobId ? { ...item, status: 'application_received' } : item),
      applications: [{
        id: `application-${Date.now()}`,
        jobId,
        operatorId: operator.id,
        proposedPrice: Math.round((job.budgetMin + job.budgetMax) / 2),
        proposedCompletionDate: job.preferredDate,
        message,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
      }, ...current.applications],
      notifications: [{
        id: `notification-${Date.now()}`,
        userId: job.farmerId,
        title: 'New operator application',
        message: `${operator.fullName} applied for ${job.title}.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current.notifications],
    };
  }), [update]);

  const acceptApplication = useCallback((applicationId: string) => update((current) => {
    const farmer = current.users.find((item) => item.id === current.activeUserId);
    const application = current.applications.find((item) => item.id === applicationId);
    if (!application || application.status !== 'pending') throw new Error('This application is no longer available.');
    const job = current.jobs.find((item) => item.id === application.jobId);
    const operator = current.users.find((item) => item.id === application.operatorId);
    if (farmer?.role !== 'farmer' || !job || job.moderationStatus === 'suspended' || job.farmerId !== farmer.id || !operator || operator.verificationStatus !== 'verified') throw new Error('Only the job owner can confirm a verified operator on an active listing.');
    if (job.acceptedOperatorId || current.bookings.some((booking) => booking.jobId === job.id && booking.status !== 'cancelled')) {
      throw new Error('This job already has a confirmed operator.');
    }
    const bookingId = `booking-${Date.now()}`;
    return {
      ...current,
      jobs: current.jobs.map((item) => item.id === job.id ? { ...item, status: 'confirmed', acceptedOperatorId: operator.id } : item),
      applications: current.applications.map((item) => item.jobId !== job.id ? item : {
        ...item,
        status: item.id === applicationId ? 'accepted' : 'declined',
      }),
      bookings: [{
        id: bookingId,
        jobId: job.id,
        farmerId: job.farmerId,
        operatorId: operator.id,
        status: 'confirmed',
        scheduledDate: job.preferredDate,
        createdAt: new Date().toISOString().slice(0, 10),
      }, ...current.bookings],
      notifications: [{
        id: `notification-${Date.now()}`,
        userId: operator.id,
        title: 'Application accepted',
        message: `Your proposal for ${job.title} has been accepted.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current.notifications],
    };
  }), [update]);

  const declineApplication = useCallback((applicationId: string) => update((current) => {
    const application = current.applications.find((item) => item.id === applicationId);
    const job = application && current.jobs.find((item) => item.id === application.jobId);
    if (!application || application.status !== 'pending' || !job || job.farmerId !== current.activeUserId) throw new Error('This application cannot be declined by the active account.');
    return {
      ...current,
      applications: current.applications.map((item) => item.id === applicationId ? { ...item, status: 'declined' } : item),
      notifications: [{
        id: `notification-${Date.now()}`,
        userId: application.operatorId,
        title: 'Application update',
        message: `Your proposal for ${job.title} was not selected.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current.notifications],
    };
  }), [update]);

  const updateJobStatus = useCallback((jobId: string, status: JobStatus) => update((current) => {
    const user = current.users.find((item) => item.id === current.activeUserId);
    const job = current.jobs.find((item) => item.id === jobId);
    if (!job || !job.acceptedOperatorId) throw new Error('A confirmed operator is required before updating job progress.');
    if (!user || (user.id !== job.acceptedOperatorId && user.id !== job.farmerId)) throw new Error('Only the assigned operator or farm owner can update this booking.');
    if (status === 'completed' && user.id !== job.farmerId) throw new Error('The farm owner must confirm completed work.');
    if (status !== 'completed' && user.id !== job.acceptedOperatorId) throw new Error('Only the assigned operator can update this work stage.');
    const allowed: Record<JobStatus, JobStatus[]> = {
      open: [],
      application_received: [],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['work_submitted', 'cancelled'],
      work_submitted: ['completed'],
      completed: [],
      cancelled: [],
    };
    if (!allowed[job.status].includes(status)) throw new Error(`Cannot move this job from ${job.status} to ${status}.`);
    return {
      ...current,
      jobs: current.jobs.map((item) => item.id === jobId ? { ...item, status } : item),
      bookings: current.bookings.map((booking) => booking.jobId === jobId ? { ...booking, status } : booking),
      notifications: [{
        id: `notification-${Date.now()}`,
        userId: status === 'completed' ? job.acceptedOperatorId : job.farmerId,
        title: status === 'work_submitted' ? 'Work submitted for review' : status === 'completed' ? 'Work completion confirmed' : 'Booking progress updated',
        message: `${job.title} is now ${status.replaceAll('_', ' ')}.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current.notifications],
    };
  }), [update]);

  const updateVerification = useCallback((userId: string, status: VerificationStatus) => update((current) => {
    if (current.users.find((user) => user.id === current.activeUserId)?.role !== 'admin') throw new Error('Only the administrator demo account can review credentials.');
    if (!current.users.some((user) => user.id === userId && user.role === 'operator')) throw new Error('Operator account was not found.');
    return {
      ...current,
      users: current.users.map((user) => user.id === userId ? { ...user, verificationStatus: status } : user),
      notifications: [{
        id: `notification-${Date.now()}`,
        userId,
        title: 'Demonstration verification updated',
        message: `Your sample verification status is ${status.replaceAll('_', ' ')}.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current.notifications],
    };
  }), [update]);

  const moderateJob = useCallback((jobId: string, status: JobModerationStatus) => update((current) => {
    if (current.users.find((user) => user.id === current.activeUserId)?.role !== 'admin') throw new Error('Only the administrator demo account can moderate listings.');
    if (!current.jobs.some((job) => job.id === jobId)) throw new Error('Job listing was not found.');
    return { ...current, jobs: current.jobs.map((job) => job.id === jobId ? { ...job, moderationStatus: status } : job) };
  }), [update]);

  const submitReview = useCallback((jobId: string, rating: number, comment: string) => update((current) => {
    const job = current.jobs.find((item) => item.id === jobId);
    if (!job || job.status !== 'completed' || job.farmerId !== current.activeUserId || !job.acceptedOperatorId) {
      throw new Error('Only the farm owner can review a completed, assigned job.');
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error('Choose a rating from 1 to 5 stars.');
    if (current.reviews.some((review) => review.jobId === jobId && review.farmerId === current.activeUserId)) throw new Error('A review has already been submitted for this job.');
    return {
      ...current,
      reviews: [...current.reviews, {
        id: `review-${Date.now()}`,
        jobId,
        farmerId: job.farmerId,
        operatorId: job.acceptedOperatorId,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString().slice(0, 10),
      }],
    };
  }), [update]);

  const submitVerification = useCallback((fileName: string) => update((current) => {
    const operator = current.users.find((user) => user.id === current.activeUserId);
    if (operator?.role !== 'operator') throw new Error('Only an operator account can submit demonstration credentials.');
    return {
      ...current,
      users: current.users.map((user) => user.id === operator.id ? { ...user, verificationStatus: 'pending', credentialFileName: fileName } : user),
      notifications: [{
        id: `notification-${Date.now()}`,
        userId: 'admin-demo',
        title: 'Verification review needed',
        message: `${operator.fullName} submitted a demonstration credential for review.`,
        createdAt: new Date().toISOString(),
        read: false,
      }, ...current.notifications],
    };
  }), [update]);

  const sendMessage = useCallback((conversationId: string, body: string) => {
    const message = body.trim();
    if (!message) return Promise.reject(new Error('Message cannot be empty.'));
    return update((current) => {
      if (!current.activeUserId) throw new Error('Sign in before messaging.');
      return {
        ...current,
        messages: [...current.messages, { id: `message-${Date.now()}`, conversationId, senderId: current.activeUserId, body: message, createdAt: new Date().toISOString() }],
      };
    });
  }, [update]);

  const markNotificationsRead = useCallback((userId: string) => update((current) => {
    if (current.activeUserId !== userId && current.users.find((user) => user.id === current.activeUserId)?.role !== 'admin') {
      throw new Error('Only the notification recipient can mark these notifications as read.');
    }
    return { ...current, notifications: current.notifications.map((notification) => notification.userId === userId ? { ...notification, read: true } : notification) };
  }), [update]);

  const activeUser = accountUser;
  const value = useMemo(() => ({
    data, ready, storageError, activeUser, authToken, signIn, registerAccount, updateAccount, changePassword, signOut, postJob, applyForJob,
    acceptApplication, declineApplication, updateJobStatus, updateVerification, moderateJob, submitReview, submitVerification, sendMessage, markNotificationsRead,
  }), [data, ready, storageError, activeUser, authToken, signIn, registerAccount, updateAccount, changePassword, signOut, postJob, applyForJob, acceptApplication, declineApplication, updateJobStatus, updateVerification, moderateJob, submitReview, submitVerification, sendMessage, markNotificationsRead]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) throw new Error('useMarketplace must be used inside MarketplaceProvider.');
  return context;
}
