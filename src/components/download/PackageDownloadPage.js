import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useNostrReleases } from "../../contexts/NostrReleaseContext";
import { getChannelColor } from "../../styles/theme";
import {
  getReleaseVersion,
  getReleaseDateWithTime,
  getReleaseChannel,
  getReleaseArchitecture,
  getReleaseProductType,
  getProductDisplayName,
  getReleaseDownloadUrl,
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

const PackageDownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();

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
  const dateTime = getReleaseDateWithTime(release);
  const channel = getReleaseChannel(release);
  const productType = getReleaseProductType(release);
  const productName = getProductDisplayName(productType);
  const downloadUrl = getReleaseDownloadUrl(release);

  // Extract filename from download URL
  const filename = downloadUrl
    ? downloadUrl.split("/").pop()
    : "package.ipk";

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

          <VariantSelector
            title="Available Architectures"
            variants={allArchitectures}
            getVariantName={getReleaseArchitecture}
            searchPlaceholder="Search architectures..."
            singularLabel="architecture"
            pluralLabel="architectures"
          />
        </MainContent>
    </PageContainer>
  );
};

export default PackageDownloadPage;
