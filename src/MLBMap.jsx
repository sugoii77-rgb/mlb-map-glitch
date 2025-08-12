import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

// US states TopoJSON from jsDelivr (includes DC)
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

/** @typedef {{league:'AL'|'NL', division:'East'|'Central'|'West', team:string, city:string, state:string, lat:number, lon:number, country?:string}} Team */

/** @type {Team[]} */
const MLB_TEAMS = [
  // AL East
  { league: "AL", division: "East", team: "Boston Red Sox", city: "Boston", state: "Massachusetts", lat: 42.3601, lon: -71.0589 },
  { league: "AL", division: "East", team: "New York Yankees", city: "New York", state: "New York", lat: 40.7128, lon: -74.0060 },
  { league: "AL", division: "East", team: "Toronto Blue Jays", city: "Toronto", state: "Ontario", country: "Canada", lat: 43.6532, lon: -79.3832 },
  { league: "AL", division: "East", team: "Baltimore Orioles", city: "Baltimore", state: "Maryland", lat: 39.2904, lon: -76.6122 },
  { league: "AL", division: "East", team: "Tampa Bay Rays", city: "St. Petersburg", state: "Florida", lat: 27.7676, lon: -82.6403 },

  // AL Central
  { league: "AL", division: "Central", team: "Chicago White Sox", city: "Chicago", state: "Illinois", lat: 41.8781, lon: -87.6298 },
  { league: "AL", division: "Central", team: "Cleveland Guardians", city: "Cleveland", state: "Ohio", lat: 41.4993, lon: -81.6944 },
  { league: "AL", division: "Central", team: "Detroit Tigers", city: "Detroit", state: "Michigan", lat: 42.3314, lon: -83.0458 },
  { league: "AL", division: "Central", team: "Kansas City Royals", city: "Kansas City", state: "Missouri", lat: 39.0997, lon: -94.5786 },
  { league: "AL", division: "Central", team: "Minnesota Twins", city: "Minneapolis", state: "Minnesota", lat: 44.9778, lon: -93.2650 },

  // AL West
  { league: "AL", division: "West", team: "Houston Astros", city: "Houston", state: "Texas", lat: 29.7604, lon: -95.3698 },
  { league: "AL", division: "West", team: "Los Angeles Angels", city: "Anaheim", state: "California", lat: 33.8366, lon: -117.9143 },
  // Temporary home 2025–2027: West Sacramento (Sutter Health Park)
  { league: "AL", division: "West", team: "Athletics", city: "West Sacramento", state: "California", lat: 38.5805, lon: -121.5302 },
  { league: "AL", division: "West", team: "Seattle Mariners", city: "Seattle", state: "Washington", lat: 47.6062, lon: -122.3321 },
  { league: "AL", division: "West", team: "Texas Rangers", city: "Arlington", state: "Texas", lat: 32.7357, lon: -97.1081 },

  // NL East
  { league: "NL", division: "East", team: "Atlanta Braves", city: "Atlanta", state: "Georgia", lat: 33.7490, lon: -84.3880 },
  { league: "NL", division: "East", team: "Miami Marlins", city: "Miami", state: "Florida", lat: 25.7617, lon: -80.1918 },
  { league: "NL", division: "East", team: "New York Mets", city: "New York", state: "New York", lat: 40.7128, lon: -74.0060 },
  { league: "NL", division: "East", team: "Philadelphia Phillies", city: "Philadelphia", state: "Pennsylvania", lat: 39.9526, lon: -75.1652 },
  { league: "NL", division: "East", team: "Washington Nationals", city: "Washington", state: "District of Columbia", lat: 38.9072, lon: -77.0369 },

  // NL Central
  { league: "NL", division: "Central", team: "Chicago Cubs", city: "Chicago", state: "Illinois", lat: 41.8781, lon: -87.6298 },
  { league: "NL", division: "Central", team: "Cincinnati Reds", city: "Cincinnati", state: "Ohio", lat: 39.1031, lon: -84.5120 },
  { league: "NL", division: "Central", team: "Milwaukee Brewers", city: "Milwaukee", state: "Wisconsin", lat: 43.0389, lon: -87.9065 },
  { league: "NL", division: "Central", team: "Pittsburgh Pirates", city: "Pittsburgh", state: "Pennsylvania", lat: 40.4406, lon: -79.9959 },
  { league: "NL", division: "Central", team: "St. Louis Cardinals", city: "St. Louis", state: "Missouri", lat: 38.6270, lon: -90.1994 },

  // NL West
  { league: "NL", division: "West", team: "Arizona Diamondbacks", city: "Phoenix", state: "Arizona", lat: 33.4484, lon: -112.0740 },
  { league: "NL", division: "West", team: "Colorado Rockies", city: "Denver", state: "Colorado", lat: 39.7392, lon: -104.9903 },
  { league: "NL", division: "West", team: "Los Angeles Dodgers", city: "Los Angeles", state: "California", lat: 34.0522, lon: -118.2437 },
  { league: "NL", division: "West", team: "San Diego Padres", city: "San Diego", state: "California", lat: 32.7157, lon: -117.1611 },
  { league: "NL", division: "West", team: "San Francisco Giants", city: "San Francisco", state: "California", lat: 37.7749, lon: -122.4194 }
];

const CITY_KEY = t => `${t.city}, ${t.state}`;
const STATES_WITH_TEAMS = Array.from(new Set(MLB_TEAMS.filter(t => t.country !== "Canada").map(t => t.state))).sort();

export default function MLBMap() {
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCityKey, setSelectedCityKey] = useState(null);
  const [leagueFilter, setLeagueFilter] = useState("ALL"); // ALL | AL | NL
  const [query, setQuery] = useState("");

  const citiesInState = useMemo(() => {
    if (!selectedState) return [];
    const within = MLB_TEAMS.filter(t =>
      t.country !== "Canada" &&
      t.state === selectedState &&
      (leagueFilter === "ALL" || t.league === leagueFilter)
    );
    const unique = new Map();
    within.forEach(t => unique.set(CITY_KEY(t), { city: t.city, state: t.state }));
    return Array.from(unique.values()).sort((a, b) => a.city.localeCompare(b.city));
  }, [selectedState, leagueFilter]);

  const selectedCityTeams = useMemo(() => {
    if (!selectedCityKey) return [];
    return MLB_TEAMS.filter(t =>
      t.country !== "Canada" &&
      CITY_KEY(t) === selectedCityKey &&
      (leagueFilter === "ALL" || t.league === leagueFilter)
    );
  }, [selectedCityKey, leagueFilter]);

  const searchRows = useMemo(() => {
    const base = MLB_TEAMS.filter(t => t.country !== "Canada");
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(t =>
      t.team.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.state.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">MLB 주-도시-팀 인터랙티브 지도</h1>
        <div className="sub">주를 클릭하면 도시가 나오고, 도시를 클릭하면 팀이 나옵니다. 2025 시즌 기준, A’s는 West Sacramento 임시 홈.</div>
        <div className="row">
          <span className="small">리그:</span>
          {["ALL","AL","NL"].map(l => (
            <button key={l} className={`btn ${leagueFilter===l?"active":""}`} onClick={()=>{setLeagueFilter(l);}}>
              {l}
            </button>
          ))}
          <div style={{flex:1}} />
          <input className="input" placeholder="팀/도시/주 검색" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
      </header>

      <div className="grid">
        <div className="panel">
          <ComposableMap projection="geoAlbersUsa" style={{width:"100%", height:520}}>
            <Geographies geography={geoUrl}>
              {({ geographies }) => (
                <>
                  {geographies.map(geo => {
                    const stateName = geo.properties.name;
                    const hasTeam = STATES_WITH_TEAMS.includes(stateName);
                    const isSelected = selectedState === stateName;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => { setSelectedState(stateName); setSelectedCityKey(null); }}
                        style={{
                          default: { fill: isSelected ? "#111" : hasTeam ? "#c7d2fe" : "#e5e7eb", stroke:"#fff", strokeWidth:0.6, outline:"none" },
                          hover:   { fill: isSelected ? "#111" : hasTeam ? "#93c5fd" : "#d1d5db", outline:"none" },
                          pressed: { fill: "#111", outline:"none" }
                        }}
                      />
                    );
                  })}

                  {selectedState && MLB_TEAMS
                    .filter(t => t.country !== "Canada" && t.state === selectedState && (leagueFilter==="ALL" || t.league===leagueFilter))
                    .map(t => (
                      <Marker key={`${t.team}-${t.city}`} coordinates={[t.lon, t.lat]}>
                        <g
                          className="city-marker"
                          onClick={e => { e.stopPropagation(); setSelectedCityKey(CITY_KEY(t)); }}
                        >
                          <circle r={4} fill="#111827" />
                          <text textAnchor="start" x={6} y={4} style={{ fontSize: 10 }}>{t.city}</text>
                        </g>
                      </Marker>
                    ))}
                </>
              )}
            </Geographies>
          </ComposableMap>
        </div>

        <aside className="panel">
          <h3 style={{marginTop:0}}>상세 정보</h3>
          {!selectedState && <div>지도를 눌러 주를 선택하세요.</div>}

          {selectedState && (
            <>
              <div style={{marginBottom:8}}>선택한 주: <b>{selectedState}</b></div>
              {citiesInState.length > 0 ? (
                <>
                  <div className="hint">도시를 클릭하면 팀이 나옵니다.</div>
                  <div style={{marginTop:6}}>
                    {citiesInState.map(c => {
                      const key = `${c.city}, ${c.state}`;
                      const active = selectedCityKey === key;
                      return (
                        <span
                          key={key}
                          className={`badge ${active ? "active" : ""}`}
                          onClick={() => setSelectedCityKey(active ? null : key)}
                        >
                          {c.city}
                        </span>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="small">이 주에는 MLB 팀이 없습니다.</div>
              )}

              {selectedCityKey && (
                <div style={{marginTop:14}}>
                  <div style={{fontWeight:600, marginBottom:6}}>{selectedCityKey} 팀</div>
                  <ul style={{listStyle:"none", padding:0, margin:0}}>
                    {selectedCityTeams.map(t => (
                      <li key={t.team} style={{display:"flex", justifyContent:"space-between", border:"1px solid var(--line)", borderRadius:10, padding:"8px 10px", marginBottom:8}}>
                        <div>
                          <div style={{fontWeight:600}}>{t.team}</div>
                          <div className="small">{t.league} {t.division}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div style={{marginTop:16, paddingTop:12, borderTop:"1px solid var(--line)"}}>
            <div style={{fontWeight:600, marginBottom:6}}>빠른 검색 결과</div>
            <div className="list">
              <table className="table">
                <thead>
                  <tr>
                    <th>팀</th><th>도시</th><th>주</th><th>리그</th>
                  </tr>
                </thead>
                <tbody>
                  {searchRows.map(t => (
                    <tr key={`${t.team}-${t.city}`}>
                      <td>{t.team}</td>
                      <td>{t.city}</td>
                      <td>{t.state}</td>
                      <td>{t.league}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="footer">※ 캐나다 팀(토론토)은 지도 마커 대신 목록에서만 표시됩니다.</div>
          </div>
        </aside>
      </div>
    </div>
  );
}

