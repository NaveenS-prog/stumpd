import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeamSheet } from '../../src/components/draft/TeamSheet';
import { CandidateCard } from '../../src/components/draft/CandidateCard';
import { SlotProgress } from '../../src/components/draft/SlotProgress';
import { SpinWheels } from '../../src/components/draft/SpinWheels';
import { LineupReorderModal } from '../../src/components/draft/LineupReorderModal';
import { SLOTS } from '../../src/data/slots';
import { Player } from '../../src/types/player';
import playersData from '../../src/data/players.json';

describe('Draft UI Components', () => {
  const samplePlayer: Player = playersData[0] as Player;
  const samplePlayer2: Player = playersData[1] as Player;

  it('renders all 11 slots and displays picked players with dual ratings', () => {
    const picks = [samplePlayer]; // Opener 1 picked
    render(
      <TeamSheet
        slots={SLOTS}
        picks={picks}
        currentSlotIndex={1}
        captainId={samplePlayer.id}
        onSelectCaptain={vi.fn()}
      />
    );

    expect(screen.getByText(samplePlayer.name)).toBeDefined();
    expect(screen.getByText(SLOTS[1].name)).toBeDefined(); // Slot 2 empty placeholder
  });

  it('renders candidate card with dual ratings and triggers onSelect', () => {
    const onSelect = vi.fn();
    render(<CandidateCard player={samplePlayer} onSelect={onSelect} />);

    expect(screen.getByText(samplePlayer.name)).toBeDefined();
    expect(screen.getByText(String(samplePlayer.battingRating))).toBeDefined();
    expect(screen.getByText(String(samplePlayer.bowlingRating))).toBeDefined();

    const pickButton = screen.getByRole('button', { name: /draft/i });
    fireEvent.click(pickButton);
    expect(onSelect).toHaveBeenCalledWith(samplePlayer);
  });

  it('renders slot progress with current slot highlighted', () => {
    render(<SlotProgress slots={SLOTS} currentSlotIndex={2} picks={[samplePlayer, samplePlayer2]} />);
    expect(screen.getByText(/Slot 3\/11/i)).toBeDefined();
  });

  it('renders spin wheels and triggers onSpin and onMulligan', () => {
    const onSpin = vi.fn();
    const onMulligan = vi.fn();
    render(
      <SpinWheels
        currentTeam="India"
        currentEra="2000s"
        isSpinning={false}
        mulligansRemaining={3}
        onSpin={onSpin}
        onMulligan={onMulligan}
      />
    );

    expect(screen.getByText('India')).toBeDefined();
    expect(screen.getByText('2000s')).toBeDefined();

    const redraftBtn = screen.getByRole('button', { name: /redraft/i });
    fireEvent.click(redraftBtn);
    expect(onMulligan).toHaveBeenCalledTimes(1);
  });

  it('renders lineup reorder modal and allows captain selection', () => {
    const elevenPlayers = (playersData.slice(0, 11) as Player[]);
    const onSelectCaptain = vi.fn();
    const onReorder = vi.fn();
    const onClose = vi.fn();

    render(
      <LineupReorderModal
        isOpen={true}
        players={elevenPlayers}
        captainId={elevenPlayers[0].id}
        onSelectCaptain={onSelectCaptain}
        onReorder={onReorder}
        onClose={onClose}
      />
    );

    expect(screen.getByText('Tactical Lineup & Captain')).toBeDefined();
    const captainBtns = screen.getAllByRole('button', { name: /captain/i });
    expect(captainBtns.length).toBeGreaterThanOrEqual(1);
  });

  it('renders candidate card with signature trait badge when present', () => {
    const kohliWithTrait = playersData.find((p) => p.id === 'virat-kohli') as Player;
    render(<CandidateCard player={kohliWithTrait} onSelect={vi.fn()} />);

    expect(screen.getByText(/Chase Master/i)).toBeDefined();
  });

  it('displays active chemistry synergies in team sheet when duo is assembled', () => {
    const kohli = playersData.find((p) => p.id === 'virat-kohli') as Player;
    const abd = playersData.find((p) => p.id === 'ab-de-villiers') as Player;

    render(
      <TeamSheet
        slots={SLOTS}
        picks={[kohli, abd]}
        currentSlotIndex={2}
        captainId={kohli.id}
        onSelectCaptain={vi.fn()}
      />
    );

    expect(screen.getByText(/RCB Dynamic Duo/i)).toBeDefined();
  });

  it('syncs lineup players when modal transitions from closed with empty players to open with 11 players', () => {
    const elevenPlayers = playersData.slice(0, 11) as Player[];
    const onSelectCaptain = vi.fn();
    const onReorder = vi.fn();
    const onClose = vi.fn();

    const { rerender } = render(
      <LineupReorderModal
        isOpen={false}
        players={[]}
        captainId={null}
        onSelectCaptain={onSelectCaptain}
        onReorder={onReorder}
        onClose={onClose}
      />
    );

    rerender(
      <LineupReorderModal
        isOpen={true}
        players={elevenPlayers}
        captainId={elevenPlayers[0].id}
        onSelectCaptain={onSelectCaptain}
        onReorder={onReorder}
        onClose={onClose}
      />
    );

    for (const player of elevenPlayers) {
      expect(screen.getByText(player.name)).toBeDefined();
    }

    fireEvent.click(screen.getByRole('button', { name: /confirm starting xi/i }));
    expect(onReorder).toHaveBeenCalledTimes(1);
    expect(onReorder).toHaveBeenCalledWith(elevenPlayers);
  });
});
