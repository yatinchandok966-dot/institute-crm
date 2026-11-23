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
  trainers: [],
  feeTransactions: []
};
