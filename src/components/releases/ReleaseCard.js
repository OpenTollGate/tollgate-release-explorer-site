import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Card, { CardHeader, CardContent, CardFooter } from '../common/Card';
import Button from '../common/Button';
import { getChannelColor } from '../../styles/theme';
import { PRODUCT_TYPES } from '../../constants';
import {
  getReleaseVersion,
  getReleaseDate,
  getReleaseChannel,
  getReleaseArchitecture,
  getReleaseDeviceId,
  getReleaseSupportedDevices,
  getReleaseProductType,
  getProductDisplayName,
  getReleaseDownloadUrl,
  truncateText
} from '../../utils/releaseUtils';

const ReleaseCard = ({ release }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const version = getReleaseVersion(release);
  const date = getReleaseDate(release);
  const channel = getReleaseChannel(release);
  const architecture = getReleaseArchitecture(release);
  const deviceId = getReleaseDeviceId(release);
  const supportedDevices = getReleaseSupportedDevices(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);

  // Determine the correct route based on product type
  const getDetailRoute = () => {
    if (productType === PRODUCT_TYPES.TOLLGATE_OS) {
      return `/os/${release.id}`;
    }
    return `/package/${release.id}`;
  };

  const handleCardClick = () => {
    navigate(getDetailRoute());
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    navigate(getDetailRoute());
  };

  const toggleDetails = (e) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <StyledCard hover onClick={handleCardClick}>
      <CardHeader>
        <TitleRow>
          <ProductTitle>{productName}</ProductTitle>
          <ChannelBadge $color={getChannelColor(channel)}>
            {channel}
          </ChannelBadge>
        </TitleRow>
        <VersionText>{version}</VersionText>
      </CardHeader>

      <CardContent>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>Released</InfoLabel>
            <InfoValue>{date}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Architecture</InfoLabel>
            <InfoValue>{truncateText(architecture, 20)}</InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>Device</InfoLabel>
            <InfoValue>{truncateText(deviceId, 20)}</InfoValue>
          </InfoItem>
        </InfoGrid>

        {release.content && (
          <Description>
            {truncateText(release.content, 120)}
          </Description>
        )}

        {showDetails && (
          <DetailsSection>
            <DetailItem>
              <DetailLabel>Supported Devices:</DetailLabel>
              <DetailValue>{supportedDevices}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>Event ID:</DetailLabel>
              <DetailValue>{release.id}</DetailValue>
            </DetailItem>
            {downloadUrl && (
              <DetailItem>
                <DetailLabel>Download URL:</DetailLabel>
                <DetailValue>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    {truncateText(downloadUrl, 50)}
                  </a>
                </DetailValue>
              </DetailItem>
            )}
          </DetailsSection>
        )}
      </CardContent>

      <CardFooter>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleDetails}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </Button>
        <Button 
          variant="primary" 
          size="sm" 
          onClick={handleDownload}
          disabled={!downloadUrl}
        >
          Download
        </Button>
      </CardFooter>
    </StyledCard>
  );
};

const StyledCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
`;

const ProductTitle = styled.h3`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.lg};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const VersionText = styled.p`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.md};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.primary};
  font-family: monospace;
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
  flex-shrink: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${props => props.theme.spacing.md};
  margin-bottom: ${props => props.theme.spacing.md};
`;

const InfoItem = styled.div``;

const InfoLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  line-height: 1.5;
  margin: 0 0 ${props => props.theme.spacing.md} 0;
`;

const DetailsSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const DetailItem = styled.div`
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textMuted};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DetailValue = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-family: monospace;
  word-break: break-all;
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export default ReleaseCard;