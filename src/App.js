import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Parse filters from URL parameters
  const parseFiltersFromURL = useCallback(() => {
    const urlFilters = { ...DEFAULT_FILTERS };
    
    // Parse channels
    const channels = searchParams.get('channels');
    if (channels) {
      urlFilters.channels = channels.split(',').filter(Boolean);
    }
    
    // Parse products
    const products = searchParams.get('products');
    if (products) {
      urlFilters.products = products.split(',').filter(Boolean);
    }
    
    // Parse architectures
    const architectures = searchParams.get('architectures');
    if (architectures) {
      urlFilters.architectures = architectures.split(',').filter(Boolean);
    }
    
    // Parse devices
    const devices = searchParams.get('devices');
    if (devices) {
      urlFilters.devices = devices.split(',').filter(Boolean);
    }
    
    // Parse deduplicate
    const deduplicate = searchParams.get('deduplicate');
    if (deduplicate !== null) {
      urlFilters.deduplicate = deduplicate === 'true';
    }
    
    // Parse view mode
    const urlViewMode = searchParams.get('view');
    if (urlViewMode && Object.values(VIEW_MODES).includes(urlViewMode)) {
      setViewMode(urlViewMode);
    }
    
    return urlFilters;
  }, [searchParams]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters = parseFiltersFromURL();
    setFilters(urlFilters);
  }, [parseFiltersFromURL]);

  // Update URL when filters change
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams();
    
    // Add filters to URL
    if (newFilters.channels.length > 0) {
      newSearchParams.set('channels', newFilters.channels.join(','));
    }
    
    if (newFilters.products.length > 0) {
      newSearchParams.set('products', newFilters.products.join(','));
    }
    
    if (newFilters.architectures.length > 0) {
      newSearchParams.set('architectures', newFilters.architectures.join(','));
    }
    
    if (newFilters.devices.length > 0) {
      newSearchParams.set('devices', newFilters.devices.join(','));
    }
    
    if (newFilters.deduplicate) {
      newSearchParams.set('deduplicate', 'true');
    }
    
    // Add view mode to URL
    if (viewMode !== VIEW_MODES.GRID) {
      newSearchParams.set('view', viewMode);
    }
    
    setSearchParams(newSearchParams);
  }, [viewMode, setSearchParams]);

  // Update URL when view mode changes
  const handleViewModeChange = useCallback((newViewMode) => {
    setViewMode(newViewMode);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newViewMode !== VIEW_MODES.GRID) {
      newSearchParams.set('view', newViewMode);
    } else {
      newSearchParams.delete('view');
    }
    
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  return (
    <ThemeProvider theme={theme}>
      <NostrReleaseProvider>
        <AppContainer>
          <Background />
          <Header
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
          />
          
          <Routes>
            <Route 
              path="/" 
              element={
                <MainContent>
                  <FilterBar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
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
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    overflow-x: hidden;
    max-width: 100vw;
    box-sizing: border-box;
  }
`;

const MainContent = styled.main`
  padding: 0 ${props => props.theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 ${props => props.theme.spacing.md};
    overflow-x: hidden;
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
  }
`;

export default App;