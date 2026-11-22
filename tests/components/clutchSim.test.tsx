import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { LiveSimProgress } from '../../src/components/match/LiveSimProgress';
import { Player } from '../../src/types/player';

describe('LiveSimProgress (Clutch Death-Overs Simulator)', () => {
  const mockUserXI: Player[] = [
    {
      id: 'virat-kohli',
      name: 'Virat Kohli',
      country: 'India',
      internationalEras: ['2010s', 'Modern'],
      primaryRole: 'TopOrder',
      battingRating: 98,
      bowlingRating: 40,
      battingHand: 'Right',
      bowlingType: 'Medium',
      isAnomaly: true,
      anomalySeason: '2016',
      anomalyBadge: '973-Run God Mode',
      trait: {
        id: 'chase_master',
        name: 'Chase Master',
        description: 'Chasing pressure boost',
        trigger: 'Chasing',
        battingBoost: 0.15,
      },
    },
  ];

  it('renders initial powerplay stage during simulation', () => {
    render(
      <LiveSimProgress
        isSimulating={true}
        opponentName="2003 Australia"
        venueName="Melbourne Cricket Ground"
        userXI={mockUserXI}
      />
    );

    expect(screen.getByText(/Powerplay Firestorm/i)).toBeDefined();
    expect(screen.getByText(/2003 Australia/i)).toBeDefined();
  });

  it('progresses through middle overs and death overs over time', () => {
    vi.useFakeTimers();

    render(
      <LiveSimProgress
        isSimulating={true}
        opponentName="2011 India"
        venueName="Chepauk Stadium"
        userXI={mockUserXI}
      />
    );

    expect(screen.getByText(/Powerplay Firestorm/i)).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText(/Middle Overs Squeeze/i)).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(800);
    });

    expect(screen.getByText(/Final 2 Overs: Clutch Climax/i)).toBeDefined();
    expect(screen.getByText(/CHASE MASTER/i)).toBeDefined();

    vi.useRealTimers();
  });

  it('triggers onSkip when skip button is clicked', () => {
    const onSkip = vi.fn();
    render(
      <LiveSimProgress
        isSimulating={true}
        opponentName="2018 CSK"
        onSkip={onSkip}
      />
    );

    const skipBtn = screen.getByText(/Skip to Result/i);
    fireEvent.click(skipBtn);
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
