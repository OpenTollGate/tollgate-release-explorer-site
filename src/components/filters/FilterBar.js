import React from 'react';
import styled from 'styled-components';
import { useNostrReleases } from '../../contexts/NostrReleaseContext';
import { RELEASE_CHANNELS, PRODUCT_TYPES } from '../../constants';
import { getUniqueReleaseValues, getReleaseCountText } from '../../utils/releaseUtils';
import { getChannelColor } from '../../styles/theme';
import Button from '../common/Button';

const FilterBar = ({ filters, onFiltersChange }) => {
  const { releases, loading } = useNostrReleases();

  // Get unique values for filter options
  const availableArchitectures = getUniqueReleaseValues(releases, 'architectures');
  const availableDevices = getUniqueReleaseValues(releases, 'devices');

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
      products: [PRODUCT_TYPES.TOLLGATE_OS, PRODUCT_TYPES.TOLLGATE_CORE],
      architectures: [],
      devices: [],
      deduplicate: false
    });
  };

  const toggleDeduplicate = () => {
    onFiltersChange({
      ...filters,
      deduplicate: !filters.deduplicate
    });
  };

  const hasActiveFilters = () => {
    return filters.architectures.length > 0 || 
           filters.devices.length > 0 ||
           filters.channels.length !== 1 ||
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

      {/* Show Only Unique Versions Toggle */}
      <UniqueVersionsToggle>
        <CompactToggle>
          <CompactToggleLabel>Show only unique versions</CompactToggleLabel>
          <CompactToggleSwitch $active={filters.deduplicate} onClick={toggleDeduplicate}>
            <CompactToggleSlider $active={filters.deduplicate} />
          </CompactToggleSwitch>
        </CompactToggle>
      </UniqueVersionsToggle>

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

        {/* Product Types */}
        <FilterSection>
          <SectionTitle>Products</SectionTitle>
          <FilterGroup>
            {Object.values(PRODUCT_TYPES).map(product => (
              <FilterChip
                key={product}
                $active={filters.products.includes(product)}
                onClick={() => updateFilter('products', product)}
              >
                {product === PRODUCT_TYPES.TOLLGATE_OS ? 'TollGate OS' :
                 product === PRODUCT_TYPES.TOLLGATE_CORE ? 'TollGate Core' :
                 'TollGate Basic Module'}
              </FilterChip>
            ))}
          </FilterGroup>
        </FilterSection>

        {/* Architectures */}
        {availableArchitectures.length > 0 && (
          <FilterSection>
            <SectionTitle>Architectures</SectionTitle>
            <FilterGroup>
              {availableArchitectures.map(arch => (
                <FilterChip
                  key={arch}
                  $active={filters.architectures.includes(arch)}
                  onClick={() => updateFilter('architectures', arch)}
                >
                  {arch}
                </FilterChip>
              ))}
            </FilterGroup>
          </FilterSection>
        )}

        {/* Devices */}
        {availableDevices.length > 0 && (
          <FilterSection>
            <SectionTitle>Devices</SectionTitle>
            <FilterGroup>
              {availableDevices.slice(0, 10).map(device => (
                <FilterChip
                  key={device}
                  $active={filters.devices.includes(device)}
                  onClick={() => updateFilter('devices', device)}
                >
                  {device}
                </FilterChip>
              ))}
              {availableDevices.length > 10 && (
                <MoreIndicator>
                  +{availableDevices.length - 10} more
                </MoreIndicator>
              )}
            </FilterGroup>
          </FilterSection>
        )}
      </FilterSections>
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

const FilterSections = styled.div`
  display: grid;
  gap: ${props => props.theme.spacing.lg};
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
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

const MoreIndicator = styled.span`
  color: ${props => props.theme.colors.textMuted};
  font-size: ${props => props.theme.fontSizes.sm};
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.md};
  font-style: italic;
`;

const UniqueVersionsToggle = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: ${props => props.theme.spacing.lg};
  padding-bottom: ${props => props.theme.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const CompactToggle = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
`;

const CompactToggleLabel = styled.label`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
`;

const CompactToggleSwitch = styled.button`
  position: relative;
  width: 32px;
  height: 18px;
  background-color: ${props => props.$active ? props.theme.colors.primary : props.theme.colors.border};
  border: none;
  border-radius: 9px;
  cursor: pointer;
  transition: background-color ${props => props.theme.transitions.fast};
  
  &:hover {
    background-color: ${props => props.$active ? props.theme.colors.primaryDark : props.theme.colors.borderLight};
  }
`;

const CompactToggleSlider = styled.div`
  position: absolute;
  top: 2px;
  left: ${props => props.$active ? '16px' : '2px'};
  width: 14px;
  height: 14px;
  background-color: white;
  border-radius: 50%;
  transition: left ${props => props.theme.transitions.fast};
`;

export default FilterBar;