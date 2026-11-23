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

// Clean Initial Curriculum State (No Dummy Data)
export const OFFICIAL_COURSES = [];
export const OFFICIAL_BATCHES = [];

// Official Standard Faculty & Trainers
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
    status: 'Active',
    bio: 'Specialist in MERN stack, React.js, Node.js, and cloud application development.',
    skills: [
      'React.js',
      'Node.js',
      'Python',
      'JavaScript',
      'Java',
      'Docker & DevOps',
      'MongoDB'
    ],
    assignedCourses: [],
    assignedBatches: [],
    schedule: [],
    joiningDate: '2026-11-22'
  }
];

// Production Initial State for EduPulse CRM
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
