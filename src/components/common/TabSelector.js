import React from 'react';
import styled from 'styled-components';

const TabSelector = ({ activeTab, onTabChange, tabs }) => {
  return (
    <TabContainer>
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
    </TabContainer>
  );
};

const TabContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.xl};
  border-bottom: 2px solid ${props => props.theme.colors.border};
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

export default TabSelector;