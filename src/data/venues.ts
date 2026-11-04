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
];
