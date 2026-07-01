import { Link, useParams } from 'react-router-dom';
import { spots } from '../data/spots';
import type { Verdict } from '../types/surf';
import './SpotDetail.css';

const verdictLabels: Record<Verdict, string> = {
  go: 'Go',
  maybe: 'Maybe',
  skip: 'Skip',
};

const chopLabels = {
  clean: 'Clean',
  moderate: 'Moderate',
  choppy: 'Choppy',
} as const;

function ConditionBar({
  label,
  value,
  unit,
  max,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
}) {
  const percent = Math.min(100, (value / max) * 100);
  return (
    <div className="condition-bar">
      <div className="condition-bar__header">
        <span className="condition-bar__label">{label}</span>
        <span className="condition-bar__value">
          {value} {unit}
        </span>
      </div>
      <div className="condition-bar__track">
        <div className="condition-bar__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SpotDetail() {
  const { id } = useParams<{ id: string }>();
  const spot = spots.find((s) => s.id === id);

  if (!spot) {
    return (
      <div className="spot-detail">
        <p className="spot-detail__error">Spot not found.</p>
        <Link to="/" className="spot-detail__back">
          Back to map
        </Link>
      </div>
    );
  }

  const { recommendation, conditions } = spot;

  return (
    <div className="spot-detail">
      <Link to="/" className="spot-detail__back">
        ← Back to map
      </Link>

      <header className="spot-detail__header">
        <h1>{spot.name}</h1>
        <p className="spot-detail__summary">{spot.plainLanguageSummary}</p>
      </header>

      <section className="spot-detail__conditions" aria-label="Current conditions">
        <h2>Conditions</h2>
        <ConditionBar label="Wave height" value={conditions.waveHeight} unit="ft" max={6} />
        <ConditionBar label="Wave period" value={conditions.wavePeriod} unit="sec" max={12} />
        <ConditionBar label="Wind speed" value={conditions.windSpeed} unit="mph" max={30} />
        <div className="condition-meta">
          <div className="condition-meta__item">
            <span className="condition-meta__label">Wind direction</span>
            <span className="condition-meta__value">{conditions.windDirection}</span>
          </div>
          <div className="condition-meta__item">
            <span className="condition-meta__label">Chop</span>
            <span className={`condition-meta__value condition-meta__value--${conditions.chop}`}>
              {chopLabels[conditions.chop]}
            </span>
          </div>
        </div>
      </section>

      <section
        className={`spot-detail__verdict spot-detail__verdict--${recommendation.verdict}`}
        aria-label="Recommendation"
      >
        <h2>Recommendation: {verdictLabels[recommendation.verdict]}</h2>
        <p>{recommendation.reason}</p>
      </section>
    </div>
  );
}

export default SpotDetail;
