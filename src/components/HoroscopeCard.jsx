const HoroscopeCard = ({ sign, horoscope, riderName }) => (
  <div className="bg-white shadow-md rounded-2xl p-6">
    <h2 className="text-xl font-semibold">{riderName} ({sign})</h2>
    <p className="text-gray-700 mt-2">{horoscope?.content || "No horoscope available."}</p>
  </div>
);

export default HoroscopeCard;
