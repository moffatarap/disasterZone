import earthquakeIcon from '../assets/media/img/mapKeys/key/earthquake.svg'
import volcanoIcon from '../assets/media/img/mapKeys/key/volcano.svg'
import './SeverityKey.css'

// Fire/flood/hurricane/tornado are intentionally left out of the key for now -
// they aren't wired to real data yet (see the placeholder-events phase).
const KEY_ENTRIES = [
  { icon: earthquakeIcon, label: 'Earthquake' },
  { icon: volcanoIcon, label: 'Volcano' },
]

export function SeverityKey() {
  return (
    <div className="severity-key">
      <h4 className="severity-key__title">KEY</h4>
      <ul className="severity-key__list">
        {KEY_ENTRIES.map((entry) => (
          <li key={entry.label} className="severity-key__item">
            <img src={entry.icon} alt="" className="severity-key__icon" />
            <span>{entry.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
