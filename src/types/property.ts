export interface Property {
  id: number;
  listing_name: string;
  internal_name: string;
  number_of_bedrooms: number;
  number_of_bathrooms: number;
  number_of_beds: number;
  number_of_guests: number;
  number_of_extra_guests: number;
  google_latitude: string;
  google_longitude: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  country: number;
  media_filename: string;
  url: string;
  gbv: number;
  nights: number;
}

export interface PropertyResponse {
  totalGBV: number;
  totalNights: number;
  properties: Property[];
} 