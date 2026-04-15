export interface Remedy {
  id:          string;
  title:       string;
  img:         string;
  cat:         string;
  time:        string;
  ing_n:       number;
  benefit:     string;
  ingredients: { n: string; a: string }[];
  steps:       string[];
  benefits:    string[];
  precautions: string[];
}

export interface Category {
  id:    string;
  label: string;
  img:   number;
  color: string;
}

export const CATEGORIES: Category[] = [
  { id:'cold',      label:'Cold & Cough',   img: require('../assets/categories/cold.png'),      color:'#FFF3E0' },
  { id:'digestion', label:'Digestion',       img: require('../assets/categories/digestion.png'), color:'#F3E5F5' },
  { id:'skin',      label:'Skin Care',       img: require('../assets/categories/skincare.png'),  color:'#FCE4EC' },
  { id:'hair',      label:'Hair Care',       img: require('../assets/categories/hair.png'),      color:'#F9FBE7' },
  { id:'immunity',  label:'Immunity',        img: require('../assets/categories/cold.png'),      color:'#E8F5E9' },
  { id:'stress',    label:'Stress & Sleep',  img: require('../assets/categories/hair.png'),      color:'#E3F2FD' },
  { id:'weight',    label:'Weight Loss',     img: require('../assets/categories/digestion.png'), color:'#FFF8E1' },
  { id:'wellness',  label:'Daily Wellness',  img: require('../assets/categories/skincare.png'),  color:'#E0F7FA' },
];

export const REMEDIES: Remedy[] = [
  {
    id: 'ginger-honey',
    title: 'Ginger Honey Remedy',
    img: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
    cat: 'Cold & Cough',
    time: '3 mins',
    ing_n: 3,
    benefit: 'Soothes sore throat & boosts immunity',
    ingredients: [
      { n: 'Fresh Ginger', a: '1 inch' },
      { n: 'Raw Honey',    a: '2 tsp'  },
      { n: 'Warm Water',   a: '1 cup'  },
    ],
    steps: [
      'Peel and grate a 1-inch piece of fresh ginger.',
      'Boil 1 cup of water, let it cool to ~65°C.',
      'Add grated ginger and steep for 2 minutes.',
      'Strain into a cup, stir in honey.',
      'Drink slowly, especially before bedtime.',
    ],
    benefits: [
      'Relieves sore throat and inflammation',
      'Boosts immune system with antioxidants',
      'Natural antibacterial & antiviral properties',
      'Eases congestion and runny nose',
    ],
    precautions: [
      'Avoid honey for children under 1 year',
      'Consult doctor if pregnant',
      'Do not use boiling water',
    ],
  },
  {
    id: 'tulsi-ginger',
    title: 'Tulsi Ginger Tea',
    img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
    cat: 'Immunity',
    time: '5 mins',
    ing_n: 4,
    benefit: 'Powerful immunity booster & cold relief',
    ingredients: [
      { n: 'Tulsi Leaves', a: '8–10 leaves'    },
      { n: 'Ginger',       a: '½ inch, grated' },
      { n: 'Honey',        a: '1 tsp'          },
      { n: 'Water',        a: '1.5 cups'       },
    ],
    steps: [
      'Wash tulsi leaves thoroughly.',
      'Bring 1.5 cups water to a boil.',
      'Add tulsi and grated ginger, simmer 3–4 mins.',
      'Strain into a cup, add honey and serve warm.',
    ],
    benefits: [
      'Powerful adaptogen — reduces stress',
      'Antiviral — fights cold and flu',
      'Strengthens immunity',
      'Clears respiratory congestion',
    ],
    precautions: [
      'Avoid during pregnancy without advice',
      'May interact with blood-thinning meds',
      'Max 2 cups per day',
    ],
  },
  {
    id: 'turmeric-milk',
    title: 'Haldi Doodh (Golden Milk)',
    img: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
    cat: 'Anti-inflammatory',
    time: '10 mins',
    ing_n: 4,
    benefit: 'Anti-inflammatory golden milk for deep sleep',
    ingredients: [
      { n: 'Whole Milk',        a: '1 cup'  },
      { n: 'Turmeric Powder',   a: '½ tsp'  },
      { n: 'Black Pepper',      a: 'a pinch'},
      { n: 'Honey or Jaggery',  a: '1 tsp'  },
    ],
    steps: [
      'Pour milk into saucepan over medium heat.',
      'Add turmeric and a pinch of black pepper.',
      'Whisk continuously while heating.',
      'Heat for 5–7 minutes until steaming.',
      'Pour into a cup, sweeten and serve warm.',
    ],
    benefits: [
      'Powerful anti-inflammatory',
      'Promotes deep restful sleep',
      'Strengthens bones and joints',
      'Boosts immunity',
    ],
    precautions: [
      'Use plant-based milk if lactose intolerant',
      'Black pepper essential for absorption',
      'Avoid excess turmeric',
    ],
  },
  {
    id: 'neem-face',
    title: 'Neem Face Pack',
    img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    cat: 'Skin Care',
    time: '15 mins',
    ing_n: 3,
    benefit: 'Clears acne & purifies skin naturally',
    ingredients: [
      { n: 'Neem Powder', a: '2 tbsp'   },
      { n: 'Rose Water',  a: '2–3 tsp'  },
      { n: 'Turmeric',    a: 'a pinch'  },
    ],
    steps: [
      'Mix neem powder with rose water to form a paste.',
      'Add a pinch of turmeric.',
      'Clean face and pat dry.',
      'Apply evenly, avoiding eyes.',
      'Leave 15 minutes, rinse with cold water.',
    ],
    benefits: [
      'Kills acne-causing bacteria',
      'Reduces inflammation and redness',
      'Clears pores and controls oil',
      'Brightens skin tone',
    ],
    precautions: [
      'Patch test before first use',
      'Avoid on broken skin',
      'Follow up with moisturizer',
    ],
  },
  {
    id: 'amla-juice',
    title: 'Amla Juice',
    img: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&q=80',
    cat: 'Hair & Immunity',
    time: '5 mins',
    ing_n: 2,
    benefit: 'Rich in Vitamin C — hair & immunity booster',
    ingredients: [
      { n: 'Fresh Amla', a: '2–3 pieces' },
      { n: 'Water',      a: '¼ cup'      },
    ],
    steps: [
      'Wash amla fruits and remove seeds.',
      'Blend amla with ¼ cup water until smooth.',
      'Strain through a fine sieve.',
      'Consume immediately on an empty stomach.',
    ],
    benefits: [
      'Highest natural source of Vitamin C',
      'Reduces hair fall',
      'Strengthens immunity',
      'Improves digestion',
    ],
    precautions: [
      'Start with small amounts',
      'Avoid with blood-thinning medication',
      'Best consumed in the morning',
    ],
  },
];

export const PLACEHOLDERS = [
  'Search Cold…', 'Search Flu…', 'Search Indigestion…',
  'Search Hair Fall…', 'Search Acne…', 'Search Stress…',
  'Search Immunity…', 'Search Turmeric…', 'Search Tulsi Tea…',
  'Search Ginger Honey…', 'Search Neem…', 'Search Joint Pain…',
];
