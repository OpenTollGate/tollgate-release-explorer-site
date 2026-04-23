import React, { useState, useMemo } from "react";
import styled from "styled-components";
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
  getReleaseOpenWrtVersion,
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

  // Available OpenWrt versions across the cohort (sorted newest first).
  const availableOpenWrtVersions = useMemo(() => {
    const versions = new Set();
    for (const r of allReleases) {
      const v = getReleaseOpenWrtVersion(r);
      if (v && v !== "Unknown") versions.add(v);
    }
    return Array.from(versions).sort((a, b) => compareSemver(b, a));
  }, [allReleases]);

  // Default the filter to whichever OpenWrt version the user landed on,
  // falling back to the newest available.
  const initialOpenWrtVersion = release
    ? getReleaseOpenWrtVersion(release) !== "Unknown"
      ? getReleaseOpenWrtVersion(release)
      : availableOpenWrtVersions[0] || ""
    : "";
  const [openwrtVersionFilter, setOpenwrtVersionFilter] = useState(
    initialOpenWrtVersion
  );

  // Group devices, then drop variants that don't match the selected
  // OpenWrt version (and drop devices that end up empty).
  const groupedDevices = useMemo(() => {
    const grouped = groupReleasesByDevice(allReleases);
    if (!openwrtVersionFilter) return grouped;
    return grouped
      .map((group) => ({
        ...group,
        compressionVariants: group.compressionVariants.filter(
          (v) => getReleaseOpenWrtVersion(v.release) === openwrtVersionFilter
        ),
      }))
      .filter((group) => group.compressionVariants.length > 0);
  }, [allReleases, openwrtVersionFilter]);

  // Counts per version for the chip badges.
  const versionCounts = useMemo(() => {
    const counts = {};
    for (const r of allReleases) {
      const v = getReleaseOpenWrtVersion(r);
      if (v && v !== "Unknown") counts[v] = (counts[v] || 0) + 1;
    }
    return counts;
  }, [allReleases]);

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
  const selectedFilename = selectedUrl
    ? selectedUrl.split("/").pop()
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

        {availableOpenWrtVersions.length > 1 && (
          <OpenWrtVersionBar>
            <OpenWrtVersionLabel>OpenWrt version</OpenWrtVersionLabel>
            <OpenWrtVersionGroup role="radiogroup" aria-label="OpenWrt version">
              {availableOpenWrtVersions.map((v) => {
                const count = versionCounts[v] || 0;
                const active = openwrtVersionFilter === v;
                return (
                  <OpenWrtVersionToggle
                    key={v}
                    role="radio"
                    aria-checked={active}
                    $active={active}
                    onClick={() => {
                      setOpenwrtVersionFilter(v);
                      // Clear selection if it doesn't fit the new filter.
                      if (
                        selectedRelease &&
                        getReleaseOpenWrtVersion(selectedRelease) !== v
                      ) {
                        setSelectedRelease(null);
                      }
                    }}
                  >
                    <VersionMain>
                      OpenWrt {v}
                      <VersionCount>{count}</VersionCount>
                    </VersionMain>
                  </OpenWrtVersionToggle>
                );
              })}
            </OpenWrtVersionGroup>
          </OpenWrtVersionBar>
        )}

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

// Lexicographic-by-numeric-segments compare so "25.12.2" > "24.10.4".
function compareSemver(a, b) {
  const parse = (s) => s.split(/[^0-9]+/).map((x) => parseInt(x, 10) || 0);
  const sa = parse(a);
  const sb = parse(b);
  for (let i = 0; i < Math.max(sa.length, sb.length); i += 1) {
    const da = sa[i] || 0;
    const db = sb[i] || 0;
    if (da !== db) return da - db;
  }
  return 0;
}

// --- styles -----------------------------------------------------------------

const OpenWrtVersionBar = styled.div`
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

const OpenWrtVersionLabel = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.textSecondary};
`;

const OpenWrtVersionGroup = styled.div`
  display: inline-flex;
  gap: ${(props) => props.theme.spacing.xs};
`;

const OpenWrtVersionToggle = styled.button`
  display: inline-flex;
  align-items: center;
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
  cursor: pointer;
  transition: all ${(props) => props.theme.transitions.fast};

  &:hover {
    ${(props) =>
      !props.$active &&
      `border-color: ${props.theme.colors.borderLight};`}
  }
`;

const VersionMain = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
  font-weight: ${(props) => props.theme.fontWeights.medium};
`;

const VersionCount = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  opacity: 0.75;
`;

export default OSDownloadPage;
