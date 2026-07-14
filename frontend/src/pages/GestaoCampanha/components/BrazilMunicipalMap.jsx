import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "../GestaoCampanha.module.css";

const legend = [
  { label: "0 Equipes", tone: "empty" },
  { label: "Baixo numero de equipes", tone: "low" },
  { label: "Medio numero de equipes", tone: "medium" },
  { label: "Bom numero de equipes", tone: "good" },
  { label: "Alto numero de equipes", tone: "high" },
];

const states = [
  { id: "state-ac", group: "Estados", label: "Acre", statePrefixes: ["12"] },
  { id: "state-al", group: "Estados", label: "Alagoas", statePrefixes: ["27"] },
  { id: "state-ap", group: "Estados", label: "Amapa", statePrefixes: ["16"] },
  { id: "state-am", group: "Estados", label: "Amazonas", statePrefixes: ["13"] },
  { id: "state-ba", group: "Estados", label: "Bahia", statePrefixes: ["29"] },
  { id: "state-ce", group: "Estados", label: "Ceara", statePrefixes: ["23"] },
  { id: "state-df", group: "Estados", label: "Distrito Federal", statePrefixes: ["53"] },
  { id: "state-es", group: "Estados", label: "Espirito Santo", statePrefixes: ["32"] },
  { id: "state-go", group: "Estados", label: "Goias", statePrefixes: ["52"] },
  { id: "state-ma", group: "Estados", label: "Maranhao", statePrefixes: ["21"] },
  { id: "state-mt", group: "Estados", label: "Mato Grosso", statePrefixes: ["51"] },
  { id: "state-ms", group: "Estados", label: "Mato Grosso do Sul", statePrefixes: ["50"] },
  { id: "state-mg", group: "Estados", label: "Minas Gerais", statePrefixes: ["31"] },
  { id: "state-pa", group: "Estados", label: "Para", statePrefixes: ["15"] },
  { id: "state-pb", group: "Estados", label: "Paraiba", statePrefixes: ["25"] },
  { id: "state-pr", group: "Estados", label: "Parana", statePrefixes: ["41"] },
  { id: "state-pe", group: "Estados", label: "Pernambuco", statePrefixes: ["26"] },
  { id: "state-pi", group: "Estados", label: "Piaui", statePrefixes: ["22"] },
  { id: "state-rj", group: "Estados", label: "Rio de Janeiro", statePrefixes: ["33"] },
  { id: "state-rn", group: "Estados", label: "Rio Grande do Norte", statePrefixes: ["24"] },
  { id: "state-rs", group: "Estados", label: "Rio Grande do Sul", statePrefixes: ["43"] },
  { id: "state-ro", group: "Estados", label: "Rondonia", statePrefixes: ["11"] },
  { id: "state-rr", group: "Estados", label: "Roraima", statePrefixes: ["14"] },
  { id: "state-sc", group: "Estados", label: "Santa Catarina", statePrefixes: ["42"] },
  { id: "state-sp", group: "Estados", label: "Sao Paulo", statePrefixes: ["35"] },
  { id: "state-se", group: "Estados", label: "Sergipe", statePrefixes: ["28"] },
  { id: "state-to", group: "Estados", label: "Tocantins", statePrefixes: ["17"] },
];

const MAX_ZOOM = 10;
const REGION_FOCUS_MAX_ZOOM = 6;
const ZOOM_BUTTON_STEP = 0.5;
const ZOOM_WHEEL_STEP = 0.35;
const POPULATED_TONES = [
  "low",
  "low",
  "medium",
  "medium",
  "medium",
  "good",
  "good",
  "high",
];

function BrazilMunicipalMap({
  municipalityStats = [],
  onRegionChange,
  regions = [],
  selectedRegionId = null,
}) {
  const [municipalities, setMunicipalities] = useState([]);
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 });
  const [drag, setDrag] = useState(null);
  const mapStageRef = useRef(null);
  const rafRef = useRef(null);
  const pendingDeltaRef = useRef({ scale: 0, x: 0, y: 0 });
  const selectableRegions = useMemo(() => [...states, ...regions], [regions]);
  const selectedRegion = selectableRegions.find((item) => item.id === selectedRegionId);
  const selectedRegionMatcher = useMemo(
    () => createRegionMatcher(selectedRegion),
    [selectedRegion],
  );
  const isStateSelection = selectedRegion?.group === "Estados";
  const municipalityToneMap = useMemo(
    () =>
      new Map(
        municipalityStats.map((item) => [item.city_ibge_code, item.tone ?? "empty"]),
      ),
    [municipalityStats],
  );
  const regionGroups = useMemo(
    () => groupRegions(selectableRegions),
    [selectableRegions],
  );
  const focusedView = useMemo(
    () => getRegionView(municipalities, selectedRegion),
    [municipalities, selectedRegion],
  );
  const activeView = focusedView
    ? getFocusedTransform(focusedView, view)
    : view;

  useEffect(() => {
    let isActive = true;

    async function loadMap() {
      let response = await fetch(`${import.meta.env.BASE_URL}data/br-municipios.geojson`);

      if (!response.ok) {
        response = await fetch(`${import.meta.env.BASE_URL}data/sp-municipios.geojson`);
      }

      const geoJson = await response.json();

      if (isActive) {
        setMunicipalities(buildMunicipalPaths(geoJson));
      }
    }

    loadMap();

    return () => {
      isActive = false;
    };
  }, []);

  const scheduleViewDelta = useCallback((delta) => {
    pendingDeltaRef.current = {
      scale: pendingDeltaRef.current.scale + (delta.scale ?? 0),
      x: pendingDeltaRef.current.x + (delta.x ?? 0),
      y: pendingDeltaRef.current.y + (delta.y ?? 0),
    };

    if (rafRef.current) {
      return;
    }

    rafRef.current = window.requestAnimationFrame(() => {
      const pendingDelta = pendingDeltaRef.current;
      pendingDeltaRef.current = { scale: 0, x: 0, y: 0 };
      rafRef.current = null;

      setView((current) => {
        const scale = clamp(
          Number((current.scale + pendingDelta.scale).toFixed(2)),
          1,
          MAX_ZOOM,
        );

        return {
          scale,
          x: scale === 1 ? 0 : current.x + pendingDelta.x,
          y: scale === 1 ? 0 : current.y + pendingDelta.y,
        };
      });
    });
  }, []);

  const zoomBy = useCallback(
    (step) => {
      scheduleViewDelta({ scale: step });
    },
    [scheduleViewDelta],
  );

  useEffect(
    () => () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    const element = mapStageRef.current;

    if (!element) {
      return undefined;
    }

    function handleNativeWheel(event) {
      if (event.target.closest("select, option")) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      zoomBy(event.deltaY > 0 ? -ZOOM_WHEEL_STEP : ZOOM_WHEEL_STEP);
    }

    element.addEventListener("wheel", handleNativeWheel, { passive: false });

    return () => {
      element.removeEventListener("wheel", handleNativeWheel);
    };
  }, [zoomBy]);

  function resetZoom() {
    setView({ scale: 1, x: 0, y: 0 });
  }

  function handlePointerDown(event) {
    if (activeView.scale === 1) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: event.clientX, y: event.clientY });
  }

  function handlePointerMove(event) {
    if (!drag) {
      return;
    }

    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;

    scheduleViewDelta({ x: dx, y: dy });
    setDrag({ x: event.clientX, y: event.clientY });
  }

  function handlePointerUp() {
    setDrag(null);
  }

  function handleRegionChange(event) {
    setView({ scale: 1, x: 0, y: 0 });
    onRegionChange?.(event.target.value || null);
  }

  return (
    <div className={styles.mapStage} ref={mapStageRef}>
      <div className={styles.mapControls} aria-label="Controles de zoom do mapa">
        <button
          type="button"
          onClick={() => zoomBy(ZOOM_BUTTON_STEP)}
          aria-label="Aproximar mapa"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => zoomBy(-ZOOM_BUTTON_STEP)}
          aria-label="Afastar mapa"
        >
          -
        </button>
        <button type="button" onClick={resetZoom} aria-label="Resetar zoom do mapa">
          1x
        </button>
      </div>

      <label className={styles.regionSelector}>
        <span>Regiao</span>
        <select
          aria-label="Filtro de regiao do mapa"
          onChange={handleRegionChange}
          value={selectedRegionId ?? ""}
        >
          <option value="">Todas</option>
          {regionGroups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.items.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      {municipalities.length ? (
        <svg
          className={styles.brazilMap}
          role="img"
          viewBox="0 0 640 420"
          aria-label="Mapa do Brasil dividido por municipios"
          onPointerDown={handlePointerDown}
          onPointerLeave={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <g
            transform={`translate(${activeView.x} ${activeView.y}) scale(${activeView.scale})`}
          >
            <MunicipalityPaths
              hasSelectedRegion={Boolean(selectedRegionId)}
              isStateSelection={isStateSelection}
              municipalities={municipalities}
              municipalityToneMap={municipalityToneMap}
              selectedRegionMatcher={selectedRegionMatcher}
            />
          </g>
        </svg>
      ) : (
        <div className={styles.mapLoading}>Carregando malha municipal...</div>
      )}

      <aside className={styles.mapLegend} aria-label="Forca de trabalho por regiao">
        <strong>Forca de Trabalho por Regiao</strong>
        {legend.map((item) => (
          <span key={item.label}>
            <i className={styles[item.tone]} />
            {item.label}
          </span>
        ))}
      </aside>
    </div>
  );
}

const MunicipalityPaths = memo(function MunicipalityPaths({
  hasSelectedRegion,
  isStateSelection,
  municipalities,
  municipalityToneMap,
  selectedRegionMatcher,
}) {
  const visibleMunicipalities =
    hasSelectedRegion && isStateSelection
      ? municipalities.filter((municipality) => selectedRegionMatcher(municipality.id))
      : municipalities;

  return visibleMunicipalities.map((municipality) => {
    const isSelectedRegion = selectedRegionMatcher(municipality.id);
    const tone =
      municipalityToneMap.get(municipality.id) ??
      getStaticMunicipalityTone(municipality.id);

    return (
      <path
        className={[
          styles.cityCell,
          styles[tone],
          hasSelectedRegion && !isSelectedRegion ? styles.regionMuted : "",
          isSelectedRegion ? styles.regionSelected : "",
          isStateSelection ? styles.stateFocusedCell : "",
        ]
          .filter(Boolean)
          .join(" ")}
        d={municipality.path}
        key={municipality.id}
        vectorEffect="non-scaling-stroke"
      />
    );
  });
});

function getStaticMunicipalityTone(municipalityId) {
  const hash = String(municipalityId)
    .split("")
    .reduce((total, character, index) => {
      return total + Number(character || 0) * (index + 3);
    }, 0);

  // Mantem alguns municipios sem equipe para que a legenda continue util,
  // mas distribui atividade pela maior parte do mapa de forma deterministica.
  if (hash % 7 === 0) {
    return "empty";
  }

  return POPULATED_TONES[hash % POPULATED_TONES.length];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function createRegionMatcher(region) {
  const municipalityIds = new Set(region?.municipalityIds ?? []);
  const statePrefixes = region?.statePrefixes ?? [];

  return (municipalityId) =>
    municipalityIds.has(municipalityId) ||
    statePrefixes.some((prefix) => municipalityId.startsWith(prefix));
}

function groupRegions(regions) {
  return regions.reduce((groups, region) => {
    const label = region.group ?? "Regioes";
    const currentGroup = groups.find((group) => group.label === label);

    if (currentGroup) {
      currentGroup.items.push(region);
      return groups;
    }

    return [...groups, { label, items: [region] }];
  }, []);
}

function getRegionView(municipalities, region) {
  if (!municipalities.length || !region) {
    return null;
  }

  const isInRegion = createRegionMatcher(region);
  const selectedMunicipalities = municipalities.filter((municipality) =>
    isInRegion(municipality.id),
  );

  if (!selectedMunicipalities.length) {
    return null;
  }

  const bounds = selectedMunicipalities.reduce(
    (result, municipality) => ({
      maxX: Math.max(result.maxX, municipality.bounds.maxX),
      maxY: Math.max(result.maxY, municipality.bounds.maxY),
      minX: Math.min(result.minX, municipality.bounds.minX),
      minY: Math.min(result.minY, municipality.bounds.minY),
    }),
    { maxX: -Infinity, maxY: -Infinity, minX: Infinity, minY: Infinity },
  );
  const regionWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const regionHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const scale = clamp(
    Math.min((640 - 132) / regionWidth, (420 - 110) / regionHeight),
    1.3,
    REGION_FOCUS_MAX_ZOOM,
  );
  const centerX = bounds.minX + regionWidth / 2;
  const centerY = bounds.minY + regionHeight / 2;

  return {
    centerX,
    centerY,
    scale,
    x: 320 - centerX * scale,
    y: 210 - centerY * scale,
  };
}

function getFocusedTransform(focusedView, view) {
  const scale = clamp(focusedView.scale + view.scale - 1, 1, MAX_ZOOM);

  return {
    scale,
    x: 320 - focusedView.centerX * scale + view.x,
    y: 210 - focusedView.centerY * scale + view.y,
  };
}

function buildMunicipalPaths(geoJson) {
  const features = geoJson.features ?? [];
  const bounds = getBounds(features);
  const width = 640;
  const height = 420;
  const padding = 18;
  const scale = Math.min(
    (width - padding * 2) / (bounds.maxX - bounds.minX),
    (height - padding * 2) / (bounds.maxY - bounds.minY),
  );
  const mapWidth = (bounds.maxX - bounds.minX) * scale;
  const mapHeight = (bounds.maxY - bounds.minY) * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;

  function project([longitude, latitude]) {
    return [
      offsetX + (longitude - bounds.minX) * scale,
      offsetY + (bounds.maxY - latitude) * scale,
    ];
  }

  return features.map((feature) => {
    const id = feature.properties?.codarea ?? String(Math.random());

    return {
      bounds: geometryBounds(feature.geometry, project),
      id,
      path: geometryToPath(feature.geometry, project),
      tone: "empty",
    };
  });
}

function geometryBounds(geometry, project) {
  const bounds = {
    maxX: -Infinity,
    maxY: -Infinity,
    minX: Infinity,
    minY: Infinity,
  };

  walkCoordinates(geometry?.coordinates, (point) => {
    const [x, y] = project(point);
    bounds.minX = Math.min(bounds.minX, x);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxY = Math.max(bounds.maxY, y);
  });

  return bounds;
}

function getBounds(features) {
  const bounds = {
    maxX: -Infinity,
    maxY: -Infinity,
    minX: Infinity,
    minY: Infinity,
  };

  features.forEach((feature) => {
    walkCoordinates(feature.geometry?.coordinates, ([longitude, latitude]) => {
      bounds.minX = Math.min(bounds.minX, longitude);
      bounds.maxX = Math.max(bounds.maxX, longitude);
      bounds.minY = Math.min(bounds.minY, latitude);
      bounds.maxY = Math.max(bounds.maxY, latitude);
    });
  });

  return bounds;
}

function walkCoordinates(coordinates, visitor) {
  if (!Array.isArray(coordinates?.[0])) {
    visitor(coordinates);
    return;
  }

  coordinates.forEach((item) => walkCoordinates(item, visitor));
}

function geometryToPath(geometry, project) {
  if (!geometry) {
    return "";
  }

  if (geometry.type === "Polygon") {
    return polygonToPath(geometry.coordinates, project);
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((polygon) => polygonToPath(polygon, project))
      .join(" ");
  }

  return "";
}

function polygonToPath(rings, project) {
  return rings
    .map((ring) =>
      ring
        .map((point, index) => {
          const [x, y] = project(point);
          const command = index === 0 ? "M" : "L";
          return `${command}${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(" ")
        .concat(" Z"),
    )
    .join(" ");
}

export default BrazilMunicipalMap;
