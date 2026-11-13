import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import '@bongo-ai/i18n';

export const PILOT_URL =
  'https://github.com/tahmidbintaslim/Bongo-AI/issues/new?title=Pilot+request';
const DEMO_URL = 'https://shikhbo-ai.vercel.app/c/demo-coaching';
const REPO_URL = 'https://github.com/tahmidbintaslim/Bongo-AI';
const PANELS = ['yellow', 'blue', 'peach', 'pink'];

type Step = { label: string; title: string; body: string };
type Moment = { art: string; tag: string; title: string; body: string };
type Note = { name: string; count: string };
type Faq = { q: string; a: string };

const Icon = ({ d, size = 20 }: { d: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d={d} />
  </svg>
);
const ARROW = 'M5 12h14M13 6l6 6-6 6';
const GLOBE = 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.5 2.6 3.6 5.6 3.6 9s-1.1 6.4-3.6 9c-2.5-2.6-3.6-5.6-3.6-9S9.5 5.6 12 3z';
const MOON = 'M20 14.5A8.5 8.5 0 019.5 4a8.5 8.5 0 1010.5 10.5z';
const SUN = 'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5';
const PAUSE = 'M9 6v12M15 6v12';
const PLAY = 'M8 5.5v13l11-6.5z';

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const App = () => {
  const { t, i18n } = useTranslation();
  const list = <T,>(key: string) => t(key, { returnObjects: true }) as T[];
  const other = i18n.language === 'bn-BD' ? 'en-US' : 'bn-BD';

  const [dark, setDark] = useState(false);
  const [subject, setSubject] = useState(0);
  // With reduced motion the heading starts paused on the first subject.
  const [paused, setPaused] = useState(prefersReducedMotion);
  const subjects = list<string>('landing.subjects');

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t('landing.metaTitle');
  }, [i18n.language, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => setSubject((n) => n + 1), 2600);
    return () => window.clearInterval(id);
  }, [paused]);

  const stamp = <span className="stamp">{t('landing.sample.label')}</span>;
  const line2 = list<string>('landing.headingLine2');
  const steps = list<Step>('landing.steps');
  const centres = list<string>('landing.privacyVisual.centres');

  const pilotLink = (
    <a className="button" href={PILOT_URL}>
      {t('landing.requestPilot')}
      <Icon d={ARROW} size={18} />
    </a>
  );
  const demoLink = (
    <a className="textlink" href={DEMO_URL}>
      {t('landing.tryDemo')}
    </a>
  );
  const navLinks = (
    <>
      <a href="#how">{t('landing.nav.how')}</a>
      <a href="#privacy">{t('landing.nav.privacy')}</a>
      <a href="#faq">{t('landing.nav.faq')}</a>
    </>
  );
  const mock = (caption: string, children: ReactNode) => (
    <figure className="mock" aria-label={caption}>
      <figcaption>
        {caption}
        {stamp}
      </figcaption>
      {children}
    </figure>
  );

  const visuals = [
    mock(
      t('landing.paste.caption'),
      <>
        <span className="field-label">{t('landing.paste.nameLabel')}</span>
        <span className="field">{list<Note>('landing.sample.notes')[0].name}</span>
        <span className="field-label">{t('landing.paste.textLabel')}</span>
        <span className="field tall">{t('landing.paste.text')}</span>
        <span className="mock-button">{t('landing.paste.button')}</span>
      </>,
    ),
    mock(
      t('landing.join.caption'),
      <>
        <strong className="mock-title">{t('landing.phone.centre')}</strong>
        <span className="field-label">{t('landing.join.label')}</span>
        <span className="field code" lang="en">
          {t('landing.join.code')}
        </span>
        <span className="mock-button">{t('landing.join.button')}</span>
      </>,
    ),
    mock(
      t('landing.sample.weeklyCaption'),
      <>
        <dl className="tiles">
          <div>
            <dd>{t('landing.sample.activeStudentsValue')}</dd>
            <dt>{t('landing.sample.activeStudents')}</dt>
          </div>
          <div>
            <dd>{t('landing.sample.questionsValue')}</dd>
            <dt>{t('landing.sample.questions')}</dt>
          </div>
        </dl>
        <span className="field-label">{t('landing.sample.mostAsked')}</span>
        <ul className="rows">
          {list<Note>('landing.sample.notes').map((note) => (
            <li key={note.name}>
              <span>{note.name}</span>
              <b>{note.count}</b>
            </li>
          ))}
        </ul>
        <span className="field-label">{t('landing.sample.unanswered')}</span>
        <ul className="rows">
          {list<string>('landing.sample.unansweredItems').map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </>,
    ),
  ];

  return (
    <>
      <header className="topbar">
        <div className="wrap">
          <a className="brand" href="#top">
            <span className="mark" aria-hidden="true">
              ব
            </span>
            {t('common.appName')}
          </a>
          <nav aria-label={t('landing.nav.label')}>{navLinks}</nav>
          <div className="tools">
            <button
              type="button"
              className="lang"
              lang={other}
              onClick={() => i18n.changeLanguage(other)}
            >
              <Icon d={GLOBE} />
              {t('landing.switchLanguage')}
            </button>
            <button
              type="button"
              className="icon-button theme"
              aria-label={t(dark ? 'landing.theme.light' : 'landing.theme.dark')}
              onClick={() => setDark(!dark)}
            >
              <Icon d={dark ? SUN : MOON} />
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap">
            <div className="hero-copy">
              <a className="pill" href="#not-built">
                <strong>{t('landing.pill.strong')}</strong>
                {t('landing.pill.rest')}
                <Icon d={ARROW} size={16} />
              </a>
              <h1>
                <span className="swap" key={subject}>
                  {subjects[subject % subjects.length]}
                </span>{' '}
                {t('landing.headingRest')}
                <br />
                {line2[0]}
                <span className="ink">{line2[1]}</span>
                {line2[2]}
              </h1>
              <div className="tagline">
                <p>{t('landing.heading')}</p>
                <button
                  type="button"
                  className="icon-button pause"
                  aria-label={t(paused ? 'landing.play' : 'landing.pause')}
                  onClick={() => setPaused(!paused)}
                >
                  <Icon d={paused ? PLAY : PAUSE} size={16} />
                </button>
              </div>
              <div className="actions">
                {pilotLink}
                {demoLink}
              </div>
              <p className="note">{t('landing.requestPilotNote')}</p>
              <p className="stat">
                <b>{t('landing.sample.questionsValue')}</b>
                <strong>
                  {t('landing.stat.caption')} {stamp}
                </strong>
                <span>{t('landing.stat.note')}</span>
              </p>
            </div>

            <div className="hero-visual">
              <p className="annotation" aria-hidden="true">
                {list<string>('landing.annotation').map((line) => (
                  <span key={line}>{line}</span>
                ))}
                <svg viewBox="0 0 90 50" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6c-4 26 26 40 78 28M70 26l12 8-12 9" />
                </svg>
              </p>
              <figure className="phone" aria-label={t('landing.sample.chatCaption')}>
                <div className="screen">
                  <div className="phone-head">
                    <strong>{t('landing.phone.centre')}</strong>
                    {stamp}
                  </div>
                  <div className="chat">
                    <p className="me">
                      <span className="sr">{t('landing.sample.student')}: </span>
                      {t('landing.sample.question')}
                    </p>
                    <p className="bot">
                      <span className="sr">{t('landing.sample.tutor')}: </span>
                      {t('landing.sample.answer')}
                      <span className="source">{t('landing.sample.source')}</span>
                    </p>
                    <p className="me">
                      <span className="sr">{t('landing.sample.student')}: </span>
                      {t('landing.sample.question2')}
                    </p>
                    <p className="bot">
                      <span className="sr">{t('landing.sample.tutor')}: </span>
                      {t('landing.sample.answer2')}
                    </p>
                  </div>
                  <div className="phone-input" aria-hidden="true">
                    {t('landing.phone.placeholder')}
                    <span>
                      <Icon d={ARROW} size={14} />
                    </span>
                  </div>
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section className="wrap block" aria-labelledby="moments-h">
          <h2 id="moments-h">{t('landing.moments.heading')}</h2>
          <p className="intro">{t('landing.lede')}</p>
          <ul className="moments">
            {list<Moment>('landing.moments.items').map((m, i) => (
              <li key={m.title}>
                <div className={`art ${PANELS[i]}`} aria-hidden="true">
                  {m.art}
                </div>
                <span className="tag">{m.tag}</span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="wrap features" id="how">
          <p className="eyebrow">{t('landing.howHeading')}</p>
          {steps.map((step, i) => (
            <section className="feature" key={step.title} aria-labelledby={`step-${i}`}>
              <div className={`panel ${PANELS[i]}`}>{visuals[i]}</div>
              <div className="feature-copy">
                <span className="tag">{step.label}</span>
                <h2 id={`step-${i}`}>{step.title}</h2>
                <p>{step.body}</p>
              </div>
            </section>
          ))}
          <section className="feature" id="privacy" aria-labelledby="privacy-h">
            <div className="panel pink">
              <figure className="centres" aria-label={t('landing.privacyVisual.caption')}>
                {centres.map((name) => (
                  <div className="mock" key={name}>
                    <strong className="mock-title">{name}</strong>
                    <span className="field">{t('landing.privacyVisual.notes')}</span>
                    <span className="field">{t('landing.privacyVisual.students')}</span>
                  </div>
                ))}
              </figure>
            </div>
            <div className="feature-copy">
              <h2 id="privacy-h">{t('landing.privacyHeading')}</h2>
              <p>{t('landing.privacyBody')}</p>
            </div>
          </section>
        </div>

        <section className="band" id="not-built" aria-labelledby="notbuilt-h">
          <div className="wrap">
            <div>
              <h2 id="notbuilt-h">{t('landing.notBuiltHeading')}</h2>
              <p>{t('landing.notBuiltIntro')}</p>
            </div>
            <ul>
              {list<string>('landing.notBuilt').map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="wrap block" id="faq" aria-labelledby="faq-h">
          <h2 id="faq-h">
            {list<string>('landing.faq.heading')[0]}
            <br />
            <span className="ink">{list<string>('landing.faq.heading')[1]}</span>
          </h2>
          <div className="faq">
            {list<Faq>('landing.faq.items').map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
          <p className="note">{t('landing.sample.disclaimer')}</p>
        </section>

        <section className="wrap" aria-labelledby="pilot-h">
          <div className="cta">
            <h2 id="pilot-h">
              {list<string>('landing.pilotHeading')[0]}
              <br />
              <span className="ink">{list<string>('landing.pilotHeading')[1]}</span>
            </h2>
            <p className="note">{t('landing.requestPilotNote')}</p>
            <div className="actions">
              {pilotLink}
              {demoLink}
            </div>
          </div>
        </section>
      </main>

      <footer className="wrap footer">
        <div>
          <h3>{t('landing.footer.product')}</h3>
          {navLinks}
          <a href="#not-built">{t('landing.notBuiltHeading')}</a>
        </div>
        <div>
          <h3>{t('landing.footer.pilot')}</h3>
          <a href={PILOT_URL}>{t('landing.requestPilot')}</a>
          <a href={DEMO_URL}>{t('landing.tryDemo')}</a>
        </div>
        <div>
          <h3>{t('landing.footer.code')}</h3>
          <a href={REPO_URL}>{t('landing.repository')}</a>
        </div>
        <p className="brand">
          <span className="mark" aria-hidden="true">
            ব
          </span>
          {t('common.appName')}
        </p>
        <p className="fine">{t('landing.sample.disclaimer')}</p>
      </footer>
    </>
  );
};

export default App;
