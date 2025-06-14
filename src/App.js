import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

import { theme } from './styles/theme';
import { VIEW_MODES, DEFAULT_FILTERS } from './constants';
import NostrReleaseProvider from './contexts/NostrReleaseContext';
import Background from './components/common/Background';
import Header from './components/layout/Header';
import FilterBar from './components/filters/FilterBar';
import ReleaseExplorer from './components/releases/ReleaseExplorer';
import DownloadPage from './components/download/DownloadPage';

const App = () => {
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  return (
    <ThemeProvider theme={theme}>
      <NostrReleaseProvider>
        <AppContainer>
          <Background />
          <Header 
            viewMode={viewMode} 
            onViewModeChange={setViewMode}
          />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <MainContent>
                  <FilterBar 
                    filters={filters}
                    onFiltersChange={setFilters}
                  />
                  <ReleaseExplorer 
                    viewMode={viewMode}
                    filters={filters}
                  />
                </MainContent>
              } 
            />
            <Route 
              path="/download/:releaseId" 
              element={<DownloadPage />} 
            />
          </Routes>
        </AppContainer>
      </NostrReleaseProvider>
    </ThemeProvider>
  );
};

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  position: relative;
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
`;

const MainContent = styled.main`
  padding: 0 ${props => props.theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 ${props => props.theme.spacing.md};
  }
`;

export default App;