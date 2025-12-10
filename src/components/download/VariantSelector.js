import React, { useState } from "react";
import { getChannelColor } from "../../styles/theme";
import {
  getReleaseDownloadUrl,
  getReleaseFileHash,
  getReleaseDateWithTime,
  getReleaseChannel,
  getReleaseCompression,
} from "../../utils/releaseUtils";
import Button from "../common/Button";
import { CardHeader, CardContent } from "../common/Card";
import {
  VariantSelectionCard,
  VariantCount,
  SearchInput,
  VariantsList,
  VariantOption,
  VariantOptionHeader,
  VariantInfo,
  VariantName,
  VariantDetails,
  VariantDetailItem,
  VariantDetailLabel,
  VariantDetailValue,
  VariantActions,
  DownloadButton,
  ExpandIcon,
  VariantExpandedContent,
  ExpandedSection,
  ExpandedTitle,
  ExpandedItem,
  ExpandedLabel,
  ExpandedValue,
  CopyIcon,
  VerifyInstructions,
  CommandCode,
  RawEventSection,
  RawEventText,
  ChannelBadge,
} from "./DownloadPage.styles";

/**
 * VariantSelector - A reusable component for selecting and displaying variants
 * (architectures or devices) of a release
 *
 * @param {Object} props
 * @param {string} props.title - Title for the card (e.g., "Available Architectures")
 * @param {Array} props.variants - Array of release objects or architecture groups
 * @param {Function} props.getVariantName - Function to extract variant name from release
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.singularLabel - Singular form of variant type (e.g., "architecture")
 * @param {string} props.pluralLabel - Plural form of variant type (e.g., "architectures")
 * @param {boolean} props.hasCompressionVariants - Whether variants have compression options
 */
const VariantSelector = ({
  title,
  variants,
  getVariantName,
  searchPlaceholder,
  singularLabel,
  pluralLabel,
  hasCompressionVariants = false,
}) => {
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [selectedCompression, setSelectedCompression] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Filter variants based on search
  const filteredVariants = variants.filter((variant) => {
    if (!searchQuery) return true;
    const variantName = hasCompressionVariants
      ? variant.architecture.toLowerCase()
      : getVariantName(variant).toLowerCase();
    return variantName.includes(searchQuery.toLowerCase());
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <VariantSelectionCard>
      <CardHeader>
        <h3>{title}</h3>
        <VariantCount>
          {filteredVariants.length} of {variants.length}{" "}
          {variants.length === 1 ? singularLabel : pluralLabel}
        </VariantCount>
      </CardHeader>
      <CardContent>
        <SearchInput
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <VariantsList>
          {filteredVariants.map((variant) => {
            // Handle both grouped (with compression variants) and ungrouped variants
            const variantId = hasCompressionVariants ? variant.architecture : variant.id;
            const isExpanded = expandedVariant === variantId;
            
            // For compression variants, get the selected compression or default to 'none'
            const selectedComp = hasCompressionVariants
              ? (selectedCompression[variantId] || 'none')
              : null;
            
            // Get the actual release object
            const release = hasCompressionVariants
              ? variant.compressionVariants.find(cv => cv.compression === selectedComp)?.release
              : variant;
            
            const downloadUrl = getReleaseDownloadUrl(release);
            const fileHash = getReleaseFileHash(release);
            const dateTime = getReleaseDateWithTime(release);
            const channel = getReleaseChannel(release);
            const variantName = hasCompressionVariants ? variant.architecture : getVariantName(variant);
            const filename = downloadUrl
              ? downloadUrl.split("/").pop()
              : "file";

            return (
              <VariantOption
                key={variantId}
                $isHighlighted={isExpanded}
                $isExpanded={isExpanded}
                onClick={() => {
                  if (isExpanded) {
                    setExpandedVariant(null);
                  } else {
                    setExpandedVariant(variantId);
                    // Initialize compression selection if not set
                    if (hasCompressionVariants && !selectedCompression[variantId]) {
                      setSelectedCompression(prev => ({
                        ...prev,
                        [variantId]: 'none'
                      }));
                    }
                  }
                }}
              >
                <VariantOptionHeader>
                  <VariantInfo>
                    <VariantName>{variantName}</VariantName>
                    <VariantDetails>
                      <VariantDetailItem>
                        <VariantDetailLabel>Released:</VariantDetailLabel>
                        <VariantDetailValue>{dateTime}</VariantDetailValue>
                      </VariantDetailItem>
                      <VariantDetailItem>
                        <ChannelBadge
                          $color={getChannelColor(channel)}
                          $small
                        >
                          {channel}
                        </ChannelBadge>
                      </VariantDetailItem>
                    </VariantDetails>
                  </VariantInfo>
                  <VariantActions>
                    <DownloadButton
                      variant={isExpanded ? "primary" : "outline"}
                      size="sm"
                      disabled={!downloadUrl}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (downloadUrl) window.open(downloadUrl, "_blank");
                      }}
                    >
                      Download
                    </DownloadButton>
                    <ExpandIcon $isExpanded={isExpanded}>
                      {isExpanded ? "▼" : "▶"}
                    </ExpandIcon>
                  </VariantActions>
                </VariantOptionHeader>

                {isExpanded && (
                  <VariantExpandedContent>
                    {hasCompressionVariants && variant.compressionVariants.length > 1 && (
                      <ExpandedSection>
                        <ExpandedTitle>Compression Type</ExpandedTitle>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                          {variant.compressionVariants.map(({ compression }) => (
                            <Button
                              key={compression}
                              variant={selectedComp === compression ? 'primary' : 'outline'}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompression(prev => ({
                                  ...prev,
                                  [variantId]: compression
                                }));
                              }}
                            >
                              {compression}
                            </Button>
                          ))}
                        </div>
                      </ExpandedSection>
                    )}
                    
                    {(downloadUrl || fileHash) && (
                      <ExpandedSection>
                        <ExpandedTitle>Download & Verification</ExpandedTitle>

                        {downloadUrl && (
                          <ExpandedItem>
                            <ExpandedLabel>Download URL (Blossom)</ExpandedLabel>
                            <ExpandedValue
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(downloadUrl);
                              }}
                            >
                              {downloadUrl}
                              <CopyIcon>📋</CopyIcon>
                            </ExpandedValue>
                          </ExpandedItem>
                        )}

                        {fileHash && (
                          <>
                            <ExpandedItem>
                              <ExpandedLabel>SHA-256 Hash</ExpandedLabel>
                              <ExpandedValue
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(fileHash);
                                }}
                              >
                                {fileHash}
                                <CopyIcon>📋</CopyIcon>
                              </ExpandedValue>
                            </ExpandedItem>

                            <VerifyInstructions>
                              Verify file integrity after downloading:
                            </VerifyInstructions>
                            <CommandCode
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(`shasum -a 256 ${filename}`);
                              }}
                            >
                              shasum -a 256 {filename}
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
                                id: release.id,
                                pubkey: release.pubkey,
                                created_at: release.created_at,
                                kind: release.kind,
                                tags: release.tags,
                                content: release.content,
                                sig: release.sig,
                              },
                              null,
                              2
                            )}
                          </RawEventText>
                        </RawEventSection>
                      )}
                    </ExpandedSection>
                  </VariantExpandedContent>
                )}
              </VariantOption>
            );
          })}
        </VariantsList>
      </CardContent>
    </VariantSelectionCard>
  );
};

export default VariantSelector;