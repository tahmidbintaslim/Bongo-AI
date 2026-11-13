import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@bongo-ai/i18n';

export const PILOT_URL =
  'https://github.com/tahmidbintaslim/Bongo-AI/issues/new?title=Pilot+request';
const REPO_URL = 'https://github.com/tahmidbintaslim/Bongo-AI';

type Step = { title: string; body: string };
type Note = { name: string; count: string };

const App = () => {
  const { t, i18n } = useTranslation();
  const list = <T,>(key: string) => t(key, { returnObjects: true }) as T[];
  const other = i18n.language === 'bn-BD' ? 'en-US' : 'bn-BD';

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.title = t('landing.metaTitle');
  }, [i18n.language, t]);

  const pilotLink = (
    <a className="button" href={PILOT_URL}>
      {t('landing.requestPilot')}
    </a>
  );
  const sampleLabel = <span className="stamp">{t('landing.sample.label')}</span>;
  const numbers = list<string>('landing.stepNumbers');

  return (
    <>
      <header className="band hero">
        <div className="wrap">
          <div className="topbar">
            <span className="brand">{t('common.appName')}</span>
            <button
              type="button"
              className="lang"
              lang={other}
              onClick={() => i18n.changeLanguage(other)}
            >
              {t('landing.switchLanguage')}
            </button>
          </div>
          <h1>{t('landing.heading')}</h1>
          <p className="lede">{t('landing.lede')}</p>
          <div className="actions">
            {pilotLink}
            <a className="textlink" href="#how">
              {t('landing.seeHow')}
            </a>
          </div>
          <p className="note">{t('landing.requestPilotNote')}</p>
        </div>
      </header>

      <main>
        <section className="wrap" id="how" aria-labelledby="how-h">
          <h2 id="how-h">{t('landing.howHeading')}</h2>
          <ol className="steps">
            {list<Step>('landing.steps').map((step, i) => (
              <li key={step.title}>
                <span className="num" aria-hidden="true">
                  {numbers[i]}
                </span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="wrap" aria-labelledby="sample-h">
          <h2 id="sample-h">{t('landing.sample.heading')}</h2>
          <p className="disclaimer">{t('landing.sample.disclaimer')}</p>
          <div className="samples">
            <div className="sheet">
              <h3>
                {sampleLabel}
                {t('landing.sample.weeklyCaption')}
              </h3>
              <table>
                <tbody>
                  <tr>
                    <th scope="row">{t('landing.sample.activeStudents')}</th>
                    <td>{t('landing.sample.activeStudentsValue')}</td>
                  </tr>
                  <tr>
                    <th scope="row">{t('landing.sample.questions')}</th>
                    <td>{t('landing.sample.questionsValue')}</td>
                  </tr>
                </tbody>
              </table>
              <table>
                <thead>
                  <tr>
                    <th scope="col">{t('landing.sample.mostAsked')}</th>
                    <th scope="col">{t('landing.sample.questions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list<Note>('landing.sample.notes').map((note) => (
                    <tr key={note.name}>
                      <td>{note.name}</td>
                      <td>{note.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <table>
                <thead>
                  <tr>
                    <th scope="col">{t('landing.sample.unanswered')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list<string>('landing.sample.unansweredItems').map((q) => (
                    <tr key={q}>
                      <td>{q}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sheet">
              <h3>
                {sampleLabel}
                {t('landing.sample.chatCaption')}
              </h3>
              <dl className="chat">
                <dt>{t('landing.sample.student')}</dt>
                <dd>{t('landing.sample.question')}</dd>
                <dt>{t('landing.sample.tutor')}</dt>
                <dd>
                  {t('landing.sample.answer')}
                  <span className="source">{t('landing.sample.source')}</span>
                </dd>
                <dt>{t('landing.sample.student')}</dt>
                <dd>{t('landing.sample.question2')}</dd>
                <dt>{t('landing.sample.tutor')}</dt>
                <dd>{t('landing.sample.answer2')}</dd>
              </dl>
            </div>
          </div>
        </section>

        <section className="wrap statement" aria-labelledby="privacy-h">
          <h2 id="privacy-h">{t('landing.privacyHeading')}</h2>
          <p>{t('landing.privacyBody')}</p>
        </section>

        <section className="wrap" aria-labelledby="notbuilt-h">
          <h2 id="notbuilt-h">{t('landing.notBuiltHeading')}</h2>
          <p>{t('landing.notBuiltIntro')}</p>
          <ul className="ruled">
            {list<string>('landing.notBuilt').map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="band" aria-labelledby="pilot-h">
          <div className="wrap">
            <h2 id="pilot-h">{t('landing.pilotHeading')}</h2>
            <div className="actions">
              {pilotLink}
              <a className="textlink" href={REPO_URL}>
                {t('landing.repository')}
              </a>
            </div>
            <p className="note">{t('landing.requestPilotNote')}</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default App;
