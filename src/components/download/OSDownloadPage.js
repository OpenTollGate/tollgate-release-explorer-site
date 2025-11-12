import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNostrReleases } from "../../contexts/NostrReleaseContext";
import { getChannelColor } from "../../styles/theme";
import {
  getReleaseVersion,
  getReleaseDateWithTime,
  getReleaseChannel,
  getReleaseDeviceId,
  getReleaseProductType,
  getProductDisplayName,
  findAlternativeReleases,
} from "../../utils/releaseUtils";
import Button from "../common/Button";
import { CardHeader, CardContent } from "../common/Card";
import VariantSelector from "./VariantSelector";
import {
  PageContainer,
  Header,
  BackButton,
  MainContent,
  ReleaseHeader,
  TitleSection,
  MetadataRow,
  ReleasedDate,
  ProductTitle,
  VersionText,
  ChannelBadge,
  DescriptionCard,
  Description,
  InstallationCard,
  InstructionsList,
  ErrorCard,
} from "./DownloadPage.styles";

const OSDownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();

  const release = releases.find((r) => r.id === releaseId);
  const alternativeReleases = release
    ? findAlternativeReleases(releases, release)
    : [];

  // Combine current release with alternatives for full device list
  const allDevices = release ? [release, ...alternativeReleases] : [];

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
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);

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

          <VariantSelector
            title="Available Devices"
            variants={allDevices}
            getVariantName={getReleaseDeviceId}
            searchPlaceholder="Search devices..."
            singularLabel="device"
            pluralLabel="devices"
          />

        </MainContent>
    </PageContainer>
  );
};

export default OSDownloadPage;