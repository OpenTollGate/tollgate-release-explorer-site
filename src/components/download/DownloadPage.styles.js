import styled from "styled-components";
import Button from "../common/Button";
import Card from "../common/Card";

// Page Layout
export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xl}
    ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    padding: ${(props) => props.theme.spacing.md}
      ${(props) => props.theme.spacing.sm};
  }
`;

export const Header = styled.div`
  margin-bottom: ${(props) => props.theme.spacing.xl};
`;

export const BackButton = styled(Button)`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xl};
`;

// Release Header
export const ReleaseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${(props) => props.theme.spacing.lg};

  @media (max-width: ${(props) => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

export const MetadataRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.md};
  flex-wrap: wrap;
`;

export const ReleasedDate = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const ProductTitle = styled.h1`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes["3xl"]};
  font-weight: ${(props) => props.theme.fontWeights.bold};
  color: ${(props) => props.theme.colors.text};
`;

export const VersionText = styled.h2`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes.xl};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.primary};
  font-family: monospace;
`;

export const ChannelBadge = styled.span`
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

export const DownloadButton = styled(Button)`
  white-space: nowrap;
`;

// Description Card
export const DescriptionCard = styled(Card)`
  margin-bottom: ${(props) => props.theme.spacing.lg};
`;

export const Description = styled.p`
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

// Installation Card
export const InstallationCard = styled(Card)``;

export const InstructionsList = styled.ol`
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

// Variant Selection (Architecture/Device)
export const VariantSelectionCard = styled(Card)``;

export const VariantCount = styled.span`
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textMuted};
  font-weight: ${(props) => props.theme.fontWeights.normal};
`;

export const SearchInput = styled.input`
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

export const VariantsList = styled.div`
  max-height: none;
  overflow: visible;
  position: relative;
`;

export const VariantOption = styled.div`
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

export const VariantOptionHeader = styled.div`
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

export const VariantInfo = styled.div`
  flex: 1;
`;

export const VariantName = styled.div`
  font-size: ${(props) => props.theme.fontSizes.md};
  font-weight: ${(props) => props.theme.fontWeights.semibold};
  color: ${(props) => props.theme.colors.text};
  margin-bottom: ${(props) => props.theme.spacing.xs};
`;

export const VariantDetails = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

export const VariantDetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.xs};
`;

export const VariantDetailLabel = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
`;

export const VariantDetailValue = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const VariantActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
`;

export const ExpandIcon = styled.span`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  transition: transform ${(props) => props.theme.transitions.fast};
  user-select: none;
`;

// Expanded Content
export const VariantExpandedContent = styled.div`
  margin-top: ${(props) => props.theme.spacing.sm};
  padding-top: ${(props) => props.theme.spacing.sm};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
`;

// Row layout: small label on the left, value/action on the right. Collapses
// to a stacked block on narrow screens. Keeps the expanded panel scannable
// without the prior section-heading overhead.
export const ExpandedRow = styled.div`
  display: grid;
  grid-template-columns: 90px minmax(0, 1fr);
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};

  @media (max-width: ${(props) => props.theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const ExpandedRowLabel = styled.div`
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const ExpandedChipGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.theme.spacing.xs};
`;

export const ExpandedValue = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  word-break: break-all;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

export const CopyIcon = styled.span`
  margin-left: ${(props) => props.theme.spacing.sm};
  opacity: 0.6;
`;

export const CommandCode = styled.div`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  cursor: pointer;
  color: ${(props) => props.theme.colors.text};
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-width: 0;

  &:hover {
    background-color: ${(props) => props.theme.colors.cardBackgroundHover};
  }
`;

export const ExpandedFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${(props) => props.theme.spacing.xs};
`;

export const RawEventToggle = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textMuted};
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    color: ${(props) => props.theme.colors.textSecondary};
  }
`;

// Raw Event Section
export const RawEventSection = styled.div`
  margin-top: ${(props) => props.theme.spacing.md};
  max-height: 400px;
  overflow-y: auto;
`;

export const RawEventText = styled.pre`
  background-color: ${(props) => props.theme.colors.background};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  overflow-x: auto;
`;

// Error Card
export const ErrorCard = styled(Card)`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
`;