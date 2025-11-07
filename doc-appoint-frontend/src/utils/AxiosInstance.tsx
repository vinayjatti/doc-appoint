import axios from "axios";
import { NearByPlaceData } from "./Interface";
import { BASE_URL } from "./constants";

const axiosInstance = axios.create({
    headers: {
        "Content-Type": "application/json",
    },
});

export const searchNearBy = async (
    includeTypes: string[], // multiple types
    latitude: number,
    longitude: number
): Promise<NearByPlaceData[]> => {
    try {
        const result = await axiosInstance.post(BASE_URL+"/api/google/search", {
            includeTypes,
            latitude, longitude
        });
        if (result.status === 200) {
            return result.data as NearByPlaceData[];
        }
        return [];
    } catch (err) {
        console.error("Error in searchNearBy:", err);
        throw err;
    }
}