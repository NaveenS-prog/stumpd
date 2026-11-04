import { Venue } from '../types/tournament';

export const VENUES: Venue[] = [
  {
    id: 'chinnaswamy',
    name: 'M. Chinnaswamy Stadium',
    city: 'Bengaluru',
    country: 'India',
    pitchType: 'FlatBatting',
    pitchDescription: 'High altitude and lightning outfield make this a paradise for power hitters.',
    modifier: {
      battingBoost: 0.15,
      description: '+15% Batting rating boost across both teams',
    },
  },
  {
    id: 'lords',
    name: "Lord's Cricket Ground",
    city: 'London',
    country: 'England',
    pitchType: 'GreenSeamer',
    pitchDescription: 'Historic slope and persistent green canopy produce sharp seam and swing.',
    modifier: {
      pacerBoost: 0.20,
      description: '+20% Fast bowler rating boost, inducing top-order collapses',
    },
  },
  {
    id: 'chepauk',
    name: 'MA Chidambaram Stadium (Chepauk)',
    city: 'Chennai',
    country: 'India',
    pitchType: 'Dustbowl',
    pitchDescription: 'Dry, baking red clay surface offering prodigious turn and variable bounce.',
    modifier: {
      spinBoost: 0.20,
      description: '+20% Spin bowler rating boost, stifling middle-order scoring',
    },
  },
  {
    id: 'kensington_oval',
    name: 'Kensington Oval',
    city: 'Bridgetown',
    country: 'West Indies',
    pitchType: 'ExpressBouncy',
    pitchDescription: 'Hard Caribbean deck with fierce carry and steep bounce off a good length.',
    modifier: {
      pacerBoost: 0.15,
      description: '+15% Fast bowling rating boost from steep trajectory',
    },
  },
  {
    id: 'the_oval',
    name: 'The Oval',
    city: 'London',
    country: 'England',
    pitchType: 'SportingBalanced',
    pitchDescription: 'Classical English sporting wicket with reliable carry and fair bat-vs-ball balance.',
    modifier: {
      description: 'Evenly balanced track rewarding disciplined cricket',
    },
  },
  {
    id: 'wankhede',
    name: 'Wankhede Stadium',
    city: 'Mumbai',
    country: 'India',
    pitchType: 'FlatBatting',
    pitchDescription: 'Coastal red soil wicket with electric boundaries and dew aiding chases.',
    modifier: {
      battingBoost: 0.10,
      description: '+10% Batting rating boost under the lights',
    },
  },
  {
    id: 'mcg',
    name: 'Melbourne Cricket Ground (MCG)',
    city: 'Melbourne',
    country: 'Australia',
    pitchType: 'SportingBalanced',
    pitchDescription: 'Vast stadium dimensions where boundary-running and tactical field setting reign supreme.',
    modifier: {
      description: 'Championship grand stage testing clutch nerves and tactical depth',
    },
  },
  {
    id: 'premadasa',
    name: 'R. Premadasa Stadium',
    city: 'Colombo',
    country: 'Sri Lanka',
    pitchType: 'Dustbowl',
    pitchDescription: 'Humid, turning track that rewards subtle flight and gripping variations.',
    modifier: {
      spinBoost: 0.15,
      description: '+15% Spin bowler rating boost in humid subcontinent heat',
    },
  },
  {
    id: 'edgbaston',
    name: 'Edgbaston Cricket Ground',
    city: 'Birmingham',
    country: 'England',
    pitchType: 'SportingBalanced',
    pitchDescription: 'Atmospheric cauldron with fair balance between aggressive strokeplay and swing.',
    modifier: {
      description: 'Dynamic English wicket rewarding proactive shotmaking',
    },
  },
  {
    id: 'eden_gardens',
    name: 'Eden Gardens',
    city: 'Kolkata',
    country: 'India',
    pitchType: 'SportingBalanced',
    pitchDescription: 'Colosseum of Indian cricket with true bounce, high pace value, and sharp turn late.',
    modifier: {
      battingBoost: 0.10,
      description: '+10% Batting boost for fearless strokeplay in front of 66,000 fans',
    },
  },
  {
    id: 'sawai_mansingh',
    name: 'Sawai Mansingh Stadium',
    city: 'Jaipur',
    country: 'India',
    pitchType: 'SportingBalanced',
    pitchDescription: 'Expansive outfield and two-paced wicket requiring tactical running and discipline.',
    modifier: {
      description: 'Sprawling boundaries testing stamina and shot placement',
    },
  },
  {
    id: 'narendra_modi',
    name: 'Narendra Modi Stadium',
    city: 'Ahmedabad',
    country: 'India',
    pitchType: 'SportingBalanced',
    pitchDescription: 'Massive world-record amphitheatre featuring dependable carry and big boundary dimensions.',
    modifier: {
      description: 'Grand venue testing composure in high-stakes pressure situations',
    },
  },
];
