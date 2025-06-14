import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNostrReleases } from '../../contexts/NostrReleaseContext';
import { VIEW_MODES } from '../../constants';
import Button from '../common/Button';
import PublisherModal from '../publisher/PublisherModal';

// Import logo
import logoWhite from '../../assets/logo/TollGate_Logo-C-white.png';

const Header = ({ viewMode, onViewModeChange }) => {
  const { currentPubkey } = useNostrReleases();
  const [showPublisherModal, setShowPublisherModal] = useState(false);
  const navigate = useNavigate();

  const isDefaultPubkey = currentPubkey === '5075e61f0b048148b60105c1dd72bbeae1957336ae5824087e52efa374f8416a';

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <LogoSection onClick={handleLogoClick}>
            <Logo src={logoWhite} alt="TollGate" />
            <TitleSection>
              <Title>Release Explorer</Title>
              <Subtitle>Browse and download TollGate releases</Subtitle>
            </TitleSection>
          </LogoSection>

          <HeaderActions>
            <PublisherInfo>
              <PublisherLabel>Publisher:</PublisherLabel>
              <PublisherValue>
                {isDefaultPubkey ? 'TollGate (Official)' : `${currentPubkey.slice(0, 8)}...`}
              </PublisherValue>
              <SwitchButton
                variant="outline"
                size="sm"
                onClick={() => setShowPublisherModal(true)}
              >
                Switch Publisher
              </SwitchButton>
            </PublisherInfo>

            <ViewToggle>
              <ViewButton 
                $active={viewMode === VIEW_MODES.GRID}
                onClick={() => onViewModeChange(VIEW_MODES.GRID)}
                title="Grid View"
              >
                <GridIcon />
              </ViewButton>
              <ViewButton 
                $active={viewMode === VIEW_MODES.LIST}
                onClick={() => onViewModeChange(VIEW_MODES.LIST)}
                title="List View"
              >
                <ListIcon />
              </ViewButton>
            </ViewToggle>
          </HeaderActions>
        </HeaderContent>
      </HeaderContainer>

      {showPublisherModal && (
        <PublisherModal onClose={() => setShowPublisherModal(false)} />
      )}
    </>
  );
};

const HeaderContainer = styled.header`
  background-color: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.lg} 0;
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.sm} 0;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 ${props => props.theme.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 ${props => props.theme.spacing.sm};
    flex-direction: column;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
  cursor: pointer;
  transition: opacity ${props => props.theme.transitions.fast};
  
  &:hover {
    opacity: 0.8;
  }
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    gap: ${props => props.theme.spacing.sm};
  }
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    height: 24px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  margin: 0;
  font-size: ${props => props.theme.fontSizes['2xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes.lg};
  }
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes.xs};
    display: none;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.lg};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    gap: ${props => props.theme.spacing.sm};
    width: 100%;
    justify-content: space-between;
  }
`;

const PublisherInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex: 1;
    justify-content: space-between;
    padding: 4px 8px;
    gap: 4px;
    min-height: 32px;
  }
`;

const PublisherLabel = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: 10px;
  }
`;

const PublisherValue = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  font-family: monospace;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: 10px;
  }
`;

const SwitchButton = styled(Button)`
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    font-size: 10px;
    padding: 4px 8px;
    min-height: 24px;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 2px;
`;

const ViewButton = styled.button`
  background-color: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.$active ? 'white' : props.theme.colors.textSecondary};
  border: none;
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background-color: ${props => props.$active ? props.theme.colors.primaryDark : props.theme.colors.cardBackgroundHover};
    color: ${props => props.$active ? 'white' : props.theme.colors.text};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

// Simple SVG icons
const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z"/>
  </svg>
);

const ListIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
  </svg>
);

export default Header;