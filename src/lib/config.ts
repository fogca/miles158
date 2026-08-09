// Site-wide feature flags. Kept as plain booleans (not env vars) since these
// gate visible UI, not secrets — a single source of truth for "is this ready
// to show the public yet".

// Client hasn't given the go-ahead to accept online reservations yet.
// Set true to bring back every "予約 / Reserve" entry point (header nav x3,
// footer CTA, home banner). The /reserve route itself stays reachable by
// direct URL either way — this only hides the buttons that lead to it.
export const RESERVATIONS_OPEN = false;
