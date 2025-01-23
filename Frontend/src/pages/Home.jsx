import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Nav from '../components/Nav'; // Import the Nav component

const Home = () => {
  const navigate = useNavigate();
  const auth = localStorage.getItem('chat-app-user'); // Check if user is logged in

  const handleFindEventClick = () => {
    if (auth) {
      navigate('/find-events'); // Redirect to find events page if authenticated
    } else {
      navigate('/login'); // Redirect to login page if not authenticated
    }
  };

  return (
    <Container>
      <Nav /> {/* Use the Nav component here */}
      <Content>
        <h1>Welcome to Campus Connect</h1>
        <p>Your gateway to all campus events, hackathons, and workshops.</p>
        <Button onClick={handleFindEventClick}>Find Events</Button>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #131324; /* Match Login Page background */
  color: #f5f5f5; /* Match Login Page text color */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex: 1;

  h1 {
    color: #4e0eff; /* Accent color */
  }

  p {
    color: #d1d1d1; /* Lighter text color */
  }
`;

const Button = styled.button`
  background-color: #4e0eff;
  color: white;
  padding: 1rem 2rem;
  border: none;
  font-weight: bold;
  cursor: pointer;
  border-radius: 0.4rem;
  font-size: 1rem;
  text-transform: uppercase;
  transition: background-color 0.3s ease;
  margin: 1rem; /* Margin for spacing around the button */
  padding: 1rem 2rem; /* Padding inside the button */

  &:hover {
    background-color: #3a0a9e; /* Darker shade for hover effect */
  }
`;

export default Home;
