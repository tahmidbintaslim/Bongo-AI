import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App, { PILOT_URL } from '../App';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('landing page', () => {
  it('renders in Bangla with the pilot link, and switches to English', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    act(() => createRoot(container).render(<App />));

    const h1 = () => container.querySelector('h1')?.textContent;
    expect(h1()).toBe('পদার্থবিজ্ঞানের উত্তরআপনার নোট থেকে');
    expect(document.documentElement.lang).toBe('bn-BD');

    const pilot = container.querySelector<HTMLAnchorElement>('a.button');
    expect(pilot?.getAttribute('href')).toBe(PILOT_URL);
    expect(pilot?.textContent).toBe('পাইলটের জন্য অনুরোধ করুন');
    expect(container.innerHTML).not.toContain('mailto:');

    // Hero, moments, three steps, privacy, not built, FAQ, final action.
    expect(container.querySelectorAll('h2')).toHaveLength(8);
    expect(container.querySelectorAll('details')).toHaveLength(6);
    expect(container.querySelector('.phone')?.textContent).toContain('নমুনা');
    expect(container.querySelector('button.pause')).not.toBeNull();

    act(() => container.querySelector<HTMLButtonElement>('button.theme')?.click());
    expect(document.documentElement.dataset.theme).toBe('dark');

    act(() => container.querySelector<HTMLButtonElement>('button.lang')?.click());
    expect(h1()).toBe('Physics answersfrom your notes');
    expect(document.documentElement.lang).toBe('en-US');
    expect(container.querySelector('a.button')?.textContent).toBe('Request a pilot');
  });
});
