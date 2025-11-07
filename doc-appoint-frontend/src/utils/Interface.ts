export interface NearByPlaceData {
    name: string;
    address: string;
    rating: number | string;
    userRatings: number;
    lat: number;
    lng: number;
    distanceValue: number; // in km
    distance: string; // formatted distance string
    type: string; // place type
}