import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MatchSetupScreen } from '../../src/components/setup/MatchSetupScreen';
import { INTERNATIONAL_OPPONENTS } from '../../src/data/opponents';
import { VENUES } from '../../src/data/venues';

describe('MatchSetupScreen Component', () => {
  it('renders opponent selection list and stadium cards', () => {
    const onSelectOpp = vi.fn();
    const onSelectVen = vi.fn();
    const onProceed = vi.fn();
    const onBack = vi.fn();

    render(
      <MatchSetupScreen
        gameMode="International"
        opponents={INTERNATIONAL_OPPONENTS}
        venues={VENUES}
        selectedOpponent={INTERNATIONAL_OPPONENTS[0]}
        selectedVenue={VENUES[0]}
        onSelectOpponent={onSelectOpp}
        onSelectVenue={onSelectVen}
        onProceedToDraft={onProceed}
        onBackToHome={onBack}
      />
    );

    expect(screen.getByText(/Match Setup & Tactical Intel/i)).toBeDefined();
    expect(screen.getAllByText(INTERNATIONAL_OPPONENTS[0].name).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(VENUES[0].name).length).toBeGreaterThanOrEqual(1);

    // Proceed button works
    const proceedBtn = screen.getByRole('button', { name: /lock fixture & begin draft/i });
    fireEvent.click(proceedBtn);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });
});
