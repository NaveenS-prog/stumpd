import { Team, Era, IPLEra } from '../types/player';

export const NATIONAL_TEAMS: Team[] = [
  {
    id: 'India',
    name: 'India',
    shortName: 'IND',
    type: 'Country',
    color: '#1E40AF',
  },
  {
    id: 'Australia',
    name: 'Australia',
    shortName: 'AUS',
    type: 'Country',
    color: '#CA8A04',
  },
  {
    id: 'England',
    name: 'England',
    shortName: 'ENG',
    type: 'Country',
    color: '#DC2626',
  },
  {
    id: 'South Africa',
    name: 'South Africa',
    shortName: 'SA',
    type: 'Country',
    color: '#15803D',
  },
  {
    id: 'New Zealand',
    name: 'New Zealand',
    shortName: 'NZ',
    type: 'Country',
    color: '#0F172A',
  },
  {
    id: 'Pakistan',
    name: 'Pakistan',
    shortName: 'PAK',
    type: 'Country',
    color: '#166534',
  },
  {
    id: 'West Indies',
    name: 'West Indies',
    shortName: 'WI',
    type: 'Country',
    color: '#831843',
  },
  {
    id: 'Sri Lanka',
    name: 'Sri Lanka',
    shortName: 'SL',
    type: 'Country',
    color: '#1D4ED8',
  },
  {
    id: 'Bangladesh',
    name: 'Bangladesh',
    shortName: 'BAN',
    type: 'Country',
    color: '#047857',
  },
  {
    id: 'Afghanistan',
    name: 'Afghanistan',
    shortName: 'AFG',
    type: 'Country',
    color: '#2563EB',
  },
];

export const IPL_TEAMS: Team[] = [
  {
    id: 'CSK',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    type: 'Franchise',
    color: '#FACC15',
  },
  {
    id: 'MI',
    name: 'Mumbai Indians',
    shortName: 'MI',
    type: 'Franchise',
    color: '#0284C7',
  },
  {
    id: 'RCB',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    type: 'Franchise',
    color: '#DC2626',
  },
  {
    id: 'KKR',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    type: 'Franchise',
    color: '#581C87',
  },
  {
    id: 'RR',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    type: 'Franchise',
    color: '#EC4899',
  },
  {
    id: 'SRH',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    type: 'Franchise',
    color: '#EA580C',
  },
  {
    id: 'DC',
    name: 'Delhi Capitals',
    shortName: 'DC',
    type: 'Franchise',
    color: '#2563EB',
  },
  {
    id: 'PK',
    name: 'Punjab Kings',
    shortName: 'PK',
    type: 'Franchise',
    color: '#E11D48',
  },
  {
    id: 'LSG',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    type: 'Franchise',
    color: '#06B6D4',
  },
  {
    id: 'GT',
    name: 'Gujarat Titans',
    shortName: 'GT',
    type: 'Franchise',
    color: '#1E293B',
  },
];

export const INTERNATIONAL_ERAS: Era[] = ['1980s', '1990s', '2000s', '2010s', 'Modern'];
export const IPL_ERAS: IPLEra[] = ['2008–2012', '2013–2017', '2018–2021', '2022–Present'];

// Combined TEAMS for backward compatibility
export const TEAMS: Team[] = [...NATIONAL_TEAMS, ...IPL_TEAMS];
