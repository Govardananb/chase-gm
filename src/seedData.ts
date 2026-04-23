import type { Team, Fixture } from './types';

export const seededTeams: Team[] = [
  {
    id: 't1',
    name: 'Team 1',
    captain: 'p13',
    players: [
      { id: 'p11', name: 'Ashik' },
      { id: 'p12', name: 'Gowshik' },
      { id: 'p13', name: 'Harish S' },
      { id: 'p14', name: 'Dinesh' },
      { id: 'p15', name: 'Jana' },
    ]
  },
  {
    id: 't2',
    name: 'Team 2',
    captain: 'p21',
    players: [
      { id: 'p21', name: 'Anandan' },
      { id: 'p22', name: 'Hemanth' },
      { id: 'p23', name: 'Lokesh' },
      { id: 'p24', name: 'GS Manoj' },
      { id: 'p25', name: 'Joseph' },
    ]
  },
  {
    id: 't3',
    name: 'Team 3',
    captain: 'p31',
    players: [
      { id: 'p31', name: 'Kailash' },
      { id: 'p32', name: 'Kamalesh' },
      { id: 'p33', name: 'Harish R' },
      { id: 'p34', name: 'Bharath' },
      { id: 'p35', name: 'Avinash' },
    ]
  },
  {
    id: 't4',
    name: 'Team 4',
    captain: 'p41',
    players: [
      { id: 'p41', name: 'Ashok' },
      { id: 'p42', name: 'Bharani' },
      { id: 'p43', name: 'Guru Prasath' },
      { id: 'p44', name: 'Madhan' },
      { id: 'p45', name: 'Govardanan' },
    ]
  },
  {
    id: 't5',
    name: 'Team 5',
    captain: 'p51',
    players: [
      { id: 'p51', name: 'Bhuvi' },
      { id: 'p52', name: 'Gowtham K' },
      { id: 'p53', name: 'Kaniskar' },
      { id: 'p54', name: 'Surya' },
      { id: 'p55', name: 'Gokul' },
    ]
  }
];

export const seededFixtures: Fixture[] = [
  {
    id: 'f1',
    week: 1,
    teamAId: 't1',
    teamBId: 't2',
    date: '2026-04-24',
    status: 'pending',
    teamAScore: 0,
    teamBScore: 0,
    boardResults: [
      { gameId: 'g11', player1: 'Harish S', player2: 'Anandan', result: '*' },
      { gameId: 'g12', player1: 'Gowshik', player2: 'Hemanth', result: '*' },
      { gameId: 'g13', player1: 'Ashik', player2: 'Lokesh', result: '*' },
      { gameId: 'g14', player1: 'Dinesh', player2: 'GS Manoj', result: '*' },
      { gameId: 'g15', player1: 'Jana', player2: 'Joseph', result: '*' },
    ]
  },
  {
    id: 'f2',
    week: 1,
    teamAId: 't3',
    teamBId: 't4',
    date: '2026-04-24',
    status: 'pending',
    teamAScore: 0,
    teamBScore: 0,
    boardResults: [
      { gameId: 'g21', player1: 'Bharath', player2: 'Bharani', result: '*' },
      { gameId: 'g22', player1: 'Kailash', player2: 'Ashok', result: '*' },
      { gameId: 'g23', player1: 'Harish R', player2: 'Guru Prasath', result: '*' },
      { gameId: 'g24', player1: 'Avinash', player2: 'Madhan', result: '*' },
      { gameId: 'g25', player1: 'Kamalesh', player2: 'Govardanan', result: '*' },
    ]
  },
  {
    id: 'f3',
    week: 2,
    teamAId: 't2',
    teamBId: 't5',
    date: '2026-05-01',
    status: 'pending',
    teamAScore: 0,
    teamBScore: 0,
    boardResults: [
      { gameId: 'g31', player1: 'Anandan', player2: 'Bhuvi', result: '*' },
      { gameId: 'g32', player1: 'Hemanth', player2: 'Gowtham K', result: '*' },
      { gameId: 'g33', player1: 'Lokesh', player2: 'Kaniskar', result: '*' },
      { gameId: 'g34', player1: 'GS Manoj', player2: 'Surya', result: '*' },
      { gameId: 'g35', player1: 'Joseph', player2: 'Gokul', result: '*' },
    ]
  },
  {
    id: 'f4',
    week: 2,
    teamAId: 't1',
    teamBId: 't3',
    date: '2026-05-01',
    status: 'pending',
    teamAScore: 0,
    teamBScore: 0,
    boardResults: [
      { gameId: 'g41', player1: 'Harish S', player2: 'Harish R', result: '*' },
      { gameId: 'g42', player1: 'Gowshik', player2: 'Bharath', result: '*' },
      { gameId: 'g43', player1: 'Dinesh', player2: 'Avinash', result: '*' },
      { gameId: 'g44', player1: 'Jana', player2: 'Kailash', result: '*' },
      { gameId: 'g45', player1: 'Ashik', player2: 'Kamalesh', result: '*' },
    ]
  },
  {
    id: 'f5',
    week: 3,
    teamAId: 't4',
    teamBId: 't5',
    date: '2026-05-08',
    status: 'pending',
    teamAScore: 0,
    teamBScore: 0,
    boardResults: [
      { gameId: 'g51', player1: 'Bharani', player2: 'Bhuvi', result: '*' },
      { gameId: 'g52', player1: 'Guru Prasath', player2: 'Gowtham K', result: '*' },
      { gameId: 'g53', player1: 'Ashok', player2: 'Kaniskar', result: '*' },
      { gameId: 'g54', player1: 'Madhan', player2: 'Surya', result: '*' },
      { gameId: 'g55', player1: 'Govardanan', player2: 'Gokul', result: '*' },
    ]
  }
];
