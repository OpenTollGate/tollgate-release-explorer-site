import React, { useState, useMemo } from "react";
import styled from "styled-components";
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
  getReleaseFilename,
  getReleaseFormat,
  findAlternativeReleases,
  groupReleasesByArchitecture,
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

const FORMAT_OPTIONS = [
  { key: "ipk", label: ".ipk", sub: "OpenWrt 24.x and older" },
  { key: "apk", label: ".apk", sub: "OpenWrt 25.x and newer" },
];

const PackageDownloadPage = () => {
  const { releaseId } = useParams();
  const navigate = useNavigate();
  const { releases } = useNostrReleases();
  // Selected variant fills in the install commands above. null = show
  // the generic [sha256-hash].ipk/apk placeholder.
  const [selectedRelease, setSelectedRelease] = useState(null);

  const release = releases.find((r) => r.id === releaseId);

  const allReleases = useMemo(() => {
    if (!release) return [];
    return [release, ...findAlternativeReleases(releases, release)];
  }, [release, releases]);

  // Counts for badge display
  const availableFormats = useMemo(() => {
    const counts = { ipk: 0, apk: 0 };
    for (const r of allReleases) {
      const fmt = getReleaseFormat(r);
      if (fmt in counts) counts[fmt] += 1;
    }
    return counts;
  }, [allReleases]);

  // Default format: the one the user landed on, or whichever has variants.
  const initialFormat = release
    ? getReleaseFormat(release) === "apk"
      ? "apk"
      : "ipk"
    : "ipk";
  const [formatFilter, setFormatFilter] = useState(initialFormat);

  // Group by architecture, then keep only variants matching the selected
  // format (and drop architectures that end up empty).
  const groupedArchitectures = useMemo(() => {
    const grouped = groupReleasesByArchitecture(allReleases);
    return grouped
      .map((group) => ({
        ...group,
        compressionVariants: group.compressionVariants.filter(
          (v) => getReleaseFormat(v.release) === formatFilter
        ),
      }))
      .filter((group) => group.compressionVariants.length > 0);
  }, [allReleases, formatFilter]);

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
  // activeFormat follows the toggle, but a picked variant wins (its
  // filename/url is what we're rendering).
  const activeFormat = selectedRelease
    ? getReleaseFormat(selectedRelease)
    : formatFilter;

  const placeholderFilename = `[sha256-hash].${activeFormat === "apk" ? "apk" : "ipk"}`;
  const selectedUrl = selectedRelease
    ? getReleaseDownloadUrl(selectedRelease)
    : null;
  const selectedFilename = selectedRelease
    ? (getReleaseFilename(selectedRelease) ?? placeholderFilename)
    : placeholderFilename;
  const selectedArchLabel = selectedRelease
    ? getReleaseArchitecture(selectedRelease)
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
              kind={activeFormat === "apk" ? "apk" : "ipk"}
              filename={selectedFilename}
              downloadUrl={selectedUrl}
              selectedLabel={selectedArchLabel}
              onClearSelection={() => setSelectedRelease(null)}
            />
          </CardContent>
        </InstallationCard>

        <FormatFilterBar>
          <FormatFilterLabel>Package format</FormatFilterLabel>
          <FormatFilterGroup role="radiogroup" aria-label="Package format">
            {FORMAT_OPTIONS.map((opt) => {
              const count = availableFormats[opt.key] || 0;
              const disabled = count === 0;
              return (
                <FormatToggle
                  key={opt.key}
                  role="radio"
                  aria-checked={formatFilter === opt.key}
                  $active={formatFilter === opt.key}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setFormatFilter(opt.key);
                    if (
                      selectedRelease &&
                      getReleaseFormat(selectedRelease) !== opt.key
                    ) {
                      setSelectedRelease(null);
                    }
                  }}
                  title={opt.sub}
                >
                  <FormatLabelMain>
                    {opt.label}
                    <FormatCount>{count}</FormatCount>
                  </FormatLabelMain>
                  <FormatSub>{opt.sub}</FormatSub>
                </FormatToggle>
              );
            })}
          </FormatFilterGroup>
        </FormatFilterBar>

        <VariantSelector
          title="Available Architectures"
          variants={groupedArchitectures}
          getVariantName={getReleaseArchitecture}
          searchPlaceholder="Search architectures..."
          singularLabel="architecture"
          pluralLabel="architectures"
          hasCompressionVariants={true}
          onSelect={setSelectedRelease}
          selectedReleaseId={selectedRelease?.id || null}
        />
      </MainContent>
    </PageContainer>
  );
};

// --- Styles -----------------------------------------------------------------

const FormatFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.lg};
  flex-wrap: wrap;
`;

const FormatFilterLabel = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const FormatFilterGroup = styled.div`
  display: inline-flex;
  gap: ${(props) => props.theme.spacing.xs};
`;

const FormatToggle = styled.button`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.md};
  font-size: ${(props) => props.theme.fontSizes.sm};
  border-radius: ${(props) => props.theme.radii.md};
  border: 1px solid
    ${(props) =>
      props.$active ? props.theme.colors.primary : props.theme.colors.border};
  background-color: ${(props) =>
    props.$active
      ? props.theme.colors.primary
      : props.theme.colors.cardBackground};
  color: ${(props) =>
    props.$active ? "white" : props.theme.colors.textSecondary};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.4 : 1)};
  transition: all ${(props) => props.theme.transitions.fast};
  text-align: left;

  &:hover {
    ${(props) =>
      !props.disabled &&
      !props.$active &&
      `border-color: ${props.theme.colors.borderLight};`}
  }
`;

const FormatLabelMain = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  font-weight: ${(props) => props.theme.fontWeights.medium};
`;

const FormatSub = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  opacity: 0.75;
`;

const FormatCount = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  opacity: 0.8;
`;

export default PackageDownloadPage;
