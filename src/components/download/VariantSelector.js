import React, { useState } from "react";
import { getChannelColor } from "../../styles/theme";
import {
  getReleaseDownloadUrl,
  getReleaseFileHash,
  getReleaseDateWithTime,
  getReleaseChannel,
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
 * @param {Array} props.variants - Array of release objects representing variants
 * @param {Function} props.getVariantName - Function to extract variant name from release
 * @param {string} props.searchPlaceholder - Placeholder text for search input
 * @param {string} props.singularLabel - Singular form of variant type (e.g., "architecture")
 * @param {string} props.pluralLabel - Plural form of variant type (e.g., "architectures")
 */
const VariantSelector = ({
  title,
  variants,
  getVariantName,
  searchPlaceholder,
  singularLabel,
  pluralLabel,
}) => {
  const [showRawEvent, setShowRawEvent] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter variants based on search
  const filteredVariants = variants.filter((variant) => {
    if (!searchQuery) return true;
    const variantName = getVariantName(variant).toLowerCase();
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
            const isExpanded = expandedVariant === variant.id;
            const downloadUrl = getReleaseDownloadUrl(variant);
            const fileHash = getReleaseFileHash(variant);
            const dateTime = getReleaseDateWithTime(variant);
            const channel = getReleaseChannel(variant);
            const variantName = getVariantName(variant);
            const filename = downloadUrl
              ? downloadUrl.split("/").pop()
              : "file";

            return (
              <VariantOption
                key={variant.id}
                $isHighlighted={isExpanded}
                $isExpanded={isExpanded}
                onClick={() => {
                  if (isExpanded) {
                    setExpandedVariant(null);
                  } else {
                    setExpandedVariant(variant.id);
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
                                id: variant.id,
                                pubkey: variant.pubkey,
                                created_at: variant.created_at,
                                kind: variant.kind,
                                tags: variant.tags,
                                content: variant.content,
                                sig: variant.sig,
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