import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EventList.css'; // Import CSS file for styling

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/scrape-events'); // Your backend endpoint
        setEvents(response.data.events);
      } catch (error) {
        setError('Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="event-list-container">
      {loading && <p>Loading events...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && events.length > 0 && (
        <div className="events-list">
          {events.map((event, index) => (
            <div key={index} className="event-card">
              {event.image_url && (
                <img src={event.image_url} alt={event.title} className="event-image" />
              )}
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && events.length === 0 && <p>No events found.</p>}
    </div>
  );
};

export default EventList;
