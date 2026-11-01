import { Milestone } from '../types';

export const INITIAL_MILESTONES: Milestone[] = [
  // 1-2 Months
  {
    id: 'm-1-1',
    ageMonth: 2,
    category: 'social_language',
    title: 'First Social Smile',
    description: 'Smiles back at you when you talk, smile, or make gentle eye contact with them.',
    isAchieved: true,
    achievedDate: '2026-04-12',
  },
  {
    id: 'm-1-2',
    ageMonth: 2,
    category: 'physical',
    title: 'Brief Head Lift during Tummy Time',
    description: 'Holds head up briefly when lying on tummy; moves both arms and both legs together.',
    isAchieved: true,
    achievedDate: '2026-04-15',
  },
  {
    id: 'm-1-3',
    ageMonth: 2,
    category: 'cognitive',
    title: 'Visual Tracking of Moving Faces',
    description: 'Follows moving objects or your face with eyes across midline for a few seconds.',
    isAchieved: true,
    achievedDate: '2026-04-18',
  },

  // 4 Months
  {
    id: 'm-4-1',
    ageMonth: 4,
    category: 'social_language',
    title: 'Chuckles & Belly Laughs',
    description: 'Laughs out loud when tickled gently or when you make funny cooing sounds.',
    isAchieved: true,
    achievedDate: '2026-06-20',
  },
  {
    id: 'm-4-2',
    ageMonth: 4,
    category: 'physical',
    title: 'Pushes Up on Elbows & Forearms',
    description: 'Pushes up onto forearms with chest raised off the ground during tummy time.',
    isAchieved: true,
    achievedDate: '2026-06-25',
  },
  {
    id: 'm-4-3',
    ageMonth: 4,
    category: 'cognitive',
    title: 'Reaches for Dangling Toys',
    description: 'Swats and grasps rattles or soft toys with one or both hands, bringing them to mouth.',
    isAchieved: false,
  },

  // 6 Months
  {
    id: 'm-6-1',
    ageMonth: 6,
    category: 'physical',
    title: 'Rolls Tummy to Back & Sits with Support',
    description: 'Rolls over in both directions (front to back and back to front) and sits propped on hands.',
    isAchieved: false,
  },
  {
    id: 'm-6-2',
    ageMonth: 6,
    category: 'social_language',
    title: 'Babbles Consonant Sounds ("ba", "da", "ma")',
    description: 'Strings together vowel and consonant sounds; takes turns "conversing" with parents.',
    isAchieved: false,
  },
  {
    id: 'm-6-3',
    ageMonth: 6,
    category: 'cognitive',
    title: 'Recognizes Familiar Faces in Mirror',
    description: 'Smiles at their own reflection in a safe baby mirror and reaches for reflected toys.',
    isAchieved: false,
  },

  // 9 Months
  {
    id: 'm-9-1',
    ageMonth: 9,
    category: 'physical',
    title: 'Sits Independently without Support',
    description: 'Maintains steady sitting balance without using hands; transitions to all-fours position.',
    isAchieved: false,
  },
  {
    id: 'm-9-2',
    ageMonth: 9,
    category: 'cognitive',
    title: 'Understands Object Permanence (Peek-a-boo)',
    description: 'Looks for a dropped toy under a blanket or behind furniture; anticipates peek-a-boo.',
    isAchieved: false,
  },
  {
    id: 'm-9-3',
    ageMonth: 9,
    category: 'physical',
    title: 'Pincer Grasp Developing',
    description: 'Picks up small pieces of baby-safe food (puffs or soft berries) between thumb and index finger.',
    isAchieved: false,
  },

  // 12 Months
  {
    id: 'm-12-1',
    ageMonth: 12,
    category: 'physical',
    title: 'Pulls to Stand & Cruises Furniture',
    description: 'Pulls themselves up on coffee tables or sofa; walks sideways holding on (cruising).',
    isAchieved: false,
  },
  {
    id: 'm-12-2',
    ageMonth: 12,
    category: 'social_language',
    title: 'First Meaningful Word ("mama", "dada", "ball")',
    description: 'Says at least one clear word to identify a specific person, pet, or favorite object.',
    isAchieved: false,
  },
  {
    id: 'm-12-3',
    ageMonth: 12,
    category: 'social_language',
    title: 'Waves "Bye-Bye" & Claps Hands',
    description: 'Imitates social gestures unprompted when family members enter or leave the room.',
    isAchieved: false,
  },

  // 18 Months
  {
    id: 'm-18-1',
    ageMonth: 18,
    category: 'physical',
    title: 'Walks Independently & Drinks from Open Cup',
    description: 'Takes steady steps without assistance; drinks from a small cup with minimal spilling.',
    isAchieved: false,
  },
  {
    id: 'm-18-2',
    ageMonth: 18,
    category: 'cognitive',
    title: 'Simple Pretend Play',
    description: 'Feeds a stuffed animal with a toy spoon, talks into a pretend phone, or stacks blocks.',
    isAchieved: false,
  },

  // 24 Months
  {
    id: 'm-24-1',
    ageMonth: 24,
    category: 'social_language',
    title: 'Two-Word Phrases ("more milk", "big truck")',
    description: 'Combines at least two words spontaneously to express desires or observations.',
    isAchieved: false,
  },
  {
    id: 'm-24-2',
    ageMonth: 24,
    category: 'physical',
    title: 'Runs, Jumps & Kicks a Ball Forward',
    description: 'Can run with coordination, jump off the ground with both feet, and kick a ball.',
    isAchieved: false,
  },
];
