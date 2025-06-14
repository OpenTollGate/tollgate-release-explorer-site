import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNostrReleases } from '../../contexts/NostrReleaseContext';
import { getChannelColor } from '../../styles/theme';
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
  getReleaseFileHash,
  getReleaseMimeType,
  getReleaseOpenWrtVersion,
  findAlternativeReleases
} from '../../utils/releaseUtils';
import Button from '../common/Button';
import Card, { CardHeader, CardContent } from '../common/Card';

const DownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [showAllAlternatives, setShowAllAlternatives] = useState(false);

  const release = releases.find(r => r.id === releaseId);
  const alternativeReleases = release ? findAlternativeReleases(releases, release) : [];

  if (!release) {
    return (
      <PageContainer>
        <ErrorCard>
          <CardHeader>
            <h2>Release Not Found</h2>
          </CardHeader>
          <CardContent>
            <p>The requested release could not be found.</p>
            <Button onClick={() => navigate('/')}>
              Back to Explorer
            </Button>
          </CardContent>
        </ErrorCard>
      </PageContainer>
    );
  }

  const version = getReleaseVersion(release);
  const date = getReleaseDate(release);
  const channel = getReleaseChannel(release);
  const architecture = getReleaseArchitecture(release);
  const deviceId = getReleaseDeviceId(release);
  const supportedDevices = getReleaseSupportedDevices(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);
  const fileHash = getReleaseFileHash(release);
  const mimeType = getReleaseMimeType(release);
  const openWrtVersion = getReleaseOpenWrtVersion(release);
  
  // Extract filename from download URL
  const filename = downloadUrl ? downloadUrl.split('/').pop() : 'downloaded-file.ipk';

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          ← Back to Explorer
        </BackButton>
      </Header>

      <ContentGrid>
        <MainContent>
          <ReleaseHeader>
            <TitleSection>
              <ProductTitle>{productName}</ProductTitle>
              <VersionText>{version}</VersionText>
              <ChannelBadge $color={getChannelColor(channel)}>
                {channel}
              </ChannelBadge>
            </TitleSection>
            <DownloadButton 
              variant="primary" 
              size="lg"
              onClick={handleDownload}
              disabled={!downloadUrl}
            >
              Download Release
            </DownloadButton>
          </ReleaseHeader>

          {release.content && (
            <DescriptionCard>
              <CardHeader>
                <h3>Description</h3>
              </CardHeader>
              <CardContent>
                <Description>{release.content}</Description>
              </CardContent>
            </DescriptionCard>
          )}

          <InstallationCard>
            <CardHeader>
              <h3>Installation Instructions</h3>
            </CardHeader>
            <CardContent>
              <InstructionsList>
                {productType === 'tollgate-os' ? (
                  <>
                    <li>Download the firmware file to your computer</li>
                    <li>Connect to your router's web interface (usually 192.168.1.1)</li>
                    <li>Navigate to System → Firmware Upgrade</li>
                    <li>Select the downloaded firmware file</li>
                    <li>Click "Flash Firmware" and wait for the process to complete</li>
                    <li>The router will reboot automatically when finished</li>
                  </>
                ) : (
                  <>
                    <li>Download the package file (.ipk) to your computer</li>
                    <li>Connect to your router via SSH</li>
                    <li>Upload the package file to the router</li>
                    <li>Run: <code>opkg install {filename}</code></li>
                    <li>Configure the service as needed</li>
                  </>
                )}
              </InstructionsList>
            </CardContent>
          </InstallationCard>

          {alternativeReleases.length > 0 && (
            <AlternativesCard>
              <CardHeader>
                <h3>
                  {productType === 'tollgate-os' ? 'Other Devices' : 'Other Architectures'}
                </h3>
                <AlternativeCount>
                  {alternativeReleases.length} other {alternativeReleases.length === 1 ? 'variant' : 'variants'} available
                </AlternativeCount>
              </CardHeader>
              <CardContent>
                <AlternativesContainer>
                  <AlternativesList $showAll={showAllAlternatives}>
                    <AlternativesHeader>
                      <AlternativeHeaderCell width="40%">
                        {productType === 'tollgate-os' ? 'Device' : 'Architecture'}
                      </AlternativeHeaderCell>
                      <AlternativeHeaderCell width="25%">Date</AlternativeHeaderCell>
                      <AlternativeHeaderCell width="25%">Channel</AlternativeHeaderCell>
                      <AlternativeHeaderCell width="10%">Action</AlternativeHeaderCell>
                    </AlternativesHeader>
                    
                    {(showAllAlternatives ? alternativeReleases : alternativeReleases.slice(0, 3)).map((altRelease) => (
                      <AlternativeRow
                        key={altRelease.id}
                        onClick={() => navigate(`/download/${altRelease.id}`)}
                      >
                        <AlternativeCell width="40%">
                          <AlternativeMainInfo>
                            {productType === 'tollgate-os' ? getReleaseDeviceId(altRelease) : getReleaseArchitecture(altRelease)}
                          </AlternativeMainInfo>
                        </AlternativeCell>
                        
                        <AlternativeCell width="25%">
                          <AlternativeDate>{getReleaseDate(altRelease)}</AlternativeDate>
                        </AlternativeCell>
                        
                        <AlternativeCell width="25%">
                          <AlternativeChannelBadge $color={getChannelColor(getReleaseChannel(altRelease))}>
                            {getReleaseChannel(altRelease)}
                          </AlternativeChannelBadge>
                        </AlternativeCell>
                        
                        <AlternativeCell width="10%">
                          <AlternativeDownloadButton
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const url = getReleaseDownloadUrl(altRelease);
                              if (url) window.open(url, '_blank');
                            }}
                            disabled={!getReleaseDownloadUrl(altRelease)}
                          >
                            Download
                          </AlternativeDownloadButton>
                        </AlternativeCell>
                      </AlternativeRow>
                    ))}
                    
                    {!showAllAlternatives && alternativeReleases.length > 3 && (
                      <FadeOverlay />
                    )}
                  </AlternativesList>
                  
                  {alternativeReleases.length > 3 && (
                    <ShowMoreButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllAlternatives(!showAllAlternatives)}
                    >
                      {showAllAlternatives ? 'Show Less' : `Show All ${alternativeReleases.length} Variants`}
                    </ShowMoreButton>
                  )}
                </AlternativesContainer>
              </CardContent>
            </AlternativesCard>
          )}
        </MainContent>

        <Sidebar>
          <DetailsCard>
            <CardHeader>
              <h3>Release Details</h3>
            </CardHeader>
            <CardContent>
              <DetailsList>
                <DetailItem>
                  <DetailLabel>Released</DetailLabel>
                  <DetailValue>{date}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Architecture</DetailLabel>
                  <DetailValue>{architecture}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Device ID</DetailLabel>
                  <DetailValue>{deviceId}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Supported Devices</DetailLabel>
                  <DetailValue>{supportedDevices}</DetailValue>
                </DetailItem>
                {openWrtVersion !== 'Unknown' && (
                  <DetailItem>
                    <DetailLabel>OpenWRT Version</DetailLabel>
                    <DetailValue>{openWrtVersion}</DetailValue>
                  </DetailItem>
                )}
                <DetailItem>
                  <DetailLabel>File Type</DetailLabel>
                  <DetailValue>{mimeType}</DetailValue>
                </DetailItem>
              </DetailsList>
            </CardContent>
          </DetailsCard>

          {fileHash && (
            <VerificationCard>
              <CardHeader>
                <h3>File Verification</h3>
              </CardHeader>
              <CardContent>
                <HashSection>
                  <DetailLabel>SHA-256 Hash</DetailLabel>
                  <HashValue onClick={() => copyToClipboard(fileHash)}>
                    {fileHash}
                    <CopyIcon>📋</CopyIcon>
                  </HashValue>
                </HashSection>
                <VerifyInstructions>
                  After downloading, verify the file integrity by comparing the SHA-256 hash:
                </VerifyInstructions>
                <CommandSection>
                  <CommandCode onClick={() => copyToClipboard(`shasum -a 256 ${downloadUrl?.split('/').pop() || 'downloaded-file'}`)}>
                    shasum -a 256 {downloadUrl?.split('/').pop() || 'downloaded-file'}
                    <CopyIcon>📋</CopyIcon>
                  </CommandCode>
                  <CommandNote>
                    Run this command in your terminal after downloading to verify the file hash matches.
                  </CommandNote>
                </CommandSection>
              </CardContent>
            </VerificationCard>
          )}

          <DeveloperCard>
            <CardHeader>
              <h3>Developer Info</h3>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                size="sm" 
                fullWidth
                onClick={() => setShowRawEvent(!showRawEvent)}
              >
                {showRawEvent ? 'Hide' : 'Show'} Raw Event
              </Button>
              
              {showRawEvent && (
                <RawEventSection>
                  <RawEventText>
                    {JSON.stringify({
                      id: release.id,
                      pubkey: release.pubkey,
                      created_at: release.created_at,
                      kind: release.kind,
                      tags: release.tags,
                      content: release.content,
                      sig: release.sig
                    }, null, 2)}
                  </RawEventText>
                </RawEventSection>
              )}
            </CardContent>
          </DeveloperCard>
        </Sidebar>
      </ContentGrid>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing.xl} ${props => props.theme.spacing.lg};
`;

const Header = styled.div`
  margin-bottom: ${props => props.theme.spacing.xl};
`;

const BackButton = styled(Button)`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.xl};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.lg};
`;

const ReleaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.lg};
  margin-bottom: ${props => props.theme.spacing.xl};

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.sm};
`;

const ProductTitle = styled.h1`
  margin: 0;
  font-size: ${props => props.theme.fontSizes['3xl']};
  font-weight: ${props => props.theme.fontWeights.bold};
  color: ${props => props.theme.colors.text};
`;

const VersionText = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.primary};
  font-family: monospace;
`;

const ChannelBadge = styled.span`
  background-color: ${props => props.$color};
  color: white;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  align-self: flex-start;
`;

const DownloadButton = styled(Button)`
  white-space: nowrap;
`;

const DescriptionCard = styled(Card)``;
const InstallationCard = styled(Card)``;
const AlternativesCard = styled(Card)``;
const DetailsCard = styled(Card)``;
const VerificationCard = styled(Card)``;
const DeveloperCard = styled(Card)``;
const ErrorCard = styled(Card)``;

const CommandSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const CommandCode = styled.div`
  font-family: monospace;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.backgroundTertiary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.sm};
  word-break: break-all;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.sm};
  margin-bottom: ${props => props.theme.spacing.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.cardBackground};
  }
`;

const CommandNote = styled.p`
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textMuted};
  margin: 0;
  font-style: italic;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

const InstructionsList = styled.ol`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  padding-left: ${props => props.theme.spacing.lg};
  
  li {
    margin-bottom: ${props => props.theme.spacing.sm};
  }
  
  code {
    background-color: ${props => props.theme.colors.backgroundTertiary};
    padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
    border-radius: ${props => props.theme.radii.sm};
    font-family: monospace;
    color: ${props => props.theme.colors.text};
  }
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.spacing.md};
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textMuted};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const DetailValue = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  word-break: break-word;
`;

const HashSection = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const HashValue = styled.div`
  font-family: monospace;
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.backgroundTertiary};
  padding: ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.sm};
  word-break: break-all;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${props => props.theme.spacing.sm};
  
  &:hover {
    background-color: ${props => props.theme.colors.cardBackground};
  }
`;

const CopyIcon = styled.span`
  flex-shrink: 0;
  opacity: 0.7;
`;

const VerifyInstructions = styled.p`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.5;
`;

const RawEventSection = styled.div`
  margin-top: ${props => props.theme.spacing.md};
`;

const RawEventText = styled.pre`
  background-color: ${props => props.theme.colors.backgroundTertiary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.sm};
  font-size: ${props => props.theme.fontSizes.xs};
  color: ${props => props.theme.colors.textSecondary};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 400px;
  overflow-y: auto;
`;

const AlternativeCount = styled.span`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  font-weight: ${props => props.theme.fontWeights.normal};
`;

const AlternativesContainer = styled.div`
  background-color: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.md};
  overflow: hidden;
`;

const AlternativesList = styled.div`
  position: relative;
  ${props => !props.$showAll && `
    max-height: 280px;
    overflow: hidden;
  `}
`;

const AlternativesHeader = styled.div`
  display: flex;
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
`;

const AlternativeHeaderCell = styled.div`
  flex: 0 0 ${props => props.width};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlternativeRow = styled.div`
  display: flex;
  padding: ${props => props.theme.spacing.md};
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

const AlternativeCell = styled.div`
  flex: 0 0 ${props => props.width};
  display: flex;
  align-items: center;
  justify-content: ${props => props.width === '10%' ? 'flex-end' : 'flex-start'};
`;

const AlternativeMainInfo = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
  font-family: monospace;
`;

const AlternativeDate = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const AlternativeChannelBadge = styled.span`
  background-color: ${props => props.$color};
  color: white;
  padding: ${props => props.theme.spacing.xs} ${props => props.theme.spacing.sm};
  border-radius: ${props => props.theme.radii.full};
  font-size: ${props => props.theme.fontSizes.xs};
  font-weight: ${props => props.theme.fontWeights.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const AlternativeDownloadButton = styled(Button)`
  white-space: nowrap;
  min-width: 80px;
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, ${props => props.theme.colors.cardBackground});
  pointer-events: none;
`;

const ShowMoreButton = styled(Button)`
  width: 100%;
  margin-top: ${props => props.theme.spacing.md};
`;

export default DownloadPage;