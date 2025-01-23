import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Nav from '../components/Nav';
import EventList from '../components/EventList';
import InstagramPosts from '../components/InstagramPosts';

const FindEvents = () => {
  const [events, setEvents] = useState([]);
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filteredInstagramPosts, setFilteredInstagramPosts] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingInstagramPosts, setLoadingInstagramPosts] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [eventsLoaded, setEventsLoaded] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/scrape-events');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched Events:', data);

        const categorizedEvents = data.events.map(event => {
          const caption = event.caption || '';
          if (caption.includes('hackathon')) {
            return { ...event, category: 'hackathon' };
          } else if (caption.includes('recruitment')) {
            return { ...event, category: 'recruitment' };
          } else if (caption.includes('challenge') || caption.includes('workshop')) {
            return { ...event, category: 'workshop' };
          } else {
            return { ...event, category: 'other' };
          }
        });

        setEvents(categorizedEvents);
        setFilteredEvents(categorizedEvents);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('Technical error in loading event details.');
      } finally {
        setLoadingEvents(false);
        setEventsLoaded(true);  // Events are loaded
      }
    };

    const fetchInstagramPosts = async () => {
      try {
        const response = await fetch('/api/instagram-posts');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched Instagram Posts:', data);

        const categorizedPosts = data.posts.map(post => {
          const caption = post.caption || '';
          if (caption.includes('hackathon')) {
            return { ...post, category: 'hackathon' };
          } else if (caption.includes('recruitment')) {
            return { ...post, category: 'recruitment' };
          } else if (caption.includes('challenge') || caption.includes('workshop')) {
            return { ...post, category: 'workshop' };
          } else {
            return { ...post, category: 'other' };
          }
        });

        setInstagramPosts(categorizedPosts);
        setFilteredInstagramPosts(categorizedPosts);
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        setError('Technical error in loading Instagram posts.');
      } finally {
        setLoadingInstagramPosts(false);
      }
    };

    fetchEvents();
    fetchInstagramPosts();
  }, []);

  useEffect(() => {
    const filterEvents = filter === 'all' ? events : events.filter(event => event.category === filter);
    const filterPosts = filter === 'all' ? instagramPosts : instagramPosts.filter(post => post.category === filter);

    setFilteredEvents(filterEvents);
    setFilteredInstagramPosts(filterPosts);
  }, [filter, events, instagramPosts]);

  return (
    <Container>
      <Nav />
      <Content>
        {loadingEvents && <p>Loading events...</p>}
        {loadingInstagramPosts && !loadingEvents && <p>Loading Instagram posts...</p>}
        {error && (
          <ErrorWrapper>
            <Error>{error}</Error>
            <ErrorMessage>
              Please check your internet connection or contact support if the problem persists.
            </ErrorMessage>
          </ErrorWrapper>
        )}
        {!loadingEvents && !error && (
          <MainContent>
            <Header>EVENTS OCCURRING IN CAMPUS !!!</Header>
            
            <FilterContainer>
              <FilterButton onClick={() => setFilter('all')}>All</FilterButton>
              <FilterButton onClick={() => setFilter('hackathon')}>Hackathon</FilterButton>
              <FilterButton onClick={() => setFilter('recruitment')}>Recruitment</FilterButton>
              <FilterButton onClick={() => setFilter('workshop')}>Workshop</FilterButton>
              <FilterButton onClick={() => setFilter('other')}>Other Events</FilterButton>
            </FilterContainer>

            <SingleColumnLayout>
              {eventsLoaded && filteredInstagramPosts.length > 0 && (
                <InstagramPostsWrapper>
                  <InstagramPosts posts={filteredInstagramPosts} />
                </InstagramPostsWrapper>
              )}
              {filteredEvents.length > 0 && (
                <EventListWrapper>
                  <EventList events={filteredEvents} />
                </EventListWrapper>
              )}
              {(filteredEvents.length === 0 && filteredInstagramPosts.length === 0) && (
                <p>No events or Instagram posts found.</p>
              )}
            </SingleColumnLayout>
            <Footer>More events coming soon!</Footer>
          </MainContent>
        )}
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #131324;
  color: #f5f5f5;
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  background-color: #131324;
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 4rem;
  z-index: 1;
  overflow-y: auto;
  max-height: calc(100vh - 4rem);

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
`;

const SingleColumnLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
`;

const EventListWrapper = styled.div`
  width: 100%;
`;

const InstagramPostsWrapper = styled.div`
  width: 100%;
`;

const Header = styled.h1`
  color: #ffcc00;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: bold;
`;

const Footer = styled.p`
  color: #f5f5f5;
  margin-top: 2rem;
  font-size: 1rem;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const FilterButton = styled.button`
  background-color: #ffcc00;
  border: none;
  color: #131324;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 0.4rem;
  
  &:hover {
    background-color: #e6b800;
  }
`;

const ErrorWrapper = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #ffdddd;
  border: 1px solid #ff0000;
  border-radius: 0.4rem;
  width: 100%;
  max-width: 800px;
  position: relative;
  z-index: 1;
`;

const Error = styled.p`
  color: #ff0000;
  font-weight: bold;
  margin: 0;
  padding: 0;
`;

const ErrorMessage = styled.p`
  color: #d03e1f;
  margin-top: 0.5rem;
  font-size: 0.9rem;
`;

export default FindEvents;