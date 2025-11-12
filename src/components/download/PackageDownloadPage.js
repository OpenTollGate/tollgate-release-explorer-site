import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useNostrReleases } from "../../contexts/NostrReleaseContext";
import { getChannelColor } from "../../styles/theme";
import {
  getReleaseVersion,
  getReleaseDate,
  getReleaseChannel,
  getReleaseArchitecture,
  getReleaseProductType,
  getProductDisplayName,
  getReleaseDownloadUrl,
  getReleaseFileHash,
  getReleaseMimeType,
  findAlternativeReleases,
} from "../../utils/releaseUtils";
import Button from "../common/Button";
import Card, { CardHeader, CardContent } from "../common/Card";

const PackageDownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [showAllArchitectures, setShowAllArchitectures] = useState(true);
  const [expandedArchitecture, setExpandedArchitecture] = useState(releaseId);

  const release = releases.find((r) => r.id === releaseId);
  const alternativeReleases = release
    ? findAlternativeReleases(releases, release)
    : [];
  
  // Combine current release with alternatives for full architecture list
  const allArchitectures = release ? [release, ...alternativeReleases] : [];

  if (!release) {
    return (
      <PageContainer>
        <ErrorCard>
          <CardHeader>
            <h2>Package Not Found</h2>
          </CardHeader>
          <CardContent>
            <p>The requested package could not be found.</p>
            <Button onClick={() => navigate("/")}>Back to Explorer</Button>
          </CardContent>
        </ErrorCard>
      </PageContainer>
    );
  }

  const version = getReleaseVersion(release);
  const date = getReleaseDate(release);
  const channel = getReleaseChannel(release);
  const architecture = getReleaseArchitecture(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);
  const fileHash = getReleaseFileHash(release);
  const mimeType = getReleaseMimeType(release);

  // Extract filename from download URL
  const filename = downloadUrl
    ? downloadUrl.split("/").pop()
    : "package.ipk";

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
              <ReleasedDate>Released: {date}</ReleasedDate>
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
                <li>Download the package file (.ipk) to your computer</li>
                <li>Connect to your router via SSH</li>
                <li>Upload the package file to the router</li>
                <li>
                  Run: <code>opkg install {filename}</code>
                </li>
                <li>Configure the service as needed</li>
              </InstructionsList>
            </CardContent>
          </InstallationCard>

          <ArchitectureSelectionCard>
            <CardHeader>
              <h3>Available Architectures</h3>
              <ArchitectureCount>
                {allArchitectures.length} {allArchitectures.length === 1 ? "architecture" : "architectures"}
              </ArchitectureCount>
            </CardHeader>
            <CardContent>
              <SelectionNote>
                Choose the correct architecture for your device. Click to expand for download details.
              </SelectionNote>
              
              <ArchitecturesList>
                {allArchitectures.map((archRelease) => {
                  const isExpanded = expandedArchitecture === archRelease.id;
                  const isCurrentArch = archRelease.id === releaseId;
                  const archDownloadUrl = getReleaseDownloadUrl(archRelease);
                  const archFileHash = getReleaseFileHash(archRelease);
                  const archDate = getReleaseDate(archRelease);
                  const archChannel = getReleaseChannel(archRelease);
                  const archName = getReleaseArchitecture(archRelease);
                  const archFilename = archDownloadUrl ? archDownloadUrl.split("/").pop() : "package.ipk";
                  
                  return (
                    <ArchitectureOption
                      key={archRelease.id}
                      $isHighlighted={isCurrentArch}
                      $isExpanded={isExpanded}
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedArchitecture(null);
                        } else {
                          setExpandedArchitecture(archRelease.id);
                        }
                      }}
                    >
                      <ArchitectureOptionHeader>
                        <ArchitectureInfo>
                          <ArchitectureName>{archName}</ArchitectureName>
                          <ArchitectureDetails>
                            <ArchitectureDetailItem>
                              <ArchitectureDetailLabel>Released:</ArchitectureDetailLabel>
                              <ArchitectureDetailValue>{archDate}</ArchitectureDetailValue>
                            </ArchitectureDetailItem>
                            <ArchitectureDetailItem>
                              <ChannelBadge $color={getChannelColor(archChannel)} $small>
                                {archChannel}
                              </ChannelBadge>
                            </ArchitectureDetailItem>
                          </ArchitectureDetails>
                        </ArchitectureInfo>
                        <ArchitectureActions>
                          <DownloadButton
                            variant={isCurrentArch ? "primary" : "outline"}
                            size="sm"
                            disabled={!archDownloadUrl}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (archDownloadUrl) window.open(archDownloadUrl, "_blank");
                            }}
                          >
                            Download
                          </DownloadButton>
                          <ExpandIcon $isExpanded={isExpanded}>
                            {isExpanded ? "▼" : "▶"}
                          </ExpandIcon>
                        </ArchitectureActions>
                      </ArchitectureOptionHeader>

                      {isExpanded && (archDownloadUrl || archFileHash) && (
                        <ArchitectureExpandedContent>
                          <ExpandedSection>
                            <ExpandedTitle>Download & Verification</ExpandedTitle>
                            
                            {archDownloadUrl && (
                              <ExpandedItem>
                                <ExpandedLabel>Download URL (Blossom)</ExpandedLabel>
                                <ExpandedValue onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(archDownloadUrl);
                                }}>
                                  {archDownloadUrl}
                                  <CopyIcon>📋</CopyIcon>
                                </ExpandedValue>
                              </ExpandedItem>
                            )}
                            
                            {archFileHash && (
                              <>
                                <ExpandedItem>
                                  <ExpandedLabel>SHA-256 Hash</ExpandedLabel>
                                  <ExpandedValue onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(archFileHash);
                                  }}>
                                    {archFileHash}
                                    <CopyIcon>📋</CopyIcon>
                                  </ExpandedValue>
                                </ExpandedItem>
                                
                                <VerifyInstructions>
                                  Verify file integrity after downloading:
                                </VerifyInstructions>
                                <CommandCode onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(`shasum -a 256 ${archFilename}`);
                                }}>
                                  shasum -a 256 {archFilename}
                                  <CopyIcon>📋</CopyIcon>
                                </CommandCode>
                              </>
                            )}
                          </ExpandedSection>
                          
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
                                      id: archRelease.id,
                                      pubkey: archRelease.pubkey,
                                      created_at: archRelease.created_at,
                                      kind: archRelease.kind,
                                      tags: archRelease.tags,
                                      content: archRelease.content,
                                      sig: archRelease.sig,
                                    },
                                    null,
                                    2,
                                  )}
                                </RawEventText>
                              </RawEventSection>
                            )}
                          </ExpandedSection>
                        </ArchitectureExpandedContent>
                      )}
                    </ArchitectureOption>
                  );
                })}
              </ArchitecturesList>
            </CardContent>
          </ArchitectureSelectionCard>
        </MainContent>
    </PageContainer>
  );
};

// Styled components (same as OSDownloadPage)
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

const ArchitectureSelectionCard = styled(Card)``;

const ArchitectureCount = styled.span`
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

const ArchitecturesList = styled.div`
  max-height: none;
  overflow: visible;
  position: relative;
`;

const ArchitectureOption = styled.div`
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

const ArchitectureOptionHeader = styled.div`
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

const ArchitectureInfo = styled.div`
  flex: 1;
`;

const ArchitectureName = styled.div`
  font-size: ${(props) => props.theme.fontSizes.md};
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

const ArchitectureDetails = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const ArchitectureDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

const ArchitectureDetailLabel = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
`;

const ArchitectureDetailValue = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const ArchitectureActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

const ExpandIcon = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  transition: transform ${(props) => props.theme.transitions.fast};
  user-select: none;
`;

const ArchitectureExpandedContent = styled.div`
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
const ShowMoreButton = styled(Button)`
  margin-top: ${(props) => props.theme.spacing.md};
  width: 100%;
`;

const FadeOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(
    to bottom,
    transparent,
    ${(props) => props.theme.colors.cardBackground}
  );
  pointer-events: none;
`;






export default PackageDownloadPage;
const CopyIcon = styled.span`
  margin-left: ${(props) => props.theme.spacing.sm};
  opacity: 0.6;
`;

const VerifyInstructions = styled.p`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  margin: ${(props) => props.theme.spacing.sm} 0;
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
