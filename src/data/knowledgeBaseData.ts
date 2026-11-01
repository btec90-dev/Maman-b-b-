import { VaccineInfo, DoctorVisitChecklist } from '../types';

export interface Article {
  id: string;
  category: '1st_trimester' | '2nd_trimester' | '3rd_trimester' | 'labor' | 'newborn' | 'postpartum';
  title: string;
  readTime: string;
  author: string;
  summary: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
}

export const ARTICLES_DATA: Article[] = [
  {
    id: 'art-1',
    category: '1st_trimester',
    title: 'Managing Morning Sickness: Evidence-Based Comfort Strategies',
    readTime: '4 min read',
    author: 'Dr. Émilie Laurent, OB-GYN',
    summary: 'Nausea and vomiting affect up to 80% of expectant mothers in the first 12 weeks. Learn what works, what to eat, and when to call your doctor.',
    sections: [
      {
        heading: 'Why Nausea Occurs',
        body: 'Human Chorionic Gonadotropin (hCG) peaks between weeks 8 and 11. Estrogen and progesterone also slow down gastrointestinal motility, causing food to digest more slowly and acid to pool.'
      },
      {
        heading: 'The 6 Small Meals Strategy',
        body: 'Never let your stomach empty completely. Gastric acid irritating an empty stomach triggers intense nausea. Keep crackers, rice cakes, or plain almonds by your bedside table and eat two bites before sitting upright in the morning.'
      },
      {
        heading: 'Vitamin B6 + Doxylamine',
        body: 'ACOG recommends Vitamin B6 (pyridoxine 25mg three times daily) often paired with doxylamine. Always check with your doctor or midwife before starting any supplement.'
      },
      {
        heading: 'When to Seek Care (Hyperemesis Gravidarum)',
        body: 'Contact your medical provider if you cannot keep liquids down for more than 12 hours, feel lightheaded upon standing, or notice dark, concentrated urine.'
      }
    ]
  },
  {
    id: 'art-2',
    category: '2nd_trimester',
    title: 'Your 20-Week Anatomy Ultrasound: What Sonographers Look For',
    readTime: '5 min read',
    author: 'Sarah Jenkins, RDMS Lead Sonographer',
    summary: 'The Level II anatomy scan is one of pregnancy\'s most memorable milestones. Here is an anatomical guide to every biometric measurement taken.',
    sections: [
      {
        heading: 'Head and Brain Structures',
        body: 'The sonographer views the lateral ventricles, cerebellum, and cisterna magna, checking intracranial structures and skull contour.'
      },
      {
        heading: 'Four-Chamber Cardiac View & Outflow Tracts',
        body: 'The heart is evaluated for all four chambers, outflow tracts, interventricular septum closure, and a normal rhythmic rate between 110-160 bpm.'
      },
      {
        heading: 'Spine, Kidneys, and Limbs',
        body: 'Each vertebrae is scanned along the neural tube. The sonographer counts ten fingers, ten toes, and checks femur length (FL) and abdominal circumference (AC).'
      },
      {
        heading: 'Placenta Location and Amniotic Fluid Index (AFI)',
        body: 'The position of the placenta (anterior, posterior, or fundal) is documented to rule out placenta previa relative to the internal cervical os.'
      }
    ]
  },
  {
    id: 'art-3',
    category: '3rd_trimester',
    title: 'The 5-1-1 Rule & Decoding True Labor vs. Braxton Hicks',
    readTime: '6 min read',
    author: 'Claire Vane, Certified Nurse Midwife',
    summary: 'How to distinguish between practice contractions and active labor, plus when to pack the car and head to your birthing center.',
    sections: [
      {
        heading: 'Braxton Hicks vs. True Labor',
        body: 'Braxton Hicks contractions feel like tight bands across the top of your belly; they are irregular, do not intensify with walking, and often subside with a glass of water and rest. True labor contractions wrap from the lower back around to the pelvis, grow progressively closer together, longer, and stronger.'
      },
      {
        heading: 'The 5-1-1 Labor Rule',
        body: 'Go to the hospital or call your birth team when contractions are 5 minutes apart from the start of one to the start of the next, last 1 full minute each, consistently for 1 full hour (for first-time mothers; with prior births, 4-1-1 or 3-1-1 may be advised).'
      },
      {
        heading: 'Emergency Red Flags',
        body: 'Immediate evaluation is required if you experience bright red bleeding (more than spotting), sudden severe headache with visual disturbances, decrease in fetal movement, or continuous fluid leaking (rupture of membranes).'
      }
    ]
  },
  {
    id: 'art-4',
    category: 'newborn',
    title: 'Newborn Feeding Fundamentals: Latch, Diaper Counts & Cues',
    readTime: '5 min read',
    author: 'Amara Chen, IBCLC Lactation Consultant',
    summary: 'Everything new parents need to know about breast & bottle feeding in the first month: hunger cues, weight regain, and daily diaper milestones.',
    sections: [
      {
        heading: 'Early Hunger Cues',
        body: 'Crying is a late hunger cue. Look for early cues: root reflex (turning head toward touch), hand sucking, lip smacking, and rapid eye movements under closed lids.'
      },
      {
        heading: 'The Daily Diaper Rule (Days 1–6)',
        body: 'Day 1: At least 1 wet & 1 meconium diaper. Day 2: 2 wet & 2 transitional. Day 3: 3 wet & 3 stools. By Day 5 onwards: Expect 6+ heavy wet diapers and 3-4 golden seedy stools daily.'
      },
      {
        heading: 'Cluster Feeding in the Evening',
        body: 'Newborns frequently cluster feed in the evening (feeding every 30-60 minutes). This is normal physiological behavior that stimulates mom\'s prolactin surge and builds milk supply.'
      }
    ]
  },
  {
    id: 'art-5',
    category: 'postpartum',
    title: 'The 4th Trimester: Caring for Mom\'s Body and Mind',
    readTime: '5 min read',
    author: 'Dr. Miriam O\'Connor, Perinatal Psychologist',
    summary: 'The postpartum period requires gentle recovery, emotional nourishment, pelvic floor awareness, and screening for postpartum mood adjustments.',
    sections: [
      {
        heading: 'Physical Healing & Lochia',
        body: 'Postpartum bleeding (lochia) transitions from red (rubra) to pink-brown (serosa) to yellowish-white (alba) over 4 to 6 weeks. Rest as much as possible; increased bleeding often signals you need more rest.'
      },
      {
        heading: 'Baby Blues vs. Postpartum Depression (PPD)',
        body: 'Baby blues occur in up to 80% of mothers due to the dramatic drop in progesterone and estrogen 3-5 days after delivery, resolving within 2 weeks. If tearfulness, overwhelming anxiety, or numbness persist past 14 days, reach out to your provider for an Edinburgh Postnatal Depression Scale (EPDS) review.'
      },
      {
        heading: 'Pelvic Floor Rehabilitation',
        body: 'Avoid high-impact exercises until cleared by your OB or pelvic floor physical therapist at the 6-week visit. Gentle diaphragmatic breathing helps restore intra-abdominal pressure safely.'
      }
    ]
  }
];

export const VACCINE_SCHEDULE: VaccineInfo[] = [
  {
    id: 'vac-hepb-1',
    name: 'Hepatitis B (Dose 1)',
    diseaseTarget: 'Hepatitis B virus (Liver infection)',
    recommendedAge: 'Birth (within 24 hours)',
    monthAge: 0,
    description: 'Provides critical first-line protection against chronic liver disease.',
    isCompleted: true,
    administeredDate: '2026-03-01'
  },
  {
    id: 'vac-dtap-1',
    name: 'DTaP (Dose 1)',
    diseaseTarget: 'Diphtheria, Tetanus, & Pertussis (Whooping cough)',
    recommendedAge: '2 Months',
    monthAge: 2,
    description: 'Guards against whooping cough and tetanus spasms.',
    isCompleted: true,
    administeredDate: '2026-05-02'
  },
  {
    id: 'vac-ipv-1',
    name: 'IPV Polio (Dose 1)',
    diseaseTarget: 'Poliovirus (Paralysis)',
    recommendedAge: '2 Months',
    monthAge: 2,
    description: 'Inactivated poliovirus vaccine conferring strong systemic immunity.',
    isCompleted: true,
    administeredDate: '2026-05-02'
  },
  {
    id: 'vac-hib-1',
    name: 'Hib (Dose 1)',
    diseaseTarget: 'Haemophilus influenzae type b (Meningitis)',
    recommendedAge: '2 Months',
    monthAge: 2,
    description: 'Prevents bacterial meningitis, epiglottitis, and severe pneumonia.',
    isCompleted: true,
    administeredDate: '2026-05-02'
  },
  {
    id: 'vac-pcv-1',
    name: 'PCV15 / PCV20 (Dose 1)',
    diseaseTarget: 'Pneumococcal disease (Ear infections & pneumonia)',
    recommendedAge: '2 Months',
    monthAge: 2,
    description: 'Conjugate vaccine against invasive pneumococcal serotypes.',
    isCompleted: true,
    administeredDate: '2026-05-02'
  },
  {
    id: 'vac-rv-1',
    name: 'Rotavirus (Dose 1)',
    diseaseTarget: 'Rotavirus (Severe infant diarrhea)',
    recommendedAge: '2 Months (Oral drops)',
    monthAge: 2,
    description: 'Oral liquid vaccine protecting against dehydration from acute viral gastroenteritis.',
    isCompleted: true,
    administeredDate: '2026-05-02'
  },
  {
    id: 'vac-dtap-2',
    name: 'DTaP (Dose 2)',
    diseaseTarget: 'Diphtheria, Tetanus, Pertussis',
    recommendedAge: '4 Months',
    monthAge: 4,
    description: 'Booster dose strengthening immunity prior to infant mobility.',
    isCompleted: false,
  },
  {
    id: 'vac-pcv-2',
    name: 'PCV15 / PCV20 (Dose 2)',
    diseaseTarget: 'Pneumococcal disease',
    recommendedAge: '4 Months',
    monthAge: 4,
    description: 'Second dose of pneumococcal conjugate.',
    isCompleted: false,
  },
  {
    id: 'vac-dtap-3',
    name: 'DTaP (Dose 3)',
    diseaseTarget: 'Diphtheria, Tetanus, Pertussis',
    recommendedAge: '6 Months',
    monthAge: 6,
    description: 'Completes the infant primary series for whooping cough.',
    isCompleted: false,
  },
  {
    id: 'vac-flu',
    name: 'Influenza (Annual)',
    diseaseTarget: 'Seasonal Flu virus',
    recommendedAge: '6 Months & older',
    monthAge: 6,
    description: 'First season requires two doses spaced 4 weeks apart.',
    isCompleted: false,
  },
  {
    id: 'vac-mmr-1',
    name: 'MMR (Dose 1)',
    diseaseTarget: 'Measles, Mumps, & Rubella',
    recommendedAge: '12–15 Months',
    monthAge: 12,
    description: 'Protects against highly contagious airborne measles and rubella.',
    isCompleted: false,
  },
  {
    id: 'vac-var-1',
    name: 'Varicella (Chickenpox Dose 1)',
    diseaseTarget: 'Chickenpox virus',
    recommendedAge: '12–15 Months',
    monthAge: 12,
    description: 'Prevents chickenpox rash and secondary skin infections.',
    isCompleted: false,
  },
];

export const DOCTOR_VISITS: DoctorVisitChecklist[] = [
  {
    id: 'doc-1',
    timing: 'Weeks 8–10',
    title: 'First Comprehensive Prenatal Intake',
    trimesterOrAge: '1st Trimester',
    checkpoints: [
      { id: 'cp-1-1', text: 'Transvaginal / abdominal ultrasound to confirm gestational sac and fetal heartbeat', checked: true },
      { id: 'cp-1-2', text: 'Baseline maternal blood work (CBC, Blood type, Rh factor, Rubella titer, STI screening)', checked: true },
      { id: 'cp-1-3', text: 'Review family medical history and discuss genetic screening options (NIPT / Carrier screening)', checked: true },
      { id: 'cp-1-4', text: 'Review current medications and safe pregnancy supplements', checked: true }
    ],
    suggestedQuestions: [
      'Which over-the-counter allergy or headache medications are safe for me?',
      'Who do I call after hours if I experience spotting or intense cramping?',
      'Can I continue my regular exercise routine?'
    ]
  },
  {
    id: 'doc-2',
    timing: 'Weeks 18–22',
    title: 'Level II Anatomy Ultrasound Scan',
    trimesterOrAge: '2nd Trimester',
    checkpoints: [
      { id: 'cp-2-1', text: 'Comprehensive organ system survey (Brain ventricles, 4-chamber heart, kidneys, spine)', checked: true },
      { id: 'cp-2-2', text: 'Confirm placenta location relative to internal cervical os', checked: true },
      { id: 'cp-2-3', text: 'Fetal growth biometry assessment (BPD, HC, AC, FL)', checked: true },
      { id: 'cp-2-4', text: 'Optional fetal sex reveal if desired', checked: true }
    ],
    suggestedQuestions: [
      'Is my placenta anterior or posterior? (Helps explain when kicks are felt)',
      'Is amniotic fluid volume within ideal physiological limits?',
      'When should I schedule my 1-hour glucose tolerance test?'
    ]
  },
  {
    id: 'doc-3',
    timing: 'Weeks 26–28',
    title: 'Glucose Screening & RhoGAM Injection',
    trimesterOrAge: '3rd Trimester',
    checkpoints: [
      { id: 'cp-3-1', text: '1-Hour 50g Oral Glucose Tolerance Test (OGTT) for gestational diabetes screening', checked: false },
      { id: 'cp-3-2', text: 'Repeat CBC to check for maternal gestational anemia (Hemoglobin/Ferritin)', checked: false },
      { id: 'cp-3-3', text: 'RhoGAM injection administered if mother is Rh-negative', checked: false },
      { id: 'cp-3-4', text: 'Tdap vaccine discussion to pass whooping cough antibodies to baby', checked: false }
    ],
    suggestedQuestions: [
      'What are the next steps if my 1-hour glucose screen is borderline?',
      'How often should I be performing daily fetal kick counts?',
      'Are there infant CPR and breastfeeding classes you recommend?'
    ]
  },
  {
    id: 'doc-4',
    timing: 'Week 36',
    title: 'Group B Strep (GBS) Swab & Fetal Presentation',
    trimesterOrAge: '3rd Trimester',
    checkpoints: [
      { id: 'cp-4-1', text: 'Vaginal and rectal swab for Group B Streptococcus culture', checked: false },
      { id: 'cp-4-2', text: 'Leopold maneuvers or quick bedside ultrasound to check baby vertex (head-down) position', checked: false },
      { id: 'cp-4-3', text: 'Cervical effacement and dilation assessment (optional)', checked: false },
      { id: 'cp-4-4', text: 'Review labor triage protocol and hospital registration', checked: false }
    ],
    suggestedQuestions: [
      'If my water breaks without contractions, what is the protocol?',
      'If I am GBS positive, when will IV antibiotics be administered in labor?',
      'Who is on call from the practice during my delivery window?'
    ]
  },
  {
    id: 'doc-5',
    timing: '6 Weeks Postpartum',
    title: 'Maternal 6-Week Postpartum Recovery Checkup',
    trimesterOrAge: 'Postpartum',
    checkpoints: [
      { id: 'cp-5-1', text: 'Physical exam: Uterine involution, perineal tear / episiotomy or C-section incision healing', checked: false },
      { id: 'cp-5-2', text: 'Edinburgh Postnatal Depression Scale (EPDS) mental health assessment', checked: false },
      { id: 'cp-5-3', text: 'Pelvic floor assessment and clearance for exercise / intimacy', checked: false },
      { id: 'cp-5-4', text: 'Family planning & contraception review if desired', checked: false }
    ],
    suggestedQuestions: [
      'Is my abdominal diastasis recti closing normally?',
      'Can you recommend a specialized pelvic floor physical therapist?',
      'Which contraception methods are compatible with breastfeeding?'
    ]
  }
];
