import React from 'react';
import styled from 'styled-components';
import { useNostrReleases } from '../../contexts/NostrReleaseContext';
import { VIEW_MODES } from '../../constants';
import { filterReleases, sortReleasesByDate, deduplicateReleases, countReleases } from '../../utils/releaseUtils';
import ReleaseGrid from './ReleaseGrid';
import ReleaseList from './ReleaseList';

const ReleaseExplorer = ({ viewMode, filters }) => {
  const { releases, loading, error } = useNostrReleases();

  // Filter, deduplicate if needed, and sort releases
  let filteredReleases = filterReleases(releases, filters);
  
  if (filters.deduplicate) {
    filteredReleases = deduplicateReleases(filteredReleases);
  }
  
  const sortedReleases = sortReleasesByDate(filteredReleases);

  if (loading) {
    return (
      <ExplorerContainer>
        <LoadingState>
          <LoadingSpinner />
          <LoadingText>Loading releases...</LoadingText>
        </LoadingState>
      </ExplorerContainer>
    );
  }

  if (error) {
    return (
      <ExplorerContainer>
        <ErrorState>
          <ErrorIcon>⚠️</ErrorIcon>
          <ErrorTitle>Unable to load releases</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorState>
      </ExplorerContainer>
    );
  }

  if (sortedReleases.length === 0) {
    return (
      <ExplorerContainer>
        <EmptyState>
          <EmptyIcon>📦</EmptyIcon>
          <EmptyTitle>No releases found</EmptyTitle>
          <EmptyMessage>
            {releases.length === 0 
              ? "No releases are available from this publisher."
              : "No releases match your current filters. Try adjusting your filter criteria."
            }
          </EmptyMessage>
        </EmptyState>
      </ExplorerContainer>
    );
  }

  return (
    <ExplorerContainer>
      <ResultsHeader>
        <ResultsText>
          Showing {sortedReleases.length} of {countReleases(releases).total} releases
        </ResultsText>
      </ResultsHeader>

      {viewMode === VIEW_MODES.GRID ? (
        <ReleaseGrid releases={sortedReleases} />
      ) : (
        <ReleaseList releases={sortedReleases} />
      )}
    </ExplorerContainer>
  );
};

const ExplorerContainer = styled.div`
  width: 100%;
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']} ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.lg};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${props => props.theme.colors.border};
  border-top: 3px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.lg};
  margin: 0;
`;

const ErrorState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']} ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.md};
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['4xl']};
`;

const ErrorTitle = styled.h3`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin: 0;
`;

const ErrorMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.md};
  margin: 0;
  max-width: 500px;
  line-height: 1.6;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${props => props.theme.spacing['3xl']} ${props => props.theme.spacing.lg};
  gap: ${props => props.theme.spacing.md};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: ${props => props.theme.fontSizes['4xl']};
`;

const EmptyTitle = styled.h3`
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  margin: 0;
`;

const EmptyMessage = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.md};
  margin: 0;
  max-width: 500px;
  line-height: 1.6;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const ResultsText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSizes.sm};
  margin: 0;
`;

export default ReleaseExplorer;