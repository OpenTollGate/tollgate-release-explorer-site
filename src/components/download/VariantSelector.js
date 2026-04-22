import { useState } from "react";
import {
  getReleaseDownloadUrl,
  getReleaseFileHash,
  getReleaseDateWithTime,
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
  ExpandedRow,
  ExpandedRowLabel,
  ExpandedChipGroup,
  ExpandedValue,
  CopyIcon,
  CommandCode,
  ExpandedFooter,
  RawEventToggle,
  RawEventSection,
  RawEventText,
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
  onSelect = null,
  selectedReleaseId = null,
}) => {
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [selectedCompression, setSelectedCompression] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Filter variants based on search
  const filteredVariants = variants.filter((variant) => {
    if (!searchQuery) return true;
    const variantName = hasCompressionVariants
      ? (variant.architecture || variant.deviceId || '').toLowerCase()
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
            const variantId = hasCompressionVariants
              ? (variant.architecture || variant.deviceId)
              : variant.id;
            const isExpanded = expandedVariant === variantId;
            
            // For compression variants, get the selected compression or default to 'none'
            const selectedComp = hasCompressionVariants
              ? (selectedCompression[variantId] || 'none')
              : null;
            
            // Get the actual release object
            let release;
            if (hasCompressionVariants) {
              // Try to find the selected compression variant
              const selectedVariant = variant.compressionVariants.find(cv => cv.compression === selectedComp);
              // Fallback to first variant if selected not found
              release = selectedVariant?.release || variant.compressionVariants[0]?.release;
            } else {
              release = variant;
            }
            
            // Safety check: skip if release is still undefined
            if (!release) {
              console.warn('No release found for variant:', variant);
              return null;
            }
            
            const downloadUrl = getReleaseDownloadUrl(release);
            const fileHash = getReleaseFileHash(release);
            const dateTime = getReleaseDateWithTime(release);
            const variantName = hasCompressionVariants
              ? (variant.architecture || variant.deviceId)
              : getVariantName(variant);
            const filename = downloadUrl
              ? downloadUrl.split("/").pop()
              : "file";

            return (
              <VariantOption
                key={variantId || variant.id || `variant-${Math.random()}`}
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
                    </VariantDetails>
                  </VariantInfo>
                  <VariantActions>
                    {onSelect && (
                      <Button
                        variant={selectedReleaseId === release.id ? "primary" : "outline"}
                        size="sm"
                        title={selectedReleaseId === release.id
                          ? "Currently filling the install commands above"
                          : "Fill in the install commands above with this variant"}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(release);
                        }}
                      >
                        {selectedReleaseId === release.id
                          ? "✓ In install ↑"
                          : "Fill install ↑"}
                      </Button>
                    )}
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
                    {hasCompressionVariants && variant.compressionVariants && variant.compressionVariants.length > 0 && (
                      <ExpandedRow>
                        <ExpandedRowLabel>Compression</ExpandedRowLabel>
                        <ExpandedChipGroup>
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
                        </ExpandedChipGroup>
                      </ExpandedRow>
                    )}

                    {downloadUrl && (
                      <ExpandedRow>
                        <ExpandedRowLabel>URL</ExpandedRowLabel>
                        <ExpandedValue
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(downloadUrl);
                          }}
                        >
                          {downloadUrl}
                          <CopyIcon>📋</CopyIcon>
                        </ExpandedValue>
                      </ExpandedRow>
                    )}

                    {fileHash && (
                      <ExpandedRow>
                        <ExpandedRowLabel>Verify</ExpandedRowLabel>
                        <CommandCode
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(`shasum -a 256 ${filename}`);
                          }}
                        >
                          shasum -a 256 {filename}
                          <CopyIcon>📋</CopyIcon>
                        </CommandCode>
                      </ExpandedRow>
                    )}

                    <ExpandedFooter>
                      <RawEventToggle
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowRawEvent(!showRawEvent);
                        }}
                      >
                        {showRawEvent ? "Hide" : "Show"} raw event
                      </RawEventToggle>
                    </ExpandedFooter>
                    {showRawEvent && (
                      <RawEventSection onClick={(e) => e.stopPropagation()}>
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