/**
 * Mock Analysis Service — Simulates Gemini AI policy analysis.
 * Returns structured JSON after a realistic delay.
 * Will be replaced with real Gemini API in production phase.
 */

const MOCK_ANALYSES = {
  health: {
    policyOverview: {
      name: 'Star Health Premier Insurance',
      type: 'Health Insurance',
      provider: 'Star Health & Allied Insurance Co.',
      policyNumber: 'SH-2025-PRE-884721',
      effectiveDate: '2025-04-01',
      expiryDate: '2026-03-31',
      sumInsured: '₹15,00,000',
      premium: '₹18,450 / year',
    },
    coverageScore: 78,
    coverageGrade: 'B+',
    summary:
      'This is a comprehensive individual health insurance policy with a ₹15 lakh sum insured. It covers hospitalization, daycare procedures, and pre/post hospitalization expenses. The policy includes a restoration benefit and no-claim bonus. However, several common conditions have waiting periods, and there are notable sub-limits on room rent that could lead to out-of-pocket expenses during hospitalization.',
    coverageItems: [
      { category: 'Hospitalization', status: 'covered', detail: 'In-patient treatment including room, nursing, ICU charges' },
      { category: 'Pre-Hospitalization', status: 'covered', detail: 'Up to 30 days before admission' },
      { category: 'Post-Hospitalization', status: 'covered', detail: 'Up to 60 days after discharge' },
      { category: 'Day Care Procedures', status: 'covered', detail: '541 listed daycare procedures covered' },
      { category: 'Ambulance Charges', status: 'partial', detail: 'Covered up to ₹2,500 per hospitalization' },
      { category: 'Organ Donor Expenses', status: 'covered', detail: 'Harvesting and related expenses covered' },
      { category: 'AYUSH Treatment', status: 'covered', detail: 'Ayurveda, Yoga, Unani, Siddha, Homeopathy' },
      { category: 'Maternity Cover', status: 'not_covered', detail: 'Not included in base policy — available as add-on' },
      { category: 'Dental Treatment', status: 'not_covered', detail: 'Only covered if arising from an accident' },
      { category: 'Outpatient Consultation', status: 'not_covered', detail: 'OPD visits not covered under this plan' },
    ],
    exclusions: [
      { title: 'Pre-Existing Diseases', severity: 'high', detail: '48-month waiting period for any pre-existing condition declared or undeclared.' },
      { title: 'Specific Disease Waiting Period', severity: 'high', detail: '24-month wait for cataracts, hernia, joint replacement, ENT disorders, and 15 other listed conditions.' },
      { title: 'Room Rent Sub-Limit', severity: 'medium', detail: 'Single private AC room capped at 1% of sum insured per day (₹15,000/day). Co-payment applies if exceeded.' },
      { title: 'Cosmetic / Aesthetic Treatment', severity: 'low', detail: 'Any elective cosmetic or plastic surgery is permanently excluded.' },
      { title: 'Self-Inflicted Injuries', severity: 'low', detail: 'Injuries caused intentionally or under influence of drugs/alcohol are not covered.' },
      { title: 'War & Nuclear Perils', severity: 'low', detail: 'Standard exclusion for war, terrorism, nuclear contamination.' },
    ],
    keyTerms: [
      { term: 'Sum Insured', meaning: 'The maximum amount the insurer will pay in a policy year — ₹15,00,000 for this policy.' },
      { term: 'Restoration Benefit', meaning: 'If sum insured is exhausted, it gets restored once for unrelated illness — essentially doubling your cover.' },
      { term: 'No-Claim Bonus (NCB)', meaning: 'Sum insured increases by 10% for every claim-free year, up to 50% cumulative.' },
      { term: 'Co-Payment', meaning: 'Percentage you pay out-of-pocket. This policy has 0% co-pay below age 60, 20% above 60.' },
      { term: 'Sub-Limit', meaning: 'A cap on specific expenses within the sum insured. Room rent sub-limit of 1% applies here.' },
      { term: 'Cashless Network', meaning: 'List of 14,000+ hospitals where you can get treated without upfront payment.' },
    ],
    riskFlags: [
      { flag: 'Room Rent Sub-Limit May Cause Bill Shock', level: 'warning', detail: 'If your hospital charges ₹25,000/day for a room but your limit is ₹15,000/day, ALL related expenses (surgeon, anesthesia, etc.) get proportionally reduced — not just room rent.' },
      { flag: '4-Year PED Waiting Period', level: 'critical', detail: 'If you have diabetes, hypertension, or thyroid conditions, you\'ll have no coverage for related hospitalization until April 2029.' },
      { flag: 'No Maternity Coverage', level: 'info', detail: 'If you\'re planning a family in the next 2 years, this policy won\'t cover delivery expenses unless you add the maternity rider (₹4,200/year extra).' },
      { flag: 'Ambulance Cap is Low', level: 'info', detail: '₹2,500 for ambulance is often insufficient for air ambulance or long-distance transport. Average ambulance cost in metros is ₹3,000–8,000.' },
    ],
  },

  auto: {
    policyOverview: {
      name: 'ICICI Lombard Comprehensive Motor',
      type: 'Motor Insurance — Comprehensive',
      provider: 'ICICI Lombard General Insurance',
      policyNumber: 'IL-MOT-2025-CMP-331902',
      effectiveDate: '2025-01-15',
      expiryDate: '2026-01-14',
      sumInsured: '₹8,45,000 (IDV)',
      premium: '₹12,800 / year',
    },
    coverageScore: 82,
    coverageGrade: 'A-',
    summary:
      'Comprehensive motor insurance covering own damage + third-party liability. IDV set at ₹8.45 lakh based on manufacturer\'s listed price minus depreciation. Includes personal accident cover for owner-driver (₹15 lakh), zero depreciation add-on, and roadside assistance. Strong overall coverage but depreciation on plastic/rubber parts and consumables are excluded from base policy.',
    coverageItems: [
      { category: 'Own Damage', status: 'covered', detail: 'Accidental damage, fire, theft, natural disasters' },
      { category: 'Third-Party Liability', status: 'covered', detail: 'Unlimited for death/injury, ₹7.5 lakh for property damage' },
      { category: 'Personal Accident', status: 'covered', detail: '₹15 lakh cover for owner-driver (mandatory)' },
      { category: 'Zero Depreciation', status: 'covered', detail: 'Add-on active — full claim without depreciation deduction' },
      { category: 'Roadside Assistance', status: 'covered', detail: 'Towing, flat tire, battery jump-start, fuel delivery' },
      { category: 'Engine Protection', status: 'not_covered', detail: 'Hydrostatic lock / water ingress damage not covered' },
      { category: 'Consumables', status: 'not_covered', detail: 'Engine oil, coolant, brake fluid, nuts & bolts not covered' },
    ],
    exclusions: [
      { title: 'Drunk / Unlicensed Driving', severity: 'high', detail: 'Any claim arising while driving under influence or without valid license is void.' },
      { title: 'Consequential Loss', severity: 'medium', detail: 'Loss of use, depreciation in value, wear & tear not covered.' },
      { title: 'Geographical Limits', severity: 'low', detail: 'Coverage valid only within India. Cross-border trips to Nepal/Bhutan need endorsement.' },
    ],
    keyTerms: [
      { term: 'IDV (Insured Declared Value)', meaning: 'Current market value of your vehicle — ₹8,45,000. This is the max payout for total loss/theft.' },
      { term: 'NCB (No Claim Bonus)', meaning: 'Discount on premium for claim-free years: 20% → 25% → 35% → 45% → 50%.' },
      { term: 'Deductible', meaning: 'Compulsory deductible of ₹1,000. You pay this amount first in every own-damage claim.' },
    ],
    riskFlags: [
      { flag: 'No Engine Protection in Monsoon-Prone Area', level: 'warning', detail: 'If you park in flood-prone zones or drive through waterlogged roads, engine damage won\'t be covered.' },
      { flag: 'Zero-Dep Valid for 2 Claims Only', level: 'info', detail: 'Zero depreciation add-on is limited to 2 claims per year. Third claim onwards, standard depreciation applies.' },
    ],
  },
};

/**
 * Simulate AI analysis with realistic processing delay.
 * @param {File} file - The uploaded PDF file
 * @param {function} onProgress - Progress callback (0-100)
 * @returns {Promise<object>} Structured analysis result
 */
export async function analyzePolicy(file, onProgress) {
  const steps = [
    { progress: 10, label: 'Reading document...', delay: 600 },
    { progress: 25, label: 'Extracting text layers...', delay: 800 },
    { progress: 40, label: 'Identifying policy type...', delay: 700 },
    { progress: 55, label: 'Analyzing coverage clauses...', delay: 1000 },
    { progress: 70, label: 'Detecting exclusions...', delay: 900 },
    { progress: 85, label: 'Generating risk assessment...', delay: 800 },
    { progress: 95, label: 'Compiling results...', delay: 500 },
    { progress: 100, label: 'Analysis complete', delay: 300 },
  ];

  for (const step of steps) {
    await new Promise((resolve) => setTimeout(resolve, step.delay));
    onProgress?.(step.progress, step.label);
  }

  // Pick analysis based on filename hints, else default to health
  const fileName = file.name.toLowerCase();
  const isAuto = fileName.includes('motor') || fileName.includes('car') || fileName.includes('auto') || fileName.includes('vehicle');
  const analysis = isAuto ? MOCK_ANALYSES.auto : MOCK_ANALYSES.health;

  return {
    ...analysis,
    analyzedAt: new Date().toISOString(),
    fileName: file.name,
    fileSize: file.size,
  };
}

/**
 * Get a human-readable file size string.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
