import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleLinear } from 'd3-scale';
import Papa from 'papaparse';



const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';

const numericToISO2 = {
  '4': 'AF', '8': 'AL', '12': 'DZ', '16': 'AS', '20': 'AD', '24': 'AO',
  '28': 'AG', '31': 'AZ', '32': 'AR', '36': 'AU', '40': 'AT', '44': 'BS',
  '48': 'BH', '50': 'BD', '51': 'AM', '52': 'BB', '56': 'BE', '60': 'BM',
  '64': 'BT', '68': 'BO', '70': 'BA', '72': 'BW', '76': 'BR', '84': 'BZ',
  '90': 'SB', '92': 'VG', '96': 'BN', '100': 'BG', '104': 'MM', '108': 'BI',
  '112': 'BY', '116': 'KH', '120': 'CM', '124': 'CA', '132': 'CV', '140': 'CF',
  '144': 'LK', '148': 'TD', '152': 'CL', '156': 'CN', '158': 'TW', '170': 'CO',
  '174': 'KM', '178': 'CG', '180': 'CD', '184': 'CK', '188': 'CR', '191': 'HR',
  '192': 'CU', '196': 'CY', '203': 'CZ', '204': 'BJ', '208': 'DK', '212': 'DM',
  '214': 'DO', '218': 'EC', '222': 'SV', '226': 'GQ', '231': 'ET', '232': 'ER',
  '233': 'EE', '234': 'FO', '238': 'FK', '242': 'FJ', '246': 'FI', '250': 'FR',
  '254': 'GF', '258': 'PF', '262': 'DJ', '266': 'GA', '268': 'GE', '270': 'GM',
  '275': 'PS', '276': 'DE', '288': 'GH', '292': 'GI', '296': 'KI', '300': 'GR',
  '304': 'GL', '308': 'GD', '312': 'GP', '316': 'GU', '320': 'GT', '324': 'GN',
  '328': 'GY', '332': 'HT', '336': 'VA', '340': 'HN', '344': 'HK', '348': 'HU',
  '352': 'IS', '356': 'IN', '360': 'ID', '364': 'IR', '368': 'IQ', '372': 'IE',
  '376': 'IL', '380': 'IT', '384': 'CI', '388': 'JM', '392': 'JP', '398': 'KZ',
  '400': 'JO', '404': 'KE', '408': 'KP', '410': 'KR', '414': 'KW', '417': 'KG',
  '418': 'LA', '422': 'LB', '426': 'LS', '428': 'LV', '430': 'LR', '434': 'LY',
  '438': 'LI', '440': 'LT', '442': 'LU', '446': 'MO', '450': 'MG', '454': 'MW',
  '458': 'MY', '462': 'MV', '466': 'ML', '470': 'MT', '474': 'MQ', '478': 'MR',
  '480': 'MU', '484': 'MX', '492': 'MC', '496': 'MN', '498': 'MD', '499': 'ME',
  '500': 'MS', '504': 'MA', '508': 'MZ', '512': 'OM', '516': 'NA', '520': 'NR',
  '524': 'NP', '528': 'NL', '531': 'CW', '533': 'AW', '540': 'NC', '548': 'VU',
  '554': 'NZ', '558': 'NI', '562': 'NE', '566': 'NG', '570': 'NU', '574': 'NF',
  '578': 'NO', '580': 'MP', '583': 'FM', '584': 'MH', '585': 'PW', '586': 'PK',
  '591': 'PA', '598': 'PG', '600': 'PY', '604': 'PE', '608': 'PH', '612': 'PN',
  '616': 'PL', '620': 'PT', '624': 'GW', '626': 'TL', '630': 'PR', '634': 'QA',
  '638': 'RE', '642': 'RO', '643': 'RU', '646': 'RW', '652': 'BL', '654': 'SH',
  '659': 'KN', '660': 'AI', '662': 'LC', '663': 'MF', '666': 'PM', '670': 'VC',
  '674': 'SM', '678': 'ST', '682': 'SA', '686': 'SN', '688': 'RS', '690': 'SC',
  '694': 'SL', '702': 'SG', '703': 'SK', '704': 'VN', '705': 'SI', '706': 'SO',
  '710': 'ZA', '716': 'ZW', '724': 'ES', '728': 'SS', '729': 'SD', '732': 'EH',
  '740': 'SR', '744': 'SJ', '748': 'SZ', '752': 'SE', '756': 'CH', '760': 'SY',
  '762': 'TJ', '764': 'TH', '768': 'TG', '772': 'TK', '776': 'TO', '780': 'TT',
  '784': 'AE', '788': 'TN', '792': 'TR', '795': 'TM', '796': 'TC', '798': 'TV',
  '800': 'UG', '804': 'UA', '807': 'MK', '818': 'EG', '826': 'GB', '831': 'GG',
  '832': 'JE', '833': 'IM', '834': 'TZ', '840': 'US', '850': 'VI', '854': 'BF',
  '858': 'UY', '860': 'UZ', '862': 'VE', '876': 'WF', '882': 'WS', '887': 'YE',
  '894': 'ZM', '-99': 'XK'
};

const isoToName = {
  'US': 'United States', 'GB': 'United Kingdom', 'FR': 'France', 'DE': 'Germany',
  'IT': 'Italy', 'ES': 'Spain', 'JP': 'Japan', 'CN': 'China', 'KR': 'South Korea',
  'IN': 'India', 'CA': 'Canada', 'AU': 'Australia', 'BR': 'Brazil', 'MX': 'Mexico',
  'RU': 'Russia', 'NL': 'Netherlands', 'SE': 'Sweden', 'DK': 'Denmark', 'NO': 'Norway',
  'FI': 'Finland', 'PL': 'Poland', 'BE': 'Belgium', 'CH': 'Switzerland', 'AT': 'Austria',
  'IE': 'Ireland', 'NZ': 'New Zealand', 'AR': 'Argentina', 'HK': 'Hong Kong',
  'TW': 'Taiwan', 'TH': 'Thailand', 'SG': 'Singapore', 'ZA': 'South Africa',
  'EG': 'Egypt', 'IL': 'Israel', 'TR': 'Turkey', 'GR': 'Greece', 'CZ': 'Czech Republic',
  'HU': 'Hungary', 'RO': 'Romania', 'PT': 'Portugal', 'IR': 'Iran', 'IQ': 'Iraq',
  'SA': 'Saudi Arabia', 'AE': 'United Arab Emirates', 'PK': 'Pakistan', 'BD': 'Bangladesh',
  'ID': 'Indonesia', 'MY': 'Malaysia', 'PH': 'Philippines', 'VN': 'Vietnam',
  'NG': 'Nigeria', 'KE': 'Kenya', 'MA': 'Morocco', 'DZ': 'Algeria', 'TN': 'Tunisia',
  'CO': 'Colombia', 'PE': 'Peru', 'VE': 'Venezuela', 'CL': 'Chile', 'CU': 'Cuba',
  'KP': 'North Korea', 'UA': 'Ukraine', 'BY': 'Belarus', 'KZ': 'Kazakhstan',
  'LU': 'Luxembourg', 'CY': 'Cyprus', 'MT': 'Malta', 'IS': 'Iceland', 'HR': 'Croatia',
  'RS': 'Serbia', 'SI': 'Slovenia', 'SK': 'Slovakia', 'BG': 'Bulgaria', 'LT': 'Lithuania',
  'LV': 'Latvia', 'EE': 'Estonia', 'GE': 'Georgia', 'AM': 'Armenia', 'AZ': 'Azerbaijan'
};

const FilmIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="upload-icon">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
    <line x1="17" y1="7" x2="22" y2="7" />
    <line x1="17" y1="17" x2="22" y2="17" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const getCountryISO = (geo) => {
  const props = geo.properties || {};

  if (props.iso2cd) return props.iso2cd;
  if (props.ISO_A2) return props.ISO_A2;
  if (props.iso_a2) return props.iso_a2;

  if (geo.id) {
    const numericId = String(parseInt(geo.id, 10));
    if (numericToISO2[numericId]) {
      return numericToISO2[numericId];
    }
  }

  return null;
};

const getCountryName = (geo) => {
  const props = geo.properties || {};

  if (props.nam_en) return props.nam_en;
  if (props.name) return props.name;
  if (props.NAME) return props.NAME;
  if (props.ADMIN) return props.ADMIN;

  const isoCode = getCountryISO(geo);
  if (isoCode && isoToName[isoCode]) {
    return isoToName[isoCode];
  }

  return 'Unknown';
};

function App() {
  const [step, setStep] = useState('upload');
  const [movies, setMovies] = useState([]);
  const [countryData, setCountryData] = useState({});
  const [moviesByCountry, setMoviesByCountry] = useState({});
  const [tooltip, setTooltip] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0, currentMovie: '' });
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState([0, 0]);
  const [dragOver, setDragOver] = useState(false);




  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // TMDB API token
  const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN;

  // Color scale based on movie count
  const maxCount = Math.max(...Object.values(countryData), 1);
  const colorScale = scaleLinear()
    .domain([0, maxCount])
    .range(['#1a2029', '#00e054']);

  // TMDB API helper
  const tmdbFetch = async (endpoint, signal) => {
    if (!TMDB_TOKEN) {
      throw new Error('TMDB Token is missing. Please check your .env file.');
    }
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TMDB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      signal
    });
    if (!response.ok) throw new Error('TMDB API request failed');
    return response.json();
  };

  const handleFileUpload = useCallback(async (file) => {
    if (!file) return;

    setError(null);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const movieList = results.data.filter(row => row.Name && row.Year);
        setMovies(movieList);
        setStep('loading');
        setLoadingProgress({ current: 0, total: movieList.length, currentMovie: '' });

        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController();

        const countryCount = {};
        const moviesByCountryTemp = {};

        // Process in batches to avoid rate limiting
        const batchSize = 5;
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        for (let i = 0; i < movieList.length; i += batchSize) {
          if (abortControllerRef.current?.signal.aborted) break;

          const batch = movieList.slice(i, i + batchSize);

          await Promise.all(batch.map(async (movie) => {
            try {
              setLoadingProgress(prev => ({ ...prev, currentMovie: movie.Name }));

              const searchQuery = encodeURIComponent(movie.Name);
              const searchData = await tmdbFetch(
                `/search/movie?query=${searchQuery}&year=${movie.Year}`,
                abortControllerRef.current?.signal
              );

              if (searchData.results && searchData.results.length > 0) {
                const movieId = searchData.results[0].id;
                const detailsData = await tmdbFetch(
                  `/movie/${movieId}`,
                  abortControllerRef.current?.signal
                );

                if (detailsData.production_countries && detailsData.production_countries.length > 0) {
                  detailsData.production_countries.forEach(country => {
                    const code = country.iso_3166_1;
                    if (code) {
                      countryCount[code] = (countryCount[code] || 0) + 1;

                      if (!moviesByCountryTemp[code]) {
                        moviesByCountryTemp[code] = [];
                      }

                      const movieInfo = {
                        title: movie.Name,
                        year: movie.Year,
                        uri: movie['Letterboxd URI'],
                        poster: detailsData.poster_path
                          ? `${TMDB_IMAGE_BASE}${detailsData.poster_path}`
                          : null,
                        tmdbId: movieId
                      };

                      if (!moviesByCountryTemp[code].find(m => m.title === movieInfo.title && m.year === movieInfo.year)) {
                        moviesByCountryTemp[code].push(movieInfo);
                      }
                    }
                  });
                }
              }
            } catch (err) {
              if (err.name !== 'AbortError') {
                console.error(`Error fetching data for ${movie.Name}:`, err);
              }
            }
          }));

          setLoadingProgress(prev => ({
            ...prev,
            current: Math.min(i + batchSize, movieList.length)
          }));

          if (i + batchSize < movieList.length) {
            await delay(250);
          }
        }

        console.log('Country data collected:', countryCount);

        setCountryData(countryCount);
        setMoviesByCountry(moviesByCountryTemp);
        setStep('map');
      },
      error: (err) => {
        setError(`Error parsing CSV: ${err.message}`);
      }
    });
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      handleFileUpload(file);
    } else {
      setError('Please upload a valid CSV file');
    }
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleReset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStep('upload');
    setMovies([]);
    setCountryData({});
    setMoviesByCountry({});
    setSelectedCountry(null);
    setError(null);
    setZoom(1);
    setCenter([0, 20]);
  }, []);

  const handleCountryClick = useCallback((geo) => {
    const countryCode = getCountryISO(geo);
    const countryName = getCountryName(geo);

    if (countryCode && countryData[countryCode]) {
      setSelectedCountry({
        code: countryCode,
        name: countryName,
        movies: moviesByCountry[countryCode] || []
      });
    }
  }, [countryData, moviesByCountry]);

  const handleMouseEnter = useCallback((geo, evt) => {
    const countryCode = getCountryISO(geo);
    const countryName = getCountryName(geo);
    const count = countryCode ? (countryData[countryCode] || 0) : 0;

    setTooltip({
      x: evt.clientX,
      y: evt.clientY,
      country: countryName,
      count
    });
  }, [countryData]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleMouseMove = useCallback((evt) => {
    if (tooltip) {
      setTooltip(prev => ({
        ...prev,
        x: evt.clientX,
        y: evt.clientY
      }));
    }
  }, [tooltip]);

  const totalMovies = movies.length;
  const totalCountries = Object.keys(countryData).length;
  const topCountry = Object.entries(countryData).sort((a, b) => b[1] - a[1])[0];

  return (
    <>
      <header className="header">
        <div className="logo">
          <div className="logo-icon">
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
            <div className="logo-dot"></div>
          </div>
          <div className="logo-text">
            Movie <span>Mapper</span>
          </div>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
        >
          <GitHubIcon />
          <span>View on GitHub</span>
        </a>
      </header>

      <main className="main-container">
        {step === 'upload' && (
          <section className="upload-section">
            <h1 className="upload-title">Map your movies</h1>
            <p className="upload-subtitle">
              Upload your Letterboxd data to visualize which countries your watched movies come from.
              See the world through cinema.
            </p>

            <div
              className={`upload-dropzone ${dragOver ? 'dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <FilmIcon />
              <p className="upload-text">Drop your watched.csv file here</p>
              <p className="upload-hint">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="upload-input"
                onChange={(e) => handleFileUpload(e.target.files[0])}
              />
            </div>

            <p className="upload-help">
              Export your data from{' '}
              <a href="https://letterboxd.com/settings/data/" target="_blank" rel="noopener noreferrer">
                Letterboxd Settings → Import & Export
              </a>
              <br />
              Your watched.csv file can be found in the zip archive
            </p>

            {error && <div className="error-message">{error}</div>}
          </section>
        )}

        {step === 'loading' && (
          <section className="loading-section">
            <div className="loading-spinner"></div>
            <p className="loading-text">Fetching movie data from TMDB...</p>
            <p className="loading-progress">
              {loadingProgress.current} of {loadingProgress.total} movies processed
            </p>
            {loadingProgress.currentMovie && (
              <p className="loading-current">"{loadingProgress.currentMovie}" </p>
            )}
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
              />
            </div>
            <button className="reset-btn" onClick={handleReset}>
              Cancel
            </button>
          </section>
        )}

        {step === 'map' && (
          <section className="map-section">
            <div className="stats-bar">
              <div className="stat-item">
                <div className="stat-value">{totalMovies}</div>
                <div className="stat-label">Movies Watched</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{totalCountries}</div>
                <div className="stat-label">Countries</div>
              </div>
              {topCountry && (
                <div className="stat-item">
                  <div className="stat-value">{isoToName[topCountry[0]] || topCountry[0]}</div>
                  <div className="stat-label">Top Country ({topCountry[1]} films)</div>
                </div>
              )}
            </div>

            <div className="map-container">
              <div className="map-wrapper">
                <ComposableMap
                  projection="geoMercator"
                  projectionConfig={{
                    scale: 100,
                    center: [0, 0],
                    rotate: [-11, 0, 0] // Shift cut line to ~169°W to avoid cutting Aleutian Islands
                  }}
                  preserveAspectRatio="xMidYMid slice"
                  style={{ width: '100%', height: '100%' }}
                >
                  <ZoomableGroup
                    zoom={zoom}
                    center={center}
                    translateExtent={[
                      [-400, -200],
                      [1200, 800]
                    ]}
                    onMoveEnd={({ coordinates, zoom: z }) => {
                      setCenter(coordinates);
                      setZoom(z);
                    }}
                  >
                    <Geographies geography={GEO_URL}>
                      {({ geographies }) =>
                        geographies
                          .map((geo) => {
                            const countryCode = getCountryISO(geo);
                            const count = countryCode ? (countryData[countryCode] || 0) : 0;
                            const hasMovies = count > 0;

                            return (
                              <Geography
                                key={geo.rsmKey}
                                geography={geo}
                                fill={hasMovies ? colorScale(count) : '#1a2029'}
                                stroke="#2c3440"
                                strokeWidth={0.5}
                                style={{
                                  default: {
                                    outline: 'none',
                                    transition: 'fill 0.2s ease'
                                  },
                                  hover: {
                                    fill: hasMovies ? '#40bcf4' : '#242c34',
                                    outline: 'none',
                                    cursor: hasMovies ? 'pointer' : 'default'
                                  },
                                  pressed: {
                                    fill: hasMovies ? '#00e054' : '#242c34',
                                    outline: 'none'
                                  }
                                }}
                                onClick={() => handleCountryClick(geo)}
                                onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                                onMouseLeave={handleMouseLeave}
                                onMouseMove={handleMouseMove}
                              />
                            );
                          })
                      }
                    </Geographies>
                  </ZoomableGroup>
                </ComposableMap>
              </div>

              <div className="map-controls">
                <button
                  className="map-control-btn"
                  onClick={() => setZoom(z => Math.min(z * 1.5, 8))}
                >
                  +
                </button>
                <button
                  className="map-control-btn"
                  onClick={() => setZoom(z => Math.max(z / 1.5, 1))}
                >
                  −
                </button>
                <button
                  className="map-control-btn"
                  onClick={() => { setZoom(1); setCenter([0, 20]); }}
                >
                  ⌂
                </button>
              </div>

              <div className="legend">
                <span className="legend-label">0 films</span>
                <div className="legend-gradient"></div>
                <span className="legend-label">{maxCount} films</span>
              </div>
            </div>

            <button className="reset-btn" onClick={handleReset}>
              <span>↩</span> Upload New Data
            </button>
          </section>
        )}
      </main>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="tooltip"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15
          }}
        >
          <div className="tooltip-country">{tooltip.country}</div>
          <div className="tooltip-count">
            {tooltip.count > 0 ? `${tooltip.count} film${tooltip.count > 1 ? 's' : ''} watched` : 'No films watched'}
          </div>
          {tooltip.count > 0 && (
            <div className="tooltip-hint">Click to see films</div>
          )}
        </div>
      )}

      {/* Country Modal */}
      {selectedCountry && (
        <div className="modal-overlay" onClick={() => setSelectedCountry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selectedCountry.name}</div>
                <div className="modal-subtitle">
                  {selectedCountry.movies.length} film{selectedCountry.movies.length > 1 ? 's' : ''} watched
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCountry(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="movie-grid">
                {selectedCountry.movies
                  .sort((a, b) => b.year - a.year)
                  .map((movie, idx) => (
                    <a
                      key={`${movie.title}-${movie.year}-${idx}`}
                      href={movie.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="movie-card"
                    >
                      <div className="movie-poster">
                        {movie.poster ? (
                          <img src={movie.poster} alt={movie.title} loading="lazy" />
                        ) : (
                          <div className="movie-poster-placeholder">🎬</div>
                        )}
                      </div>
                      <div className="movie-info">
                        <div className="movie-title">{movie.title}</div>
                        <div className="movie-year">{movie.year}</div>
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer">
        <p className="footer-text">
          Made with ♥ by Naomi • Data from{' '}
          <a href="https://letterboxd.com" target="_blank" rel="noopener noreferrer">Letterboxd</a>
          {' '}and{' '}
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer">TMDB</a>
          {' '}• Map data from{' '}
          <a href="https://github.com/topojson/world-atlas" target="_blank" rel="noopener noreferrer">World Atlas</a>
        </p>
      </footer>
    </>
  );
}

export default App;
