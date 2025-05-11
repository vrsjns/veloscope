import { useState, useEffect } from 'react';
import { useCombobox } from 'downshift';
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

function getDate() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = date.getDate();

  return `${year}-${month}-${day}`;
}

const Home = () => {
  const [riders, setRiders] = useState(Riders ?? []);
  const [inputItems, setInputItems] = useState([]);
  const [selectedRider, setSelectedRider] = useState('');
  const [horoscope, setHoroscope] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load rider list
    fetch(RIDERS_LIST)
      .then(res => res.json())
      .then(transformRiders)
      .then(data => {
        setRiders(data);
        setInputItems(data)
      })
      .catch(error => console.error('Error fetching riders:', error));;
  }, []);

  useEffect(() => {
    if (!selectedRider) return;
    const rider = riders.find(r => r.name === selectedRider.name);
    if (!rider) return;

    const today = getDate()
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

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getToggleButtonProps,
    getItemProps,
    highlightedIndex
  } = useCombobox({
    items: inputItems,
    itemToString: item => (item ? item.name : ''),
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        riders.filter(rider =>
          rider.name.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    },
    onSelectedItemChange: ({ selectedItem }) => {
      setSelectedRider(selectedItem);
    },
  });

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-center text-2xl font-bold mb-4">Select a Rider</h1>

      <div className="relative pb-1">
        <div className="flex shadow-sm bg-white gap-0.5">
          <input
            {...getInputProps()}
            placeholder="Type rider name..."
            className="w-full p-2 border rounded-lg border-gray-300"
          />
          <button
            aria-label="toggle menu"
            className="px-2"
            type="button"
            {...getToggleButtonProps()}
          >
            {isOpen ? <>&#8593;</> : <>&#8595;</>}
          </button>
        </div>
        <ul
          {...getMenuProps()}
          className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto"
        >
          {isOpen &&
            inputItems.map((item, index) => (
              <li
                key={item.name}
                {...getItemProps({ item, index })}
                className={`p-2 cursor-pointer ${
                  highlightedIndex === index ? 'bg-blue-100' : ''
                }`}
              >
                {item.name}
              </li>
            ))}
        </ul>
      </div>

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
