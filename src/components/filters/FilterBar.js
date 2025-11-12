import React from 'react';
import styled from 'styled-components';
import { useNostrReleases } from '../../contexts/NostrReleaseContext';
import { RELEASE_CHANNELS, PRODUCT_CATEGORIES } from '../../constants';
import { getReleaseCountText } from '../../utils/releaseUtils';
import { getChannelColor } from '../../styles/theme';
import Button from '../common/Button';

const FilterBar = ({ filters, onFiltersChange, activeCategory }) => {
  const { releases, loading } = useNostrReleases();

  const updateFilter = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    onFiltersChange({
      ...filters,
      [filterType]: newValues
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      channels: [RELEASE_CHANNELS.STABLE], // Keep stable as default
      products: filters.products // Keep current products (controlled by tabs)
    });
  };

  const hasActiveFilters = () => {
    return filters.channels.length !== 1 ||
           !filters.channels.includes(RELEASE_CHANNELS.STABLE);
  };

  if (loading) {
    return (
      <FilterContainer>
        <FilterSection>
          <FilterTitle>Filters</FilterTitle>
          <LoadingText>Loading releases...</LoadingText>
        </FilterSection>
      </FilterContainer>
    );
  }

  // Get category description
  const getCategoryDescription = () => {
    if (activeCategory === PRODUCT_CATEGORIES.OS) {
      return {
        title: "OS Images",
        description: "Complete OpenWrt firmware images that replace your router's existing operating system. These are device-specific builds that include TollGate pre-configured. Use these for a fresh installation or when setting up a new device."
      };
    }
    return {
      title: "Packages",
      description: "TollGate software packages that can be installed on existing OpenWrt systems. These are architecture-specific and work across multiple compatible devices. Ideal for adding TollGate to your current OpenWrt installation."
    };
  };

  const categoryInfo = getCategoryDescription();

  return (
    <FilterContainer>
      <FilterHeader>
        <FilterTitle>
          Filters
          <ReleaseCount>({getReleaseCountText(releases)})</ReleaseCount>
        </FilterTitle>
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear Filters
          </Button>
        )}
      </FilterHeader>

      <FilterContent>
        <DescriptionSection>
          <DescriptionTitle>{categoryInfo.title}</DescriptionTitle>
          <DescriptionText>{categoryInfo.description}</DescriptionText>
        </DescriptionSection>

        <FilterSections>
          {/* Release Channels */}
          <FilterSection>
            <SectionTitle>Release Channels</SectionTitle>
            <FilterGroup>
              {Object.values(RELEASE_CHANNELS).map(channel => (
                <FilterChip
                  key={channel}
                  $active={filters.channels.includes(channel)}
                  $color={getChannelColor(channel)}
                  onClick={() => updateFilter('channels', channel)}
                >
                  {channel}
                </FilterChip>
              ))}
            </FilterGroup>
          </FilterSection>
        </FilterSections>
      </FilterContent>
    </FilterContainer>
  );
};

const FilterContainer = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};
  backdrop-filter: blur(10px);
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const FilterTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const ReleaseCount = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.normal};
  color: ${props => props.theme.colors.textSecondary};
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const FilterContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.xl};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const DescriptionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
  padding: ${props => props.theme.spacing.lg};
  background-color: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.radii.md};
  border-left: 3px solid ${props => props.theme.colors.primary};
`;

const DescriptionTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const DescriptionText = styled.p`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
`;

const FilterSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const FilterSection = styled.div``;

const SectionTitle = styled.h3`
  margin: 0 0 ${props => props.theme.spacing.md} 0;
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${props => props.theme.spacing.sm};
`;

const FilterChip = styled.button`
  background-color: ${props => props.$active 
    ? (props.$color || props.theme.colors.primary)
    : props.theme.colors.cardBackground};
  color: ${props => props.$active ? 'white' : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.$active 
    ? (props.$color || props.theme.colors.primary)
    : props.theme.colors.border};
  border-radius: ${props => props.theme.radii.full};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  font-size: ${props => props.theme.fontSizes.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-transform: capitalize;

  &:hover {
    background-color: ${props => props.$active 
      ? (props.$color || props.theme.colors.primaryDark)
      : props.theme.colors.cardBackgroundHover};
    border-color: ${props => props.$active 
      ? (props.$color || props.theme.colors.primaryDark)
      : props.theme.colors.borderLight};
  }
`;

export default FilterBar;