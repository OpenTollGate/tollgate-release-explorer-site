import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../common/Button';
import { getChannelColor } from '../../styles/theme';
import {
  getReleaseVersion,
  getReleaseDate,
  getReleaseChannel,
  getReleaseArchitecture,
  getReleaseDeviceId,
  getReleaseProductType,
  getProductDisplayName,
  getReleaseDownloadUrl,
  truncateText
} from '../../utils/releaseUtils';

const ReleaseList = ({ releases }) => {
  const navigate = useNavigate();

  const handleRowClick = (releaseId) => {
    navigate(`/download/${releaseId}`);
  };

  const handleDownload = (e, releaseId) => {
    e.stopPropagation();
    navigate(`/download/${releaseId}`);
  };

  return (
    <ListContainer>
      <ListHeader>
        <HeaderCell width="25%">Product & Version</HeaderCell>
        <HeaderCell width="15%">Channel</HeaderCell>
        <HeaderCell width="15%">Date</HeaderCell>
        <HeaderCell width="20%">Architecture</HeaderCell>
        <HeaderCell width="15%">Device</HeaderCell>
        <HeaderCell width="10%" className="hide-mobile">Actions</HeaderCell>
      </ListHeader>

      <ListBody>
        {releases.map((release) => (
          <ReleaseRow
            key={release.id}
            release={release}
            onRowClick={handleRowClick}
            onDownload={handleDownload}
          />
        ))}
      </ListBody>
    </ListContainer>
  );
};

const ReleaseRow = ({ release, onRowClick, onDownload }) => {
  const version = getReleaseVersion(release);
  const date = getReleaseDate(release);
  const channel = getReleaseChannel(release);
  const architecture = getReleaseArchitecture(release);
  const deviceId = getReleaseDeviceId(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);

  return (
    <ListRow onClick={() => onRowClick(release.id)}>
      <ListCell width="25%">
        <ProductInfo>
          <ProductName>{productName}</ProductName>
          <VersionText>{version}</VersionText>
        </ProductInfo>
      </ListCell>
      
      <ListCell width="15%">
        <ChannelContainer>
          <ChannelDot $color={getChannelColor(channel)} className="show-mobile" />
          <ChannelBadge $color={getChannelColor(channel)} className="hide-mobile">
            {channel}
          </ChannelBadge>
        </ChannelContainer>
      </ListCell>
      
      <ListCell width="15%">
        <DateText>{date}</DateText>
      </ListCell>
      
      <ListCell width="20%">
        <ArchText>{truncateText(architecture, 25)}</ArchText>
      </ListCell>
      
      <ListCell width="15%">
        <DeviceText>{truncateText(deviceId, 20)}</DeviceText>
      </ListCell>
      
      <ListCell width="10%" className="hide-mobile">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => onDownload(e, release.id)}
          disabled={!downloadUrl}
        >
          Download
        </Button>
      </ListCell>
    </ListRow>
  );
};

const ListContainer = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.lg};
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

const ListHeader = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
`;

const HeaderCell = styled.div`
  flex: 0 0 ${props => props.width};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    &.hide-mobile {
      display: none;
    }
  }
`;

const ListBody = styled.div`
  max-height: 70vh;
  overflow-y: auto;
`;

const ListRow = styled.div`
  display: flex;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  transition: all ${props => props.theme.transitions.fast};
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.theme.colors.cardBackgroundHover};
    transform: translateX(2px);
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ListCell = styled.div`
  flex: 0 0 ${props => props.width};
  display: flex;
  align-items: center;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    &.hide-mobile {
      display: none;
    }
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const ProductName = styled.div`
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const VersionText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.primary};
  font-family: monospace;
`;

const ChannelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ChannelBadge = styled.span`
  background-color: ${props => props.$color};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    &.hide-mobile {
      display: none;
    }
  }
`;

const ChannelDot = styled.div`
  display: none;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    &.show-mobile {
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${props => props.$color};
      flex-shrink: 0;
    }
  }
`;

const DateText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ArchText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-family: monospace;
`;

const DeviceText = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-family: monospace;
`;

export default ReleaseList;