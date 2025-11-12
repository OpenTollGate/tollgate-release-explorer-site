import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Card, { CardHeader, CardContent } from '../common/Card';
import { getChannelColor } from '../../styles/theme';
import { PRODUCT_TYPES } from '../../constants';
import {
  getReleaseVersion,
  getReleaseDateWithTime,
  getReleaseChannel,
  getReleaseProductType,
  getProductDisplayName
} from '../../utils/releaseUtils';

const ReleaseCard = ({ release }) => {
  const navigate = useNavigate();

  const version = getReleaseVersion(release);
  const dateTime = getReleaseDateWithTime(release);
  const channel = getReleaseChannel(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);

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
        <ReleasedInfo>
          <InfoLabel>Released</InfoLabel>
          <InfoValue>{dateTime}</InfoValue>
        </ReleasedInfo>
      </CardContent>
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

const ReleasedInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xs};
`;

const InfoLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-size: ${props => props.theme.fontSizes.md};
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.fontWeights.medium};
`;

export default ReleaseCard;