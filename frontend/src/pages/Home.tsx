import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { spots, type Verdict } from '../data/spots';
import { LakeView } from '../components/lake/LakeView';
import './Home.css';

const verdictOrder: Record<Verdict, number> = {
  go: 0,
  maybe: 1,
  skip: 2,
};

const verdictLabels: Record<Verdict, string> = {
  go: 'Go',
  maybe: 'Maybe',
  skip: 'Skip',
};

function Home() {
  const sortedSpots = useMemo(
    () =>
      [...spots].sort(
        (a, b) =>
          verdictOrder[a.recommendation.verdict] -
          verdictOrder[b.recommendation.verdict],
      ),
    [],
  );

  return (
    <div className="home">
      <header className="home__header">
        <h1>Great Lakes Surf</h1>
        <p className="home__subtitle">Lake Michigan — where should you paddle out?</p>
      </header>

      <LakeView spots={spots} />

      <section className="home__spot-list" aria-label="Surf spots">
        <h2>Spots today</h2>
        <ul className="spot-list">
          {sortedSpots.map((spot) => {
            const { recommendation } = spot;
            return (
              <li key={spot.id} className="spot-list__item">
                <Link
                  to={`/spot/${spot.id}`}
                  className={`spot-list__link spot-list__link--${recommendation.verdict}`}
                >
                  <span className="spot-list__name">{spot.name}</span>
                  <span className="spot-list__verdict">
                    {verdictLabels[recommendation.verdict]}
                  </span>
                  <span className="spot-list__summary">{spot.plainLanguageSummary}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

export default Home;
