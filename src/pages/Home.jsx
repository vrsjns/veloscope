import { useState, useEffect } from 'react';
import HoroscopeCard from '../components/HoroscopeCard';
import Riders from '../assets/riders.json';

const S3_BASE_URL = 'https://velo-horoscope-01.s3.eu-central-1.amazonaws.com';
const HOROSCOPES_BASE_URL = `${S3_BASE_URL}/horoscope`;
const RIDERS_LIST = `${S3_BASE_URL}/uci_riders.json`;

function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function transformRiders(riders) {
  const processedRiders = riders
    .map(rider => (
      { ...rider, name: toTitleCase(rider?.name)}
    ))
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return processedRiders;
}

const Home = () => {
  const [riders, setRiders] = useState(Riders ?? []);
  const [selectedRider, setSelectedRider] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load rider list
    fetch(RIDERS_LIST)
      .then(res => res.json())
      .then(transformRiders)
      .then(setRiders)
      .catch(error => console.error('Error fetching riders:', error));;
  }, []);

  useEffect(() => {
    if (!selectedRider) return;
    const rider = riders.find(r => r.name === selectedRider);
    if (!rider) return;

    const date = new Date();
    const today = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    const url = `${HOROSCOPES_BASE_URL}/${today}/${rider.name.toLowerCase().replace(/ /g, "_")}.json`;

    setLoading(true);
    fetch(url)
      .then(res => res.ok ? res.json() : Promise.reject("Not found"))
      .then(data => {
        setHoroscope({ ...data, sign: rider.zodiacSign, name: rider.name });
        setLoading(false);
      })
      .catch(() => {
        setHoroscope(null);
        setLoading(false);
      });
  }, [selectedRider, riders]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-center text-2xl font-bold mb-4">Select a Rider</h1>

      <select
        value={selectedRider}
        onChange={e => setSelectedRider(e.target.value)}
        className="w-full p-2 rounded-lg border border-gray-300 mb-6"
      >
        <option value="">-- Choose a rider --</option>
        {riders.map(rider => (
          <option key={rider.name+rider.birth_date} value={rider.name}>
            {rider.name}
          </option>
        ))}
      </select>

      {loading && <p className="text-center">Loading horoscope...</p>}

      {horoscope && (
        <HoroscopeCard
          sign={horoscope.sign}
          horoscope={{ content: horoscope.horoscope }}
          riderName={horoscope?.name ?? selectedRider ?? 'Lance'}
        />
      )}

      {!loading && selectedRider && !horoscope && (
        <p className="text-center text-gray-500">No horoscope found for today.</p>
      )}
    </div>
  );
};

export default Home;
