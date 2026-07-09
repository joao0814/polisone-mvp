import { useEffect, useState } from "react";
import styles from "../GestaoCampanha.module.css";

const legend = [
  { label: "0 Equipes", tone: "empty" },
  { label: "Baixo numero de equipes", tone: "low" },
  { label: "Medio numero de equipes", tone: "medium" },
  { label: "Bom numero de equipes", tone: "good" },
  { label: "Alto numero de equipes", tone: "high" },
];

function BrazilMunicipalMap() {
  const [municipalities, setMunicipalities] = useState([]);

  useEffect(() => {
    let isActive = true;

    async function loadMap() {
      let response = await fetch("/data/br-municipios.geojson");

      if (!response.ok) {
        response = await fetch("/data/sp-municipios.geojson");
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

  return (
    <div className={styles.mapStage}>
      {municipalities.length ? (
        <svg
          className={styles.brazilMap}
          role="img"
          viewBox="0 0 640 420"
          aria-label="Mapa do Brasil dividido por municipios"
        >
          {municipalities.map((municipality) => (
            <path
              className={`${styles.cityCell} ${styles[municipality.tone]}`}
              d={municipality.path}
              key={municipality.id}
            >
              <title>Municipio IBGE {municipality.id}</title>
            </path>
          ))}
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
      id,
      path: geometryToPath(feature.geometry, project),
      tone: getTone(id),
    };
  });
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

function getTone(id) {
  const score = String(id)
    .split("")
    .reduce((total, char) => total + Number(char), 0);

  if (score % 11 === 0) {
    return "empty";
  }

  if (score % 5 === 0) {
    return "high";
  }

  if (score % 3 === 0) {
    return "good";
  }

  if (score % 2 === 0) {
    return "medium";
  }

  return "low";
}

export default BrazilMunicipalMap;
