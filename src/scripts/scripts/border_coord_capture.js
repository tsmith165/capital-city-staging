import axios from 'axios';
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of cities to process
const cities = [
    'Sacramento',
    'West Sacramento',
    'Rancho Cordova',
    'Carmichael',
    'Rio Linda',
    'North Highlands',
    'Antelope',
    'Citrus Heights',
    'Gold River',
    'Fair Oaks',
    'Orangevale',
    'Folsom',
    'Granite Bay',
    'Roseville',
    'Rocklin',
    'Loomis',
];

// TIGER/Line shapefile URL template
const tigerShapefileUrl = 'https://www2.census.gov/geo/tiger/TIGER2023/PLACE/tl_2023_{state_fips}_place.zip';

// Directory to store downloaded shapefiles and GeoJSON files
const downloadDir = path.join(__dirname, 'downloads');
const geojsonDir = path.join(__dirname, 'geojson');

if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);
if (!fs.existsSync(geojsonDir)) fs.mkdirSync(geojsonDir);

async function downloadShapefile(stateFips) {
    const url = tigerShapefileUrl.replace('{state_fips}', stateFips);
    const zipPath = path.join(downloadDir, `tl_2023_${stateFips}_place.zip`);

    if (fs.existsSync(zipPath)) {
        console.log(`Shapefile for state FIPS ${stateFips} already downloaded.`);
        return zipPath;
    }

    const writer = fs.createWriteStream(zipPath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(zipPath));
        writer.on('error', reject);
    });
}

function convertShapefileToGeoJSON(zipPath, stateFips) {
    const unzipDir = path.join(downloadDir, `tl_2023_${stateFips}_place`);
    const geojsonPath = path.join(geojsonDir, `tl_2023_${stateFips}_place.geojson`);

    if (fs.existsSync(geojsonPath)) {
        console.log(`GeoJSON for state FIPS ${stateFips} already converted.`);
        return geojsonPath;
    }

    if (!fs.existsSync(unzipDir)) fs.mkdirSync(unzipDir);

    // Unzip the shapefile
    execSync(`unzip -o ${zipPath} -d ${unzipDir}`);

    // Convert to GeoJSON
    const shpFilePath = path.join(unzipDir, `tl_2023_${stateFips}_place.shp`);
    execSync(`ogr2ogr -f GeoJSON ${geojsonPath} ${shpFilePath}`);

    return geojsonPath;
}

function extractCityCoordinates(geojsonPath, cityNames) {
    const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
    const cityCoordinates = geojson.features
        .filter((feature) => cityNames.includes(feature.properties.NAME))
        .map((feature) => {
            return {
                name: feature.properties.NAME,
                coordinates: feature.geometry.coordinates,
            };
        });

    return cityCoordinates;
}

async function processCities(cities) {
    const stateFips = '06'; // California FIPS code
    const zipPath = await downloadShapefile(stateFips);
    const geojsonPath = convertShapefileToGeoJSON(zipPath, stateFips);
    const cityCoordinates = extractCityCoordinates(geojsonPath, cities);

    fs.writeFileSync('city_boundaries.json', JSON.stringify(cityCoordinates, null, 2));
    console.log('City boundaries have been written to city_boundaries.json');
}

processCities(cities.map((city) => city.split(',')[0])).catch((error) => console.error('Error processing cities:', error));
