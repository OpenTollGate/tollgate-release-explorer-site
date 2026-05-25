import React, { useState, useMemo } from "react";
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
  getReleaseDownloadUrl,
  getReleaseFilename,
  findAlternativeReleases,
  groupReleasesByDevice,
} from "../../utils/releaseUtils";
import Button from "../common/Button";
import { CardHeader, CardContent } from "../common/Card";
import VariantSelector from "./VariantSelector";
import InstallationPanel from "./InstallationPanel";
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
  InstallationCard,
  ErrorCard,
} from "./DownloadPage.styles";

const OSDownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();
  // Picked variant below fills in the install commands above.
  const [selectedRelease, setSelectedRelease] = useState(null);

  const release = releases.find((r) => r.id === releaseId);

  const allReleases = useMemo(() => {
    if (!release) return [];
    return [release, ...findAlternativeReleases(releases, release)];
  }, [release, releases]);

  // One card per (device, OpenWrt version) — see groupReleasesByDevice.
  const groupedDevices = useMemo(
    () => groupReleasesByDevice(allReleases),
    [allReleases]
  );

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

  const selectedUrl = selectedRelease
    ? getReleaseDownloadUrl(selectedRelease)
    : null;
  const selectedFilename = selectedRelease
    ? (getReleaseFilename(selectedRelease) ?? "[sha256-hash].bin")
    : "[sha256-hash].bin";
  const selectedDeviceLabel = selectedRelease
    ? getReleaseDeviceId(selectedRelease)
    : null;

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

        <InstallationCard>
          <CardHeader>
            <h3>Installation Instructions</h3>
          </CardHeader>
          <CardContent>
            <InstallationPanel
              kind="firmware"
              filename={selectedFilename}
              downloadUrl={selectedUrl}
              selectedLabel={selectedDeviceLabel}
              onClearSelection={() => setSelectedRelease(null)}
            />
          </CardContent>
        </InstallationCard>

        <VariantSelector
          title="Available Devices"
          variants={groupedDevices}
          getVariantName={getReleaseDeviceId}
          searchPlaceholder="Search devices..."
          singularLabel="device"
          pluralLabel="devices"
          hasCompressionVariants={true}
          onSelect={setSelectedRelease}
          selectedReleaseId={selectedRelease?.id || null}
        />
      </MainContent>
    </PageContainer>
  );
};

export default OSDownloadPage;
