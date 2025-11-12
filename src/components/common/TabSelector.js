import React from 'react';
import styled from 'styled-components';
import { VIEW_MODES } from '../../constants';

const TabSelector = ({ activeTab, onTabChange, tabs, viewMode, onViewModeChange }) => {
  return (
    <TabContainer>
      <TabsWrapper>
        {tabs.map(tab => (
          <Tab
            key={tab.value}
            $active={activeTab === tab.value}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
            {tab.count !== undefined && (
              <TabCount $active={activeTab === tab.value}>
                {tab.count}
              </TabCount>
            )}
          </Tab>
        ))}
      </TabsWrapper>
      
      {viewMode && onViewModeChange && (
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
      )}
    </TabContainer>
  );
};

const TabContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.xl};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${props => props.theme.spacing.sm};
  }
`;

const TabsWrapper = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
`;

const Tab = styled.button`
  background: none;
  border: none;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.textSecondary};
  cursor: pointer;
  position: relative;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    color: ${props => props.$active ? props.theme.colors.primaryDark : props.theme.colors.text};
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${props => props.$active ? props.theme.colors.primary : 'transparent'};
    transition: background-color ${props => props.theme.transitions.fast};
  }
`;

const TabCount = styled.span`
  background-color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  color: ${props => props.$active ? 'white' : props.theme.colors.textMuted};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  min-width: 20px;
  text-align: center;
`;

const ViewToggle = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: ${props => props.theme.radii.md};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 2px;
  margin-bottom: 2px;
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

export default TabSelector;