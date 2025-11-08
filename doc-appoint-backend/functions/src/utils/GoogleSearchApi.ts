import { Router } from "express";
import { sendWhatsApp } from "./sendWhatsApp";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const GOOGLE_API_URL = process.env.GOOGLE_API_URL || "https://places.googleapis.com";
const GOOGLE_MAP_API_KEY = process.env.GOOGLE_MAP_API_KEY || "YOUR_GOOGLE_MAPS_API_KEY";

/**
 * Search nearby places using Google Places API
 * @param includeType - Type of place (e.g., "doctor", "hospital", "clinic")
 * @param latitude - Latitude of current location
 * @param longitude - Longitude of current location
 */

const calculateDistance = (
    userLat: number,
    userLng: number,
    docLat: number,
    docLng: number
): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = ((docLat - userLat) * Math.PI) / 180;
    const dLng = ((docLng - userLng) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((userLat * Math.PI) / 180) *
        Math.cos((docLat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const searchNearBy = async (
  includeTypes: string[], // multiple types
  latitude: number,
  longitude: number
) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GOOGLE_MAP_API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.id,places.location",
    };

    let combinedResults: any[] = [];

    // 🔁 Iterate over each includeType
    for (const includeType of includeTypes) {
      const requestBody = {
        includedTypes: [includeType],
        maxResultCount: 10,
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: 5000.0, // 5 km
          },
        },
      };

      const response = await axios.post(
        `${GOOGLE_API_URL}/v1/places:searchNearby`,
        requestBody,
        { headers }
      );

      const places =
        response.data.places?.map((place: any) => {
          const dist = calculateDistance(
            latitude,
            longitude,
            place.location?.latitude,
            place.location?.longitude
          );
          return {
            id: place.id,
            name: place.displayName?.text || "Unknown",
            address: place.formattedAddress,
            rating: place.rating || "N/A",
            userRatings: place.userRatingCount || 0,
            lat: place.location?.latitude,
            lng: place.location?.longitude,
            distanceValue: dist,
            distance: `${dist.toFixed(2)} km away`,
            type: includeType,
          };
        }) || [];

      combinedResults = combinedResults.concat(places);
    }

    // 🧹 Remove duplicates by 'id' or 'name + address'
    const distinctResults = Array.from(
      new Map(
        combinedResults.map((item) => [
          item.id || `${item.name}-${item.address}`,
          item,
        ])
      ).values()
    );

    // 📏 Sort by nearest distance
    distinctResults.sort((a, b) => a.distanceValue - b.distanceValue);

    console.log(
      `✅ Found ${distinctResults.length} unique results across ${includeTypes.join(", ")}`
    );

    return distinctResults;
  } catch (error: any) {
    console.error("❌ Error fetching nearby places:", error.message);
    throw new Error("Failed to fetch nearby places");
  }
};