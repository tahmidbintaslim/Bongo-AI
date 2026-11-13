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
    expect(h1()).toBe('আপনার কোচিং সেন্টারের নিজস্ব বাংলা এআই টিউটর');
    expect(document.documentElement.lang).toBe('bn-BD');

    const pilot = container.querySelector<HTMLAnchorElement>('a.button');
    expect(pilot?.getAttribute('href')).toBe(PILOT_URL);
    expect(pilot?.textContent).toBe('পাইলটের জন্য অনুরোধ করুন');
    expect(container.innerHTML).not.toContain('mailto:');

    act(() => container.querySelector<HTMLButtonElement>('button.lang')?.click());
    expect(h1()).toBe("Your coaching centre's own Bangla AI tutor");
    expect(document.documentElement.lang).toBe('en-US');
    expect(container.querySelector('a.button')?.textContent).toBe('Request a pilot');
  });
});
