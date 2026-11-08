interface StandaloneEnv {
  matchMedia: (query: string) => { matches: boolean };
  navigator: { standalone?: boolean };
}

/** True when opened from the home screen. On iPhone a Safari tab has separate storage. */
export function isStandalone(env: StandaloneEnv = window as unknown as StandaloneEnv): boolean {
  return env.matchMedia('(display-mode: standalone)').matches || env.navigator.standalone === true;
}
