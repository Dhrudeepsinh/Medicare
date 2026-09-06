/**
 * MediCare Doctor Portal - Demo Database Seeder
 *
 * IMPORTANT NOTICE:
 * All patient data in this seed script is COMPLETELY FICTIONAL and for
 * DEMONSTRATION PURPOSES ONLY. No real patient information is used.
 * Patient names, conditions, medications, and test results are invented
 * for demonstration. They do not represent real people or real medical records.
 *
 * Medication/treatment information in seeded records is doctor-entered
 * clinical record data. It does not constitute medical advice or recommendations.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

const connectDB = require('../config/db');

const seedData = async () => {
  await connectDB();

  console.log('\n🌱 ========================================');
  console.log('   MediCare Demo Database Seeder');
  console.log('   ⚠️  DEMO DATA ONLY - NOT REAL PATIENTS');
  console.log('==========================================\n');

  // --------------------------------------------------
  // Create Demo Doctor
  // --------------------------------------------------
  console.log('👨‍⚕️  Creating demo doctor...');

  const existingDoctor = await Doctor.findOne({ email: 'demo@medicare.com' });
  let doctor;

  if (existingDoctor) {
    console.log('   Doctor already exists, using existing record.');
    doctor = existingDoctor;
  } else {
    doctor = await Doctor.create({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@medicare.com',
      password: 'Demo@1234',
      phone: '+1-555-0100',
      licenseNumber: 'LIC-DEMO-2024',
      specialization: 'General Medicine',
      clinicName: 'MediCare Demo Clinic',
    });
    console.log(`   ✅ Created: Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.email})`);
  }

  // --------------------------------------------------
  // Create Demo Patients
  // --------------------------------------------------
  console.log('\n👥 Creating demo patients...');

  const patientsData = [
    {
      patientId: 'PAT-00000001',
      doctorId: doctor._id,
      firstName: 'Nikul',
      lastName: 'Shah',
      dateOfBirth: new Date('1988-03-15'),
      gender: 'Male',
      phone: '+1-555-0101',
      email: 'nikul.shah@example-demo.com',
      address: '42 Maple Street, Springfield, IL 62701',
      bloodGroup: 'B+',
      allergies: ['Penicillin', 'Aspirin'],
      existingConditions: ['Hypertension'],
      emergencyContact: { name: 'Priya Shah', phone: '+1-555-0102', relationship: 'Spouse' },
      status: 'Active',
    },
    {
      patientId: 'PAT-00000002',
      doctorId: doctor._id,
      firstName: 'Aditya',
      lastName: 'Patel',
      dateOfBirth: new Date('1995-07-22'),
      gender: 'Male',
      phone: '+1-555-0103',
      email: 'aditya.patel@example-demo.com',
      address: '17 Oak Avenue, Lakewood, CO 80226',
      bloodGroup: 'A+',
      allergies: [],
      existingConditions: ['Type 2 Diabetes'],
      emergencyContact: { name: 'Rajan Patel', phone: '+1-555-0104', relationship: 'Father' },
      status: 'Active',
    },
    {
      patientId: 'PAT-00000003',
      doctorId: doctor._id,
      firstName: 'Harsh',
      lastName: 'Mehta',
      dateOfBirth: new Date('2001-11-08'),
      gender: 'Male',
      phone: '+1-555-0105',
      email: 'harsh.mehta@example-demo.com',
      address: '88 Pine Road, Austin, TX 78701',
      bloodGroup: 'O+',
      allergies: ['Sulfa drugs'],
      existingConditions: [],
      emergencyContact: { name: 'Kavita Mehta', phone: '+1-555-0106', relationship: 'Mother' },
      status: 'Active',
    },
  ];

  const patients = [];
  for (const pd of patientsData) {
    const existing = await Patient.findOne({ patientId: pd.patientId });
    if (existing) {
      console.log(`   Patient ${pd.patientId} already exists, skipping.`);
      patients.push(existing);
    } else {
      const p = await Patient.create(pd);
      console.log(`   ✅ Created: ${p.firstName} ${p.lastName} (${p.patientId})`);
      patients.push(p);
    }
  }

  const [nikul, aditya, harsh] = patients;
  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const daysFromNow = (n) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  // --------------------------------------------------
  // Create Medical Records
  // --------------------------------------------------
  console.log('\n📋 Creating demo medical records...');

  const existingRecords = await MedicalRecord.countDocuments({ doctorId: doctor._id });
  if (existingRecords > 0) {
    console.log(`   Medical records already exist (${existingRecords}), skipping.`);
  } else {
    const medicalRecords = [
      // Nikul - Record 1: UTI (older)
      {
        patientId: nikul._id,
        doctorId: doctor._id,
        visitDate: daysAgo(180),
        chiefComplaint: 'Burning sensation during urination and frequent urge to urinate',
        symptoms: ['Dysuria', 'Urinary frequency', 'Pelvic discomfort', 'Low-grade fever'],
        diagnosis: 'Acute Urinary Tract Infection',
        disease: 'Urinary Tract Infection',
        infectionStatus: 'Yes',
        infectionType: 'Bacterial',
        medications: [
          {
            name: 'Nitrofurantoin (Macrodantin)',
            dose: '50 mg',
            route: 'Oral',
            frequency: 'Every 6 hours',
            duration: '7 days',
            startDate: daysAgo(180),
            endDate: daysAgo(173),
            prescribedBy: 'Dr. Demo User',
            notes: '[DEMO RECORD] Fictional medication entry for demonstration only.',
          },
        ],
        tests: [
          {
            testName: 'Urine Culture & Sensitivity',
            result: 'E. coli detected — >100,000 CFU/mL',
            unit: 'CFU/mL',
            referenceRange: 'No growth',
            testDate: daysAgo(181),
            notes: 'Sensitive to nitrofurantoin',
          },
          {
            testName: 'Urinalysis',
            result: 'WBC: 20-30/hpf, Bacteria: +3',
            referenceRange: 'WBC: 0-5/hpf',
            testDate: daysAgo(181),
          },
        ],
        doctorNotes:
          '[DEMO RECORD — FICTIONAL DATA] Patient presented with classic UTI symptoms. Urine culture confirmed bacterial infection. Advised increased fluid intake. To follow up in 2 weeks if symptoms persist.',
        followUpDate: daysAgo(166),
        followUpNotes: 'Follow-up to confirm resolution of infection',
        followUpStatus: 'Completed',
      },
      // Nikul - Record 2: Hypertension follow-up (recent)
      {
        patientId: nikul._id,
        doctorId: doctor._id,
        visitDate: daysAgo(30),
        chiefComplaint: 'Routine hypertension follow-up and medication review',
        symptoms: ['Occasional headache', 'Mild fatigue'],
        diagnosis: 'Hypertension - Routine Follow-up',
        disease: 'Hypertension',
        infectionStatus: 'No',
        medications: [
          {
            name: 'Amlodipine',
            dose: '5 mg',
            route: 'Oral',
            frequency: 'Once daily',
            duration: 'Ongoing',
            startDate: daysAgo(365),
            prescribedBy: 'Dr. Demo User',
            notes: '[DEMO RECORD] Fictional medication entry for demonstration only.',
          },
        ],
        tests: [
          {
            testName: 'Blood Pressure',
            result: '145/90 mmHg',
            referenceRange: '< 120/80 mmHg',
            testDate: daysAgo(30),
          },
          {
            testName: 'Fasting Blood Glucose',
            result: '98 mg/dL',
            unit: 'mg/dL',
            referenceRange: '70-99 mg/dL',
            testDate: daysAgo(30),
          },
        ],
        doctorNotes:
          '[DEMO RECORD — FICTIONAL DATA] Blood pressure remains slightly elevated. Current medication continued. Lifestyle modifications discussed — reduced sodium diet, regular aerobic exercise recommended. Review in 3 months.',
        followUpDate: daysFromNow(60),
        followUpNotes: 'Review BP control and consider dose adjustment',
        followUpStatus: 'Pending',
      },
      // Aditya - Record 1: Diabetes management
      {
        patientId: aditya._id,
        doctorId: doctor._id,
        visitDate: daysAgo(90),
        chiefComplaint: 'Diabetes management review and HbA1c check',
        symptoms: ['Increased thirst', 'Fatigue', 'Frequent urination'],
        diagnosis: 'Type 2 Diabetes - Management Review',
        disease: 'Type 2 Diabetes',
        infectionStatus: 'No',
        medications: [
          {
            name: 'Metformin',
            dose: '500 mg',
            route: 'Oral',
            frequency: 'Twice daily with meals',
            duration: 'Ongoing',
            startDate: daysAgo(365),
            prescribedBy: 'Dr. Demo User',
            notes: '[DEMO RECORD] Fictional medication entry for demonstration only.',
          },
        ],
        tests: [
          {
            testName: 'HbA1c',
            result: '7.8%',
            unit: '%',
            referenceRange: '< 7.0% (target for diabetics)',
            testDate: daysAgo(91),
            notes: 'Slightly above target — lifestyle counseling provided',
          },
          {
            testName: 'Fasting Blood Glucose',
            result: '142 mg/dL',
            unit: 'mg/dL',
            referenceRange: '70-99 mg/dL (fasting)',
            testDate: daysAgo(91),
          },
          {
            testName: 'Kidney Function (Creatinine)',
            result: '0.9 mg/dL',
            unit: 'mg/dL',
            referenceRange: '0.7-1.2 mg/dL',
            testDate: daysAgo(91),
          },
        ],
        doctorNotes:
          '[DEMO RECORD — FICTIONAL DATA] HbA1c remains above target. Dietary counseling reinforced. Physical activity encouraged. Current medication continued. Review in 3 months with repeat HbA1c.',
        followUpDate: daysFromNow(5),
        followUpNotes: 'Repeat HbA1c and diabetes review',
        followUpStatus: 'Pending',
      },
      // Aditya - Record 2: URTI
      {
        patientId: aditya._id,
        doctorId: doctor._id,
        visitDate: daysAgo(14),
        chiefComplaint: 'Sore throat, runny nose, and mild fever for 3 days',
        symptoms: ['Sore throat', 'Rhinorrhea', 'Mild fever', 'Cough', 'Malaise'],
        diagnosis: 'Acute Upper Respiratory Tract Infection',
        disease: 'URTI',
        infectionStatus: 'Yes',
        infectionType: 'Viral',
        medications: [
          {
            name: 'Paracetamol',
            dose: '500 mg',
            route: 'Oral',
            frequency: 'Every 6 hours as needed for fever',
            duration: '5 days',
            startDate: daysAgo(14),
            endDate: daysAgo(9),
            prescribedBy: 'Dr. Demo User',
            notes: '[DEMO RECORD] Fictional medication entry for demonstration only.',
          },
        ],
        tests: [
          {
            testName: 'Rapid Strep Test',
            result: 'Negative',
            referenceRange: 'Negative',
            testDate: daysAgo(14),
          },
        ],
        doctorNotes:
          '[DEMO RECORD — FICTIONAL DATA] Clinical presentation consistent with viral URTI. Antibiotics not indicated. Symptomatic treatment, rest, and hydration advised. Monitor blood glucose more frequently during illness.',
        followUpDate: daysFromNow(3),
        followUpNotes: 'Follow-up if symptoms worsen or persist',
        followUpStatus: 'Pending',
      },
      // Harsh - Record 1: Allergic Rhinitis
      {
        patientId: harsh._id,
        doctorId: doctor._id,
        visitDate: daysAgo(60),
        chiefComplaint: 'Sneezing, itchy eyes, and nasal congestion — seasonal',
        symptoms: ['Sneezing', 'Rhinorrhea', 'Itchy eyes', 'Nasal congestion', 'Post-nasal drip'],
        diagnosis: 'Seasonal Allergic Rhinitis',
        disease: 'Allergic Rhinitis',
        infectionStatus: 'No',
        medications: [
          {
            name: 'Cetirizine',
            dose: '10 mg',
            route: 'Oral',
            frequency: 'Once daily at bedtime',
            duration: '4 weeks',
            startDate: daysAgo(60),
            endDate: daysAgo(32),
            prescribedBy: 'Dr. Demo User',
            notes: '[DEMO RECORD] Fictional medication entry for demonstration only.',
          },
        ],
        tests: [
          {
            testName: 'Skin Prick Test',
            result: 'Positive for grass pollen, dust mites',
            referenceRange: 'Negative',
            testDate: daysAgo(60),
          },
        ],
        doctorNotes:
          '[DEMO RECORD — FICTIONAL DATA] Classic seasonal allergic rhinitis presentation. Allergen avoidance strategies discussed. Antihistamine therapy initiated. Consider allergy immunotherapy if symptoms recur next season.',
        followUpDate: daysAgo(30),
        followUpNotes: 'Review response to antihistamine therapy',
        followUpStatus: 'Completed',
      },
      // Harsh - Record 2: Gastroenteritis
      {
        patientId: harsh._id,
        doctorId: doctor._id,
        visitDate: daysAgo(7),
        chiefComplaint: 'Nausea, vomiting, and diarrhea for 24 hours',
        symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal cramps', 'Low-grade fever'],
        diagnosis: 'Acute Gastroenteritis',
        disease: 'Gastroenteritis',
        infectionStatus: 'Unknown',
        medications: [
          {
            name: 'Oral Rehydration Solution (ORS)',
            dose: '200-400 mL',
            route: 'Oral',
            frequency: 'After each loose stool',
            duration: '3-5 days',
            startDate: daysAgo(7),
            prescribedBy: 'Dr. Demo User',
            notes: '[DEMO RECORD] Fictional medication entry for demonstration only.',
          },
        ],
        tests: [
          {
            testName: 'Stool Routine Examination',
            result: 'WBC: 2-4/hpf, No parasites detected',
            referenceRange: 'Normal',
            testDate: daysAgo(7),
          },
        ],
        doctorNotes:
          '[DEMO RECORD — FICTIONAL DATA] Likely viral gastroenteritis. Oral rehydration therapy initiated. BRAT diet advised. Patient to return if symptoms worsen, signs of dehydration, or fever > 39°C.',
        followUpDate: daysFromNow(7),
        followUpNotes: 'Follow-up to confirm recovery',
        followUpStatus: 'Pending',
      },
    ];

    for (const record of medicalRecords) {
      await MedicalRecord.create(record);
    }
    console.log(`   ✅ Created ${medicalRecords.length} medical records`);
  }

  // --------------------------------------------------
  // Create Demo Appointments
  // --------------------------------------------------
  console.log('\n📅 Creating demo appointments...');

  const existingAppointments = await Appointment.countDocuments({ doctorId: doctor._id });
  if (existingAppointments > 0) {
    console.log(`   Appointments already exist (${existingAppointments}), skipping.`);
  } else {
    const appointments = [
      {
        patientId: nikul._id,
        doctorId: doctor._id,
        appointmentDate: daysFromNow(2),
        appointmentTime: '10:00 AM',
        reason: 'Hypertension review and blood pressure check',
        status: 'Scheduled',
        notes: 'Patient requested morning slot',
      },
      {
        patientId: aditya._id,
        doctorId: doctor._id,
        appointmentDate: daysFromNow(5),
        appointmentTime: '02:30 PM',
        reason: 'Diabetes follow-up and repeat HbA1c review',
        status: 'Scheduled',
      },
      {
        patientId: harsh._id,
        doctorId: doctor._id,
        appointmentDate: daysFromNow(7),
        appointmentTime: '11:00 AM',
        reason: 'Post-gastroenteritis recovery check',
        status: 'Scheduled',
      },
      {
        patientId: nikul._id,
        doctorId: doctor._id,
        appointmentDate: daysAgo(5),
        appointmentTime: '09:00 AM',
        reason: 'General check-up',
        status: 'Completed',
      },
    ];

    for (const appt of appointments) {
      await Appointment.create(appt);
    }
    console.log(`   ✅ Created ${appointments.length} appointments`);
  }

  console.log('\n✅ ========================================');
  console.log('   Seeding completed successfully!');
  console.log('==========================================');
  console.log('\n🔐 Demo Login Credentials:');
  console.log('   Email:    demo@medicare.com');
  console.log('   Password: Demo@1234');
  console.log('\n⚠️  REMINDER: All seeded patient data is');
  console.log('   completely fictional (DEMO only).\n');

  await mongoose.disconnect();
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  console.log('\n🗑️  Destroying all demo data...');

  await Appointment.deleteMany({});
  await MedicalRecord.deleteMany({});
  await Patient.deleteMany({});
  await Doctor.deleteMany({ email: 'demo@medicare.com' });

  console.log('✅ All demo data removed.');
  await mongoose.disconnect();
  process.exit(0);
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  seedData();
}
