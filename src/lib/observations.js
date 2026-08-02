export const PASS_REASON_LABELS = {
  acceptance_not_confirmed: 'Acceptance not confirmed',
  chop_window:              'Chop window (11am–2pm ET)',
  outside_trading_window:   'Outside trading window',
  already_traded_today:     'Already traded today',
  score_too_low:            'Score too low',
  freeze_hesitation:        'Hesitated — froze',
  missed_entry_price_ran:   'Recognized too late — price ran',
  news_uncertainty:         'News / macro uncertainty',
  daily_loss_limit_hit:     'Daily loss limit reached',
  other:                    'Other (see notes)',
};

export const FREEZE_CAUSE_LABELS = {
  fear_of_losing:           'Fear of losing',
  acceptance_ambiguous:     'Acceptance felt ambiguous',
  not_enough_confirmation:  'Wanted more confirmation',
  price_ran_before_i_acted: 'Price ran before I could act',
  second_guessed_the_setup: 'Second-guessed the setup',
  distracted:               'Distracted',
  other:                    'Other',
};

export const OUTCOME_LABELS = {
  worked:         'Worked',
  failed:         'Failed',
  invalidated:    'Invalidated',
  never_resolved: 'Never resolved',
  pending:        'Pending',
};

export const OUTCOME_COLORS = {
  worked:         'text-green-600 dark:text-green-400',
  failed:         'text-red-600 dark:text-red-400',
  invalidated:    'text-amber-600 dark:text-amber-400',
  never_resolved: 'text-gray-500',
  pending:        'text-gray-400',
};

export const FREEZE_REASONS = new Set(['freeze_hesitation', 'missed_entry_price_ran']);
