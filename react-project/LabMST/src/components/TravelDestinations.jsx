import React, { useState } from "react";

function TravelDestinations() {
  const [destinations, setDestinations] = useState([
    { id: 1, place: "Paris", country: "France" },
    { id: 2, place: "Tokyo", country: "Japan" },
    { id: 3, place: "Goa", country: "India" },
  ]);

  const [newPlace, setNewPlace] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const addDestination = () => {
    if (!newPlace || !newCountry) return;

    const newId = destinations.length > 0 ? destinations[destinations.length - 1].id + 1 : 1;

    setDestinations([...destinations, { id: newId, place: newPlace, country: newCountry }]);
    setNewPlace("");
    setNewCountry("");
  };

  const deleteDestination = (id) => {
    setDestinations(destinations.filter((dest) => dest.id !== id));
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder="Place"
          value={newPlace}
          onChange={(e) => setNewPlace(e.target.value)}
        />
        <input
          type="text"
          placeholder="Country"
          value={newCountry}
          onChange={(e) => setNewCountry(e.target.value)}
        />
        <button onClick={addDestination}>Add</button>
      </div>

      <ul>
        {destinations.map((dest) => (
          <li key={dest.id}>
            {dest.id}. <strong>{dest.place}</strong> - {dest.country}
            <button onClick={() => deleteDestination(dest.id)} style={{ marginLeft: "10px" }}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TravelDestinations;
