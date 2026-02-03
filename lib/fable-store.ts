import { create } from 'zustand'

// App States
export type AppState = 
  | 'idle'              // Initial state, waiting for consents
  | 'consents_pending'  // User needs to accept consents
  | 'ready_to_upload'   // Consents accepted, can upload
  | 'uploading'         // File is being uploaded
  | 'upload_failed'     // Upload failed
  | 'generating'        // AI is generating the image
  | 'generate_failed'   // Generation failed
  | 'preview_ready'     // Preview is ready (watermarked)
  | 'checkout'          // User is in checkout flow
  | 'payment_processing'// Payment is being processed
  | 'payment_failed'    // Payment failed
  | 'payment_success'   // Payment succeeded
  | 'print_processing'  // Print order is being processed
  | 'rate_limited'      // User hit rate limit

export type TabType = 'pets' | 'family' | 'kids'

// Consent payload structure
export interface ConsentPayload {
  acceptedPhotoRights: boolean      // Required for all
  acceptedUsageRights: boolean      // Required for all
  acceptedGuardianship: boolean     // Required only for Kids
  consentVersion: string
  timestamp: string
  userAgent: string
}

// Order types
export interface OrderDetails {
  type: 'download' | 'small_print' | 'large_print'
  size?: string
  price: number
  email?: string
}

// Store interface
interface FableStore {
  // App state
  appState: AppState
  setAppState: (state: AppState) => void
  
  // Tab
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
  
  // Consents
  consents: ConsentPayload
  updateConsent: (key: keyof ConsentPayload, value: boolean | string) => void
  areConsentsValid: () => boolean
  resetConsents: () => void
  
  // Upload
  uploadedImage: string | null
  uploadedFile: File | null
  uploadProgress: number
  setUploadedImage: (image: string | null, file: File | null) => void
  setUploadProgress: (progress: number) => void
  
  // Style
  selectedStyle: string | null
  setSelectedStyle: (style: string | null) => void
  
  // Generation
  generatedImage: string | null
  generationProgress: number
  setGeneratedImage: (image: string | null) => void
  setGenerationProgress: (progress: number) => void
  
  // Rate limiting
  remainingGenerations: number
  decrementGenerations: () => void
  isRateLimited: () => boolean
  
  // Order
  currentOrder: OrderDetails | null
  setCurrentOrder: (order: OrderDetails | null) => void
  
  // Error handling
  errorMessage: string | null
  setErrorMessage: (message: string | null) => void
  
  // Reset
  resetToUpload: () => void
  fullReset: () => void
}

const CONSENT_VERSION = '1.0.0'

const initialConsents: ConsentPayload = {
  acceptedPhotoRights: false,
  acceptedUsageRights: false,
  acceptedGuardianship: false,
  consentVersion: CONSENT_VERSION,
  timestamp: '',
  userAgent: '',
}

export const useFableStore = create<FableStore>((set, get) => ({
  // App state
  appState: 'idle',
  setAppState: (state) => set({ appState: state }),
  
  // Tab
  activeTab: 'pets',
  setActiveTab: (tab) => {
    set({ activeTab: tab })
    // Reset consents when changing tabs (guardianship requirement changes)
    get().resetConsents()
  },
  
  // Consents
  consents: initialConsents,
  updateConsent: (key, value) => {
    set((state) => ({
      consents: {
        ...state.consents,
        [key]: value,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      }
    }))
    // Check if all required consents are now valid
    const store = get()
    if (store.areConsentsValid()) {
      store.setAppState('ready_to_upload')
    } else {
      store.setAppState('consents_pending')
    }
  },
  areConsentsValid: () => {
    const { consents, activeTab } = get()
    const baseConsents = consents.acceptedPhotoRights && consents.acceptedUsageRights
    if (activeTab === 'kids') {
      return baseConsents && consents.acceptedGuardianship
    }
    return baseConsents
  },
  resetConsents: () => set({ 
    consents: initialConsents,
    appState: 'idle'
  }),
  
  // Upload
  uploadedImage: null,
  uploadedFile: null,
  uploadProgress: 0,
  setUploadedImage: (image, file) => set({ uploadedImage: image, uploadedFile: file }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  // Style
  selectedStyle: null,
  setSelectedStyle: (style) => set({ selectedStyle: style }),
  
  // Generation
  generatedImage: null,
  generationProgress: 0,
  setGeneratedImage: (image) => set({ generatedImage: image }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  
  // Rate limiting (mock: 5 free generations per day)
  remainingGenerations: 5,
  decrementGenerations: () => set((state) => ({ 
    remainingGenerations: Math.max(0, state.remainingGenerations - 1) 
  })),
  isRateLimited: () => get().remainingGenerations <= 0,
  
  // Order
  currentOrder: null,
  setCurrentOrder: (order) => set({ currentOrder: order }),
  
  // Error handling
  errorMessage: null,
  setErrorMessage: (message) => set({ errorMessage: message }),
  
  // Reset to upload state
  resetToUpload: () => set({
    appState: get().areConsentsValid() ? 'ready_to_upload' : 'consents_pending',
    uploadedImage: null,
    uploadedFile: null,
    uploadProgress: 0,
    generatedImage: null,
    generationProgress: 0,
    errorMessage: null,
    currentOrder: null,
  }),
  
  // Full reset
  fullReset: () => set({
    appState: 'idle',
    consents: initialConsents,
    uploadedImage: null,
    uploadedFile: null,
    uploadProgress: 0,
    selectedStyle: null,
    generatedImage: null,
    generationProgress: 0,
    errorMessage: null,
    currentOrder: null,
  }),
}))
