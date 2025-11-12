import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useNostrReleases } from "../../contexts/NostrReleaseContext";
import { getChannelColor } from "../../styles/theme";
import {
  getReleaseVersion,
  getReleaseDateWithTime,
  getReleaseChannel,
  getReleaseDeviceId,
  getReleaseSupportedDevices,
  getReleaseProductType,
  getProductDisplayName,
  getReleaseDownloadUrl,
  getReleaseFileHash,
  getReleaseMimeType,
  getReleaseOpenWrtVersion,
  findAlternativeReleases,
} from "../../utils/releaseUtils";
import Button from "../common/Button";
import Card, { CardHeader, CardContent } from "../common/Card";

const OSDownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [expandedDevice, setExpandedDevice] = useState(null);
  const [deviceSearch, setDeviceSearch] = useState("");

  const release = releases.find((r) => r.id === releaseId);
  const alternativeReleases = release
    ? findAlternativeReleases(releases, release)
    : [];
  
  // Combine current release with alternatives for full device list
  const allDevices = release ? [release, ...alternativeReleases] : [];
  
  // Filter devices based on search
  const filteredDevices = allDevices.filter((deviceRelease) => {
    if (!deviceSearch) return true;
    const deviceId = getReleaseDeviceId(deviceRelease).toLowerCase();
    return deviceId.includes(deviceSearch.toLowerCase());
  });

  if (!release) {
    return (
      <PageContainer>
        <ErrorCard>
          <CardHeader>
            <h2>Release Not Found</h2>
          </CardHeader>
          <CardContent>
            <p>The requested OS release could not be found.</p>
            <Button onClick={() => navigate("/")}>Back to Explorer</Button>
          </CardContent>
        </ErrorCard>
      </PageContainer>
    );
  }

  const version = getReleaseVersion(release);
  const dateTime = getReleaseDateWithTime(release);
  const channel = getReleaseChannel(release);
  const deviceId = getReleaseDeviceId(release);
  const supportedDevices = getReleaseSupportedDevices(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);
  const fileHash = getReleaseFileHash(release);
  const mimeType = getReleaseMimeType(release);
  const openWrtVersion = getReleaseOpenWrtVersion(release);

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, "_blank");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate("/")}>
          ← Back to Explorer
        </BackButton>
      </Header>

      <MainContent>
        <ReleaseHeader>
          <TitleSection>
            <ProductTitle>{productName}</ProductTitle>
            <VersionText>{version}</VersionText>
            <MetadataRow>
              <ChannelBadge $color={getChannelColor(channel)}>
                {channel}
              </ChannelBadge>
              <ReleasedDate>Released: {dateTime}</ReleasedDate>
            </MetadataRow>
          </TitleSection>
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
                <li>Download the firmware file to your computer</li>
                <li>
                  Connect to your router's web interface (usually 192.168.1.1)
                </li>
                <li>Navigate to System → Firmware Upgrade</li>
                <li>Select the downloaded firmware file</li>
                <li>
                  Click "Flash Firmware" and wait for the process to complete
                </li>
                <li>The router will reboot automatically when finished</li>
              </InstructionsList>
            </CardContent>
          </InstallationCard>

          <DeviceSelectionCard>
            <CardHeader>
              <h3>Available Devices</h3>
              <DeviceCount>
                {filteredDevices.length} of {allDevices.length} {allDevices.length === 1 ? "device" : "devices"}
              </DeviceCount>
            </CardHeader>
            <CardContent>
              <SearchInput
                type="text"
                placeholder="Search devices..."
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
              />
              
              <AlternativesList>
                {filteredDevices.map((deviceRelease) => {
                  const isExpanded = expandedDevice === deviceRelease.id;
                  const deviceDownloadUrl = getReleaseDownloadUrl(deviceRelease);
                  const deviceFileHash = getReleaseFileHash(deviceRelease);
                  const deviceDate = getReleaseDateWithTime(deviceRelease);
                  const deviceChannel = getReleaseChannel(deviceRelease);
                  const deviceId = getReleaseDeviceId(deviceRelease);
                  
                  return (
                    <DeviceOption
                      key={deviceRelease.id}
                      $isHighlighted={isExpanded}
                      $isExpanded={isExpanded}
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedDevice(null);
                        } else {
                          setExpandedDevice(deviceRelease.id);
                        }
                      }}
                    >
                      <DeviceOptionHeader>
                        <DeviceInfo>
                          <DeviceName>{deviceId}</DeviceName>
                          <DeviceDetails>
                            <DeviceDetailItem>
                              <DeviceDetailLabel>Released:</DeviceDetailLabel>
                              <DeviceDetailValue>{deviceDate}</DeviceDetailValue>
                            </DeviceDetailItem>
                            <DeviceDetailItem>
                              <ChannelBadge $color={getChannelColor(deviceChannel)} $small>
                                {deviceChannel}
                              </ChannelBadge>
                            </DeviceDetailItem>
                          </DeviceDetails>
                        </DeviceInfo>
                        <DeviceActions>
                          <DownloadButton
                            variant={isExpanded ? "primary" : "outline"}
                            size="sm"
                            disabled={!deviceDownloadUrl}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deviceDownloadUrl) window.open(deviceDownloadUrl, "_blank");
                            }}
                          >
                            Download
                          </DownloadButton>
                          <ExpandIcon $isExpanded={isExpanded}>
                            {isExpanded ? "▼" : "▶"}
                          </ExpandIcon>
                        </DeviceActions>
                      </DeviceOptionHeader>

                      {isExpanded && (
                        <DeviceExpandedContent>
                          {(deviceDownloadUrl || deviceFileHash) && (
                            <ExpandedSection>
                              <ExpandedTitle>Download & Verification</ExpandedTitle>
                              
                              {deviceDownloadUrl && (
                                <ExpandedItem>
                                  <ExpandedLabel>Download URL (Blossom)</ExpandedLabel>
                                  <ExpandedValue onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(deviceDownloadUrl);
                                  }}>
                                    {deviceDownloadUrl}
                                    <CopyIcon>📋</CopyIcon>
                                  </ExpandedValue>
                                </ExpandedItem>
                              )}
                              
                              {deviceFileHash && (
                                <>
                                  <ExpandedItem>
                                    <ExpandedLabel>SHA-256 Hash</ExpandedLabel>
                                    <ExpandedValue onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(deviceFileHash);
                                    }}>
                                      {deviceFileHash}
                                      <CopyIcon>📋</CopyIcon>
                                    </ExpandedValue>
                                  </ExpandedItem>
                                  
                                  <VerifyInstructions>
                                    Verify file integrity after downloading:
                                  </VerifyInstructions>
                                  <CommandCode onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(
                                      `shasum -a 256 ${deviceDownloadUrl?.split("/").pop() || "firmware.bin"}`
                                    );
                                  }}>
                                    shasum -a 256 {deviceDownloadUrl?.split("/").pop() || "firmware.bin"}
                                    <CopyIcon>📋</CopyIcon>
                                  </CommandCode>
                                </>
                              )}
                            </ExpandedSection>
                          )}
                          
                          <ExpandedSection>
                            <ExpandedTitle>Developer Info</ExpandedTitle>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowRawEvent(!showRawEvent);
                              }}
                            >
                              {showRawEvent ? "Hide" : "Show"} Raw Event
                            </Button>

                            {showRawEvent && (
                              <RawEventSection>
                                <RawEventText>
                                  {JSON.stringify(
                                    {
                                      id: deviceRelease.id,
                                      pubkey: deviceRelease.pubkey,
                                      created_at: deviceRelease.created_at,
                                      kind: deviceRelease.kind,
                                      tags: deviceRelease.tags,
                                      content: deviceRelease.content,
                                      sig: deviceRelease.sig,
                                    },
                                    null,
                                    2,
                                  )}
                                </RawEventText>
                              </RawEventSection>
                            )}
                          </ExpandedSection>
                        </DeviceExpandedContent>
                      )}
                    </DeviceOption>
                  );
                })}
              </AlternativesList>
            </CardContent>
          </DeviceSelectionCard>

        </MainContent>
    </PageContainer>
  );
};

// Styled components (reusing from DownloadPage)
const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl}
    ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md}
      ${(props) => props.theme.spacing.sm};
  }
`;

const Header = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

const BackButton = styled(Button)`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${(props) => props.theme.spacing.xl};

  @media (max-width: ${(props) => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.lg};
`;

const ReleaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const MetadataRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  flex-wrap: wrap;
`;

const ReleasedDate = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ProductTitle = styled.h1`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes["3xl"]};
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.text};
`;

const VersionText = styled.h2`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes.xl};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.primary};
  font-family: monospace;
`;

const ChannelBadge = styled.span`
  background-color: ${(props) => props.$color};
  color: white;
  padding: ${(props) => props.$small
    ? `${props.theme.spacing.xs} ${props.theme.spacing.sm}`
    : `${props.theme.spacing.xs} ${props.theme.spacing.sm}`};
  border-radius: ${(props) => props.theme.radii.full};
  font-size: ${(props) => props.$small ? props.theme.fontSizes.xs : props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  text-transform: uppercase;
  align-self: flex-start;
`;

const DownloadButton = styled(Button)`
  white-space: nowrap;
`;

const DescriptionCard = styled(Card)`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const Description = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

const InstallationCard = styled(Card)``;

const InstructionsList = styled.ol`
  margin: 0;
  padding-left: ${(props) => props.theme.spacing.lg};
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.8;

  li {
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }

  code {
    background-color: ${(props) => props.theme.colors.background};
    padding: ${(props) => props.theme.spacing.xs}
      ${(props) => props.theme.spacing.sm};
    border-radius: ${(props) => props.theme.radii.sm};
    font-family: monospace;
    font-size: ${(props) => props.theme.fontSizes.sm};
  }
`;

const DeviceSelectionCard = styled(Card)``;

const DeviceCount = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textMuted};
  font-weight: ${(props) => props.theme.fontWeights.normal};
`;

const SelectionNote = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: ${(props) => props.theme.fontSizes.sm};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  padding: ${(props) => props.theme.spacing.md};
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radii.md};
  border-left: 3px solid ${(props) => props.theme.colors.primary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${(props) => props.theme.spacing.md};
  margin-bottom: ${(props) => props.theme.spacing.lg};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  background-color: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.sm};
  transition: border-color ${(props) => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.textMuted};
  }
`;

const DeviceOption = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing.md};
  border: 2px solid ${(props) => props.$isHighlighted ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  margin-bottom: ${(props) => props.theme.spacing.md};
  cursor: pointer;
  transition: all ${(props) => props.theme.transitions.fast};
  background-color: ${(props) => props.$isHighlighted
    ? `${props.theme.colors.primary}10`
    : props.theme.colors.cardBackground};

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

const DeviceInfo = styled.div`
  flex: 1;
`;

const DeviceName = styled.div`
  font-size: ${(props) => props.theme.fontSizes.md};
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const DeviceDetails = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const DeviceDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const DeviceDetailLabel = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
`;

const DeviceDetailValue = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const AlternativesCard = styled(Card)``;

const AlternativeCount = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textMuted};
  font-weight: ${(props) => props.theme.fontWeights.normal};
`;

const DeviceOptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: ${(props) => props.theme.spacing.md};
  }
`;

const DeviceActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const ExpandIcon = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  transition: transform ${(props) => props.theme.transitions.fast};
  transform: ${(props) => props.$isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'};
  user-select: none;
`;

const DeviceExpandedContent = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  padding-top: ${(props) => props.theme.spacing.md};
  border-top: 1px solid ${(props) => props.theme.colors.border};
`;

const ExpandedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const ExpandedTitle = styled.h4`
  font-size: ${(props) => props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text};
  margin: 0 0 ${(props) => props.theme.spacing.sm} 0;
`;

const ExpandedItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

const ExpandedLabel = styled.div`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ExpandedValue = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  word-break: break-all;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

const AlternativesContainer = styled.div`
  position: relative;
`;

const AlternativesList = styled.div`
  max-height: none;
  overflow: visible;
  position: relative;
`;

const AlternativesHeader = styled.h4`
  font-size: ${(props) => props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${(props) => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: ${(props) => props.theme.spacing.lg} 0 ${(props) => props.theme.spacing.md} 0;
`;

const AlternativeHeaderCell = styled.div`
  width: ${(props) => props.width};
  padding: 0 ${(props) => props.theme.spacing.sm};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    width: ${(props) => props.mobileWidth};
  }

  &.hide-mobile {
    @media (max-width: ${(props) => props.theme.breakpoints.md}) {
      display: none;
    }
  }
`;

const AlternativeRow = styled.div`
  display: flex;
  padding: ${(props) => props.theme.spacing.md} 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  transition: background-color ${(props) => props.theme.transitions.fast};

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

const AlternativeCell = styled.div`
  width: ${(props) => props.width};
  padding: 0 ${(props) => props.theme.spacing.sm};
  display: flex;
  align-items: center;

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    width: ${(props) => props.mobileWidth};
  }

  &.hide-mobile {
    @media (max-width: ${(props) => props.theme.breakpoints.md}) {
      display: none;
    }
  }
`;

const AlternativeMainInfo = styled.div`
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.text};
  font-size: ${(props) => props.theme.fontSizes.sm};
`;

const AlternativeDate = styled.div`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const AlternativeChannelContainer = styled.div`
  display: flex;
  align-items: center;
`;

const AlternativeChannelBadge = styled.span`
  background-color: ${(props) => props.$color};
  color: white;
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.full};
  font-size: ${(props) => props.theme.fontSizes.xs};
  text-transform: uppercase;
`;

const AlternativeChannelDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  display: none;

  &.show-mobile {
    @media (max-width: ${(props) => props.theme.breakpoints.md}) {
      display: block;
    }
  }

  &.hide-mobile {
    @media (max-width: ${(props) => props.theme.breakpoints.md}) {
      display: none;
    }
  }
`;

const AlternativeDownloadButton = styled(Button)`
  font-size: ${(props) => props.theme.fontSizes.xs};
`;


const DetailsCard = styled(Card)``;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const DetailItem = styled.div``;

const DetailLabel = styled.div`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  text-transform: uppercase;
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const DetailValue = styled.div`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.text};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  word-break: break-word;
`;

const VerificationCard = styled(Card)``;

const UrlSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

const UrlValue = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  word-break: break-all;
  cursor: pointer;
  position: relative;
  color: ${(props) => props.theme.colors.textSecondary};

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

const HashSection = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.md};
`;

const HashValue = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  word-break: break-all;
  cursor: pointer;
  position: relative;
  color: ${(props) => props.theme.colors.textSecondary};

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

const CopyIcon = styled.span`
  margin-left: ${(props) => props.theme.spacing.sm};
  opacity: 0.6;
`;

const VerifyInstructions = styled.p`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  margin: ${(props) => props.theme.spacing.md} 0;
`;

const CommandSection = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
`;

const CommandCode = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

const DeveloperCard = styled(Card)``;

const RawEventSection = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
`;

const RawEventText = styled.pre`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  overflow-x: auto;
`;

const ErrorCard = styled(Card)`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
`;

export default OSDownloadPage;