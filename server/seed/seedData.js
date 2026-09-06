/**
 * DEMO SEED SCRIPT
 * Creates completely fictional demo data for the MediCare Doctor Portal.
 * All patients, medical records, and appointments are FICTIONAL and for demonstration only.
 * DO NOT use real patient data.
 */

require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  console.log('\n🌱 Starting seed process...\n');

  // Clear existing demo data
  await Doctor.deleteMany({ email: 'dr.demo@medicare-portal.dev' });

  // ─── Create Demo Doctor ──────────────────────────────────────────────────────
  const doctor = await Doctor.create({
    name: 'Dr. Alex Demo',
    email: 'dr.demo@medicare.dev',
    phone: '+91-9800000001',
    password: 'Demo@1234',
    licenseNumber: 'DL-DEMO-2024-001',
    specialization: 'General Medicine',
    clinicName: 'MediCare Demo Clinic',
  });

  console.log('✅ Demo doctor created:', doctor.email);

  // ─── Clear existing demo patients ────────────────────────────────────────────
  const existingPatients = await Patient.find({ doctorId: doctor._id });
  if (existingPatients.length) {
    const ids = existingPatients.map((p) => p._id);
    await MedicalRecord.deleteMany({ patientId: { $in: ids } });
    await Appointment.deleteMany({ patientId: { $in: ids } });
    await Patient.deleteMany({ _id: { $in: ids } });
  }

  // ─── Fictional Demo Patients ─────────────────────────────────────────────────
  const patientsData = [
    {
      patientId: 'PT-NK001',
      firstName: 'Nikul',
      lastName: 'Sharma',
      dateOfBirth: new Date('1990-03-15'),
      gender: 'Male',
      phone: '+91-9800010001',
      email: 'nikul.demo@example-fictional.dev',
      address: { street: '12 Demo Street', city: 'Ahmedabad', state: 'Gujarat', postalCode: '380001' },
      bloodGroup: 'B+',
      allergies: ['Penicillin', 'Sulfa drugs'],
      existingConditions: ['Type 2 Diabetes (Demo)', 'Hypertension (Demo)'],
      emergencyContact: { name: 'Demo Contact A', relationship: 'Sibling', phone: '+91-9800010002' },
      status: 'Active',
      lastVisit: new Date('2026-08-20'),
    },
    {
      patientId: 'PT-AD001',
      firstName: 'Aditya',
      lastName: 'Patel',
      dateOfBirth: new Date('1985-07-22'),
      gender: 'Male',
      phone: '+91-9800020001',
      email: 'aditya.demo@example-fictional.dev',
      address: { street: '45 Fiction Lane', city: 'Surat', state: 'Gujarat', postalCode: '395001' },
      bloodGroup: 'O+',
      allergies: ['Aspirin'],
      existingConditions: ['Asthma (Demo)'],
      emergencyContact: { name: 'Demo Contact B', relationship: 'Parent', phone: '+91-9800020002' },
      status: 'Active',
      lastVisit: new Date('2026-08-15'),
    },
    {
      patientId: 'PT-HV001',
      firstName: 'Harsh',
      lastName: 'Verma',
      dateOfBirth: new Date('1998-11-08'),
      gender: 'Male',
      phone: '+91-9800030001',
      email: 'harsh.demo@example-fictional.dev',
      address: { street: '78 Sample Road', city: 'Vadodara', state: 'Gujarat', postalCode: '390001' },
      bloodGroup: 'A-',
      allergies: [],
      existingConditions: [],
      emergencyContact: { name: 'Demo Contact C', relationship: 'Friend', phone: '+91-9800030002' },
      status: 'Active',
      lastVisit: new Date('2026-08-25'),
    },
    {
      patientId: 'PT-PR001',
      firstName: 'Priya',
      lastName: 'Mehta',
      dateOfBirth: new Date('1992-05-14'),
      gender: 'Female',
      phone: '+91-9800040001',
      email: 'priya.demo@example-fictional.dev',
      address: { street: '22 Fictional Avenue', city: 'Rajkot', state: 'Gujarat', postalCode: '360001' },
      bloodGroup: 'AB+',
      allergies: ['Latex'],
      existingConditions: ['PCOS (Demo)'],
      emergencyContact: { name: 'Demo Contact D', relationship: 'Spouse', phone: '+91-9800040002' },
      status: 'Active',
      lastVisit: new Date('2026-07-30'),
    },
    {
      patientId: 'PT-RK001',
      firstName: 'Ravi',
      lastName: 'Kumar',
      dateOfBirth: new Date('1975-12-01'),
      gender: 'Male',
      phone: '+91-9800050001',
      email: 'ravi.demo@example-fictional.dev',
      address: { street: '99 Demo Nagar', city: 'Gandhinagar', state: 'Gujarat', postalCode: '382001' },
      bloodGroup: 'O-',
      allergies: ['NSAIDs'],
      existingConditions: ['Hypertension (Demo)', 'Hyperlipidemia (Demo)'],
      emergencyContact: { name: 'Demo Contact E', relationship: 'Child', phone: '+91-9800050002' },
      status: 'Active',
      lastVisit: new Date('2026-08-10'),
    },
  ];

  const patients = await Patient.insertMany(
    patientsData.map((p) => ({ ...p, doctorId: doctor._id }))
  );
  console.log(`✅ Created ${patients.length} fictional demo patients`);

  const [nikul, aditya, harsh, priya, ravi] = patients;

  // ─── Fictional Medical Records ────────────────────────────────────────────────
  const medicalRecordsData = [
    // Nikul - UTI
    {
      patientId: nikul._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-06-10'),
      chiefComplaint: 'Burning sensation during urination, frequent urge to urinate',
      symptoms: ['Dysuria', 'Urinary frequency', 'Lower abdominal discomfort', 'Mild fever'],
      diagnosis: 'Urinary Tract Infection (UTI) — Lower tract (Demo Record)',
      disease: 'Urinary Tract Infection',
      diseaseStatus: 'Resolved',
      infectionStatus: 'Yes',
      infectionType: 'Bacterial (E. coli — Demo)',
      medications: [
        {
          name: 'Nitrofurantoin (Demo)',
          dose: '100 mg',
          route: 'Oral',
          frequency: 'Twice daily',
          duration: '5 days',
          startDate: new Date('2026-06-10'),
          endDate: new Date('2026-06-15'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription. Take with food.',
        },
      ],
      tests: [
        {
          testName: 'Urine Culture & Sensitivity (Demo)',
          result: 'E. coli (Demo) — Sensitive to Nitrofurantoin',
          unit: 'CFU/mL',
          referenceRange: '< 100,000 CFU/mL',
          testDate: new Date('2026-06-10'),
          status: 'Abnormal',
          notes: 'FICTIONAL DEMO DATA',
        },
        {
          testName: 'Urine Routine Examination (Demo)',
          result: 'WBC: 20-25/hpf (Demo)',
          unit: 'cells/hpf',
          referenceRange: '0-5 cells/hpf',
          testDate: new Date('2026-06-10'),
          status: 'Abnormal',
          notes: 'FICTIONAL DEMO DATA',
        },
      ],
      doctorNotes: 'DEMO RECORD. Increase water intake. Follow up in 1 week. Monitor blood sugar due to diabetes history.',
      followUpDate: new Date('2026-06-17'),
      followUpNotes: 'Check if symptoms resolved.',
      followUpStatus: 'Completed',
      recordType: 'Visit',
    },
    // Nikul - Follow up visit
    {
      patientId: nikul._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-08-20'),
      chiefComplaint: 'Routine diabetes check (Demo)',
      symptoms: ['Fatigue', 'Increased thirst'],
      diagnosis: 'Diabetes Mellitus Type 2 — Routine monitoring (Demo Record)',
      disease: 'Type 2 Diabetes Mellitus',
      diseaseStatus: 'Chronic',
      infectionStatus: 'No',
      medications: [
        {
          name: 'Metformin (Demo)',
          dose: '500 mg',
          route: 'Oral',
          frequency: 'Twice daily with meals',
          duration: 'Ongoing',
          startDate: new Date('2025-01-01'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription.',
        },
      ],
      tests: [
        {
          testName: 'HbA1c (Demo)',
          result: '7.2%',
          unit: '%',
          referenceRange: '< 7%',
          testDate: new Date('2026-08-18'),
          status: 'Borderline',
          notes: 'FICTIONAL DEMO DATA',
        },
        {
          testName: 'Fasting Blood Sugar (Demo)',
          result: '128 mg/dL',
          unit: 'mg/dL',
          referenceRange: '70-100 mg/dL',
          testDate: new Date('2026-08-18'),
          status: 'Abnormal',
          notes: 'FICTIONAL DEMO DATA',
        },
      ],
      doctorNotes: 'DEMO RECORD. Dietary counseling advised. Continue current medication. Recheck in 3 months.',
      followUpDate: new Date('2026-11-20'),
      followUpNotes: 'HbA1c recheck in 3 months.',
      followUpStatus: 'Pending',
      recordType: 'Follow-up',
    },
    // Aditya - Acute Bronchitis
    {
      patientId: aditya._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-07-05'),
      chiefComplaint: 'Persistent cough and breathlessness for 1 week',
      symptoms: ['Productive cough', 'Mild dyspnea', 'Low-grade fever', 'Chest tightness'],
      diagnosis: 'Acute Exacerbation of Asthma (Demo Record)',
      disease: 'Asthma',
      diseaseStatus: 'Active',
      infectionStatus: 'Suspected',
      infectionType: 'Viral (Demo)',
      medications: [
        {
          name: 'Salbutamol Inhaler (Demo)',
          dose: '100 mcg/puff',
          route: 'Inhalation',
          frequency: '2 puffs every 4-6 hours as needed',
          duration: '7 days',
          startDate: new Date('2026-07-05'),
          endDate: new Date('2026-07-12'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription. Use spacer device.',
        },
        {
          name: 'Prednisolone (Demo)',
          dose: '20 mg',
          route: 'Oral',
          frequency: 'Once daily in the morning',
          duration: '5 days',
          startDate: new Date('2026-07-05'),
          endDate: new Date('2026-07-10'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription.',
        },
      ],
      tests: [
        {
          testName: 'Peak Flow Measurement (Demo)',
          result: '65% predicted (Demo)',
          unit: '%',
          referenceRange: '> 80%',
          testDate: new Date('2026-07-05'),
          status: 'Abnormal',
          notes: 'FICTIONAL DEMO DATA',
        },
        {
          testName: 'SpO2 (Demo)',
          result: '94%',
          unit: '%',
          referenceRange: '95-100%',
          testDate: new Date('2026-07-05'),
          status: 'Borderline',
          notes: 'FICTIONAL DEMO DATA',
        },
      ],
      doctorNotes: 'DEMO RECORD. Advised to avoid triggers. Prescribed spacer for inhaler use. Follow up in 1 week.',
      followUpDate: new Date('2026-07-12'),
      followUpNotes: 'Check recovery and peak flow improvement.',
      followUpStatus: 'Completed',
      recordType: 'Visit',
    },
    // Aditya - Follow up
    {
      patientId: aditya._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-08-15'),
      chiefComplaint: 'Routine asthma review (Demo)',
      symptoms: ['Occasional mild wheeze in evenings'],
      diagnosis: 'Asthma — Partially controlled (Demo Record)',
      disease: 'Asthma',
      diseaseStatus: 'Monitoring',
      infectionStatus: 'No',
      medications: [
        {
          name: 'Formoterol/Budesonide Inhaler (Demo)',
          dose: '6/200 mcg',
          route: 'Inhalation',
          frequency: 'Twice daily',
          duration: 'Ongoing',
          startDate: new Date('2026-08-15'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription.',
        },
      ],
      tests: [],
      doctorNotes: 'DEMO RECORD. Stepped up therapy. Review in 6 weeks. Asthma action plan provided.',
      followUpDate: new Date('2026-09-30'),
      followUpNotes: 'Review response to stepped-up therapy.',
      followUpStatus: 'Pending',
      recordType: 'Follow-up',
    },
    // Harsh - Seasonal Flu
    {
      patientId: harsh._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-08-25'),
      chiefComplaint: 'Fever, body aches and sore throat for 3 days',
      symptoms: ['High fever (38.8°C)', 'Myalgia', 'Sore throat', 'Headache', 'Rhinorrhea', 'Fatigue'],
      diagnosis: 'Influenza — Seasonal (Demo Record)',
      disease: 'Influenza',
      diseaseStatus: 'In Treatment',
      infectionStatus: 'Yes',
      infectionType: 'Viral — Influenza A (Demo)',
      medications: [
        {
          name: 'Paracetamol (Demo)',
          dose: '500 mg',
          route: 'Oral',
          frequency: 'Every 6 hours as needed for fever/pain',
          duration: '5 days',
          startDate: new Date('2026-08-25'),
          endDate: new Date('2026-08-30'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription. Do not exceed 4g/day.',
        },
      ],
      tests: [
        {
          testName: 'Rapid Influenza Antigen Test (Demo)',
          result: 'Positive — Influenza A (Demo)',
          unit: 'Qualitative',
          referenceRange: 'Negative',
          testDate: new Date('2026-08-25'),
          status: 'Abnormal',
          notes: 'FICTIONAL DEMO DATA',
        },
        {
          testName: 'CBC (Demo)',
          result: 'WBC: 4.2 × 10³/µL (Demo)',
          unit: '× 10³/µL',
          referenceRange: '4.5-11.0 × 10³/µL',
          testDate: new Date('2026-08-25'),
          status: 'Normal',
          notes: 'FICTIONAL DEMO DATA',
        },
      ],
      doctorNotes: 'DEMO RECORD. Rest and hydration advised. Symptomatic treatment only. Return if fever persists > 5 days.',
      followUpDate: new Date('2026-09-03'),
      followUpNotes: 'Check recovery — if not resolved, consider further investigation.',
      followUpStatus: 'Pending',
      recordType: 'Visit',
    },
    // Priya - Migraine
    {
      patientId: priya._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-07-30'),
      chiefComplaint: 'Severe unilateral headache with nausea and photophobia',
      symptoms: ['Unilateral pulsating headache', 'Nausea', 'Photophobia', 'Phonophobia', 'Visual aura'],
      diagnosis: 'Migraine with aura (Demo Record)',
      disease: 'Migraine',
      diseaseStatus: 'Chronic',
      infectionStatus: 'No',
      medications: [
        {
          name: 'Sumatriptan (Demo)',
          dose: '50 mg',
          route: 'Oral',
          frequency: 'At onset of migraine, repeat after 2h if needed',
          duration: 'As needed (max 2 doses/attack)',
          startDate: new Date('2026-07-30'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription.',
        },
      ],
      tests: [],
      doctorNotes: 'DEMO RECORD. Advised headache diary. Identify triggers. Consider prophylaxis if frequency increases.',
      followUpDate: new Date('2026-10-30'),
      followUpNotes: 'Review headache diary and frequency.',
      followUpStatus: 'Pending',
      recordType: 'Visit',
    },
    // Ravi - Hypertension
    {
      patientId: ravi._id,
      doctorId: doctor._id,
      visitDate: new Date('2026-08-10'),
      chiefComplaint: 'Routine hypertension follow-up (Demo)',
      symptoms: ['Occasional headache', 'Mild dizziness on standing'],
      diagnosis: 'Essential Hypertension — Controlled (Demo Record)',
      disease: 'Hypertension',
      diseaseStatus: 'Chronic',
      infectionStatus: 'No',
      medications: [
        {
          name: 'Amlodipine (Demo)',
          dose: '5 mg',
          route: 'Oral',
          frequency: 'Once daily',
          duration: 'Ongoing',
          startDate: new Date('2024-03-01'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription.',
        },
        {
          name: 'Atorvastatin (Demo)',
          dose: '10 mg',
          route: 'Oral',
          frequency: 'Once daily at bedtime',
          duration: 'Ongoing',
          startDate: new Date('2024-03-01'),
          prescribedBy: 'Dr. Alex Demo',
          notes: 'DEMO RECORD — Not a real prescription.',
        },
      ],
      tests: [
        {
          testName: 'Blood Pressure (Demo)',
          result: '128/82 mmHg',
          unit: 'mmHg',
          referenceRange: '< 130/80 mmHg',
          testDate: new Date('2026-08-10'),
          status: 'Borderline',
          notes: 'FICTIONAL DEMO DATA',
        },
        {
          testName: 'Lipid Panel (Demo)',
          result: 'LDL: 92 mg/dL (Demo)',
          unit: 'mg/dL',
          referenceRange: '< 100 mg/dL',
          testDate: new Date('2026-08-05'),
          status: 'Normal',
          notes: 'FICTIONAL DEMO DATA',
        },
      ],
      doctorNotes: 'DEMO RECORD. BP well controlled. Continue current regimen. Low-salt diet and exercise advised.',
      followUpDate: new Date('2026-11-10'),
      followUpNotes: 'Routine 3-month follow-up.',
      followUpStatus: 'Pending',
      recordType: 'Follow-up',
    },
  ];

  const medicalRecords = await MedicalRecord.insertMany(medicalRecordsData);
  console.log(`✅ Created ${medicalRecords.length} fictional demo medical records`);

  // ─── Fictional Appointments ───────────────────────────────────────────────────
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7);

  const appointmentsData = [
    {
      patientId: nikul._id,
      doctorId: doctor._id,
      appointmentDate: today,
      appointmentTime: '10:00 AM',
      reason: 'Diabetes management follow-up (Demo)',
      status: 'Scheduled',
      type: 'Follow-up',
      duration: 30,
    },
    {
      patientId: aditya._id,
      doctorId: doctor._id,
      appointmentDate: today,
      appointmentTime: '11:30 AM',
      reason: 'Asthma review (Demo)',
      status: 'Scheduled',
      type: 'Follow-up',
      duration: 30,
    },
    {
      patientId: harsh._id,
      doctorId: doctor._id,
      appointmentDate: tomorrow,
      appointmentTime: '09:00 AM',
      reason: 'Flu recovery check (Demo)',
      status: 'Scheduled',
      type: 'Follow-up',
      duration: 20,
    },
    {
      patientId: priya._id,
      doctorId: doctor._id,
      appointmentDate: dayAfter,
      appointmentTime: '03:00 PM',
      reason: 'Migraine consultation (Demo)',
      status: 'Scheduled',
      type: 'Consultation',
      duration: 45,
    },
    {
      patientId: ravi._id,
      doctorId: doctor._id,
      appointmentDate: nextWeek,
      appointmentTime: '10:30 AM',
      reason: 'Hypertension follow-up (Demo)',
      status: 'Scheduled',
      type: 'Follow-up',
      duration: 30,
    },
    {
      patientId: nikul._id,
      doctorId: doctor._id,
      appointmentDate: yesterday,
      appointmentTime: '02:00 PM',
      reason: 'Blood sugar review (Demo)',
      status: 'Completed',
      type: 'Regular',
      duration: 30,
      notes: 'Reviewed HbA1c results. Patient doing well. DEMO RECORD.',
    },
    {
      patientId: aditya._id,
      doctorId: doctor._id,
      appointmentDate: lastWeek,
      appointmentTime: '11:00 AM',
      reason: 'Initial asthma assessment (Demo)',
      status: 'Completed',
      type: 'Regular',
      duration: 45,
      notes: 'Completed initial evaluation. DEMO RECORD.',
    },
    {
      patientId: harsh._id,
      doctorId: doctor._id,
      appointmentDate: lastWeek,
      appointmentTime: '04:30 PM',
      reason: 'General health check (Demo)',
      status: 'No Show',
      type: 'Regular',
      duration: 30,
    },
  ];

  const appointments = await Appointment.insertMany(appointmentsData);
  console.log(`✅ Created ${appointments.length} fictional demo appointments`);

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('─'.repeat(50));
  console.log('📋 DEMO LOGIN CREDENTIALS');
  console.log('─'.repeat(50));
  console.log('  Email    : dr.demo@medicare-portal.dev');
  console.log('  Password : Demo@1234');
  console.log('─'.repeat(50));
  console.log('\n⚠️  All data is fictional and for demonstration only.\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
