import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    licenseNumber: z.string().min(3, 'Medical license number is required'),
    specialization: z.string().min(2, 'Specialization is required'),
    clinicName: z.string().min(2, 'Clinic/Hospital name is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const patientSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say'], {
    errorMap: () => ({ message: 'Please select gender' }),
  }),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  address: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
  allergies: z.array(z.string()).optional(),
  existingConditions: z.array(z.string()).optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relationship: z.string().optional(),
    })
    .optional(),
});

export const medicalRecordSchema = z.object({
  visitDate: z.string().min(1, 'Visit date is required'),
  chiefComplaint: z.string().min(3, 'Chief complaint is required'),
  diagnosis: z.string().min(3, 'Diagnosis is required'),
  disease: z.string().optional(),
  infectionStatus: z.enum(['Yes', 'No', 'Unknown']).default('Unknown'),
  infectionType: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  doctorNotes: z.string().optional(),
  followUpDate: z.string().optional(),
  followUpNotes: z.string().optional(),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  reason: z.string().min(3, 'Reason is required'),
  status: z.enum(['Scheduled', 'Completed', 'Cancelled', 'No Show']).default('Scheduled'),
  notes: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
