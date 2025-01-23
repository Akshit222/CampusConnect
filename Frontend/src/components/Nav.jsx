// src/components/Nav.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../assets/logo.svg';

const Nav = () => {
  const navigate = useNavigate();
  const auth = localStorage.getItem('chat-app-user'); // Check for user authentication

  const handleLogout = () => {
    if (auth) {
      localStorage.removeItem('chat-app-user');
      navigate('/login');
    }
  };

  return (
    <NavContainer>
      <LogoSection>
        <LogoImage src={logo} alt="Campus Connect Logo" />
        <Logo onClick={() => navigate('/')}>Campus Connect</Logo>
      </LogoSection>
      <NavLinks>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact</NavLink>
        {auth ? (
          <>
            <NavLink to="/find-events">Find Events</NavLink>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </NavLinks>
    </NavContainer>
  );
};

const NavContainer = styled.div`
  position: fixed; /* Ensure the Nav is fixed at the top */
  top: 0;
  width: 100%;
  background-color: #131324;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #4e0eff;
  z-index: 10; /* Ensure it is on top */
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem; /* Space between logo image and text */
`;

const LogoImage = styled.img`
  height: 40px; /* Adjust height as needed */
  width: auto; /* Maintain aspect ratio */
`;

const Logo = styled.h1`
  color: #4e0eff;
  cursor: pointer;
  font-size: 1.5rem;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: #f5f5f5;
  cursor: pointer;
  font-size: 1rem;
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: #4e0eff;
  }
`;

const Button = styled.button`
  background: none;
  border: none;
  color: #f5f5f5;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4e0eff;
    color: white;
    border-radius: 0.4rem;
  }
`;

export default Nav;
