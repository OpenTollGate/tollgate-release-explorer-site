import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';

import { theme } from './styles/theme';
import { VIEW_MODES, DEFAULT_FILTERS, PRODUCT_CATEGORIES, getProductsByCategory } from './constants';
import NostrReleaseProvider from './contexts/NostrReleaseContext';
import Background from './components/common/Background';
import Header from './components/layout/Header';
import TabSelector from './components/common/TabSelector';
import FilterBar from './components/filters/FilterBar';
import ReleaseExplorer from './components/releases/ReleaseExplorer';
import OSDownloadPage from './components/download/OSDownloadPage';
import PackageDownloadPage from './components/download/PackageDownloadPage';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [activeCategory, setActiveCategory] = useState(PRODUCT_CATEGORIES.PACKAGES);

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
    
    // Parse devices
    const devices = searchParams.get('devices');
    if (devices) {
      urlFilters.devices = devices.split(',').filter(Boolean);
    }
    
    // Parse view mode
    const urlViewMode = searchParams.get('view');
    if (urlViewMode && Object.values(VIEW_MODES).includes(urlViewMode)) {
      setViewMode(urlViewMode);
    }
    
    // Parse category
    const urlCategory = searchParams.get('category');
    if (urlCategory && Object.values(PRODUCT_CATEGORIES).includes(urlCategory)) {
      setActiveCategory(urlCategory);
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
    
    if (newFilters.devices.length > 0) {
      newSearchParams.set('devices', newFilters.devices.join(','));
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

  // Update URL when category changes
  const handleCategoryChange = useCallback((newCategory) => {
    setActiveCategory(newCategory);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    
    if (newCategory !== PRODUCT_CATEGORIES.PACKAGES) {
      newSearchParams.set('category', newCategory);
    } else {
      newSearchParams.delete('category');
    }
    
    setSearchParams(newSearchParams);
  }, [searchParams, setSearchParams]);

  // Get filtered products based on active category
  const categoryProducts = getProductsByCategory(activeCategory);
  const categoryFilters = {
    ...filters,
    products: categoryProducts
  };

  return (
    <ThemeProvider theme={theme}>
      <NostrReleaseProvider>
        <AppContainer>
          <Background />
          <Header />
          
          <Routes>
            <Route
              path="/"
              element={
                <MainContent>
                  <TabSelector
                    activeTab={activeCategory}
                    onTabChange={handleCategoryChange}
                    tabs={[
                      { value: PRODUCT_CATEGORIES.PACKAGES, label: 'Packages' },
                      { value: PRODUCT_CATEGORIES.OS, label: 'OS Images' }
                    ]}
                    viewMode={viewMode}
                    onViewModeChange={handleViewModeChange}
                  />
                  <FilterBar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    activeCategory={activeCategory}
                  />
                  <ReleaseExplorer
                    viewMode={viewMode}
                    filters={categoryFilters}
                  />
                </MainContent>
              }
            />
            <Route
              path="/os/:releaseId"
              element={<OSDownloadPage />}
            />
            <Route
              path="/package/:releaseId"
              element={<PackageDownloadPage />}
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