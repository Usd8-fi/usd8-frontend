import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

import { queryClient } from '../lib/dataCache.js';
import { clearHistoryCache } from '../lib/history.js';
afterEach(() => { queryClient.clear(); clearHistoryCache(); });

import { clearClaimHistory } from '../lib/claimHistory.js';
afterEach(clearClaimHistory);

afterEach(() => window.history.replaceState(null, '', window.location.pathname));
