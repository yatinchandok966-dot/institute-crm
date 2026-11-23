export const LEAD_SOURCES = [
  'Website',
  'Facebook',
  'Instagram',
  'LinkedIn',
  'Google Ads',
  'Referral',
  'Walk-in',
  'Phone Call'
];

export const LEAD_PIPELINE_STAGES = [
  'New',
  'Contacted',
  'Counselling Scheduled',
  'Interested',
  'Follow-up Required',
  'Converted / Lost'
];

export const LEAD_PRIORITIES = ['Hot', 'Warm', 'Cold'];

export const OFFICIAL_TRAINERS = [
  {
    id: 1795363539407,
    employeeId: 'EMP-2026-001',
    name: 'Deepika',
    role: 'Technical Trainer',
    department: 'Academic Faculty',
    phone: '9856429756',
    email: 'deepika@gmail.com',
    qualification: 'M.Tech.',
    experience: '2+ Years',
    status: 'Full Time',
    bio: 'Specialist in MERN stack, React.js, Node.js, and cloud application development.',
    skills: ['React.js', 'Node.js', 'Python', 'JavaScript', 'Java', 'Docker & DevOps', 'MongoDB'],
    assignedCourses: ['Full Stack Web Development (MERN)'],
    assignedBatches: ['FSWD Morning Batch (M26)', 'FSWD Evening Batch (E12)'],
    schedule: [
      { id: 1, day: 'Mon-Fri', time: '09:00 AM - 11:30 AM', batch: 'FSWD Morning Batch (M26)', course: 'Full Stack Web Development (MERN)', room: 'Lab 1', mode: 'Classroom' },
      { id: 2, day: 'Mon-Fri', time: '06:00 PM - 08:30 PM', batch: 'FSWD Evening Batch (E12)', course: 'Full Stack Web Development (MERN)', room: 'Lab 2', mode: 'Hybrid' }
    ],
    joiningDate: '2026-11-22'
  }
];

// Clean initial empty state for Institute CRM
export const initialInstituteData = {
  stats: {
    totalStudents: 0,
    activeStudentsGrowth: '0%',
    newLeadsThisMonth: 0,
    leadConversionRate: '0%',
    confirmedAdmissions: 0,
    activeCourses: 0,
    activeBatches: 0,
    monthlyRevenue: 0,
    revenueGrowth: '0%',
    pendingFees: 0,
    attendanceAverage: '0%',
    feeCollectionRate: '0%'
  },
  revenueTimeline: [],
  courses: [],
  batches: [],
  recentLeads: [],
  admissions: [],
  students: [],
  trainers: OFFICIAL_TRAINERS,
  feeTransactions: []
};
