import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../common/Button';
import { getChannelColor } from '../../styles/theme';
import { PRODUCT_TYPES } from '../../constants';
import {
  getReleaseVersion,
  getReleaseDateWithTime,
  getReleaseChannel,
  getReleaseProductType,
  getProductDisplayName,
  getReleaseDownloadUrl
} from '../../utils/releaseUtils';

const ReleaseList = ({ releases }) => {
  const navigate = useNavigate();

  const getDetailRoute = (release) => {
    const productType = getReleaseProductType(release);
    if (productType === PRODUCT_TYPES.TOLLGATE_OS) {
      return `/os/${release.id}`;
    }
    return `/package/${release.id}`;
  };

  const handleRowClick = (release) => {
    navigate(getDetailRoute(release));
  };

  const handleDownload = (e, release) => {
    e.stopPropagation();
    navigate(getDetailRoute(release));
  };

  return (
    <ListContainer>
      <ListHeader>
        <HeaderCell width="35%">Product & Version</HeaderCell>
        <HeaderCell width="20%">Channel</HeaderCell>
        <HeaderCell width="35%">Released</HeaderCell>
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
  const dateTime = getReleaseDateWithTime(release);
  const channel = getReleaseChannel(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);

  return (
    <ListRow onClick={() => onRowClick(release)}>
      <ListCell width="35%">
        <ProductInfo>
          <ProductName>{productName}</ProductName>
          <VersionText>{version}</VersionText>
        </ProductInfo>
      </ListCell>
      
      <ListCell width="20%">
        <ChannelContainer>
          <ChannelDot $color={getChannelColor(channel)} className="show-mobile" />
          <ChannelBadge $color={getChannelColor(channel)} className="hide-mobile">
            {channel}
          </ChannelBadge>
        </ChannelContainer>
      </ListCell>
      
      <ListCell width="35%">
        <DateText>{dateTime}</DateText>
      </ListCell>
      
      <ListCell width="10%" className="hide-mobile">
        <Button
          variant="primary"
          size="sm"
          onClick={(e) => onDownload(e, release)}
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


export default ReleaseList;