import React from 'react';
import styled from 'styled-components';
import ReleaseCard from './ReleaseCard';

const ReleaseGrid = ({ releases }) => {
  return (
    <GridContainer>
      {releases.map((release) => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </GridContainer>
  );
};

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${props => props.theme.spacing.xl};
  padding: ${props => props.theme.spacing.lg} 0;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    gap: ${props => props.theme.spacing.lg};
    padding: ${props => props.theme.spacing.md} 0;
  }

  @media (min-width: ${props => props.theme.breakpoints.xl}) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
`;

export default ReleaseGrid;