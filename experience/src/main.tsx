import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';
import {
  FirstReadingPacket, StaticReadingCompanion, isReviewWork
} from './ReviewPackets.js';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('POELIO root is missing');

const params = new URLSearchParams(window.location.search);
const review = params.get('review');
const staticWork = params.get('companion');

// The links are editorial instruments; no participant response is uploaded.
// Public fixture imports are the single source of every displayed passage.
const content = isReviewWork(review)
  ? <FirstReadingPacket work={review}/>
  : isReviewWork(staticWork)
    ? <StaticReadingCompanion work={staticWork}/>
    : <App/>;

createRoot(container).render(<React.StrictMode>{content}</React.StrictMode>);


/* Cache only the approved PUBLIC shell, never private texts or participant writing. */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const scope = import.meta.env.BASE_URL;
    void navigator.serviceWorker.register(scope + 'sw.js', {scope}).catch(() => {
      // Normal online reading stays available if offline installation fails.
    });
  });
}
