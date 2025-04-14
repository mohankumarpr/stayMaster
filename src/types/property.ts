import { ReactNode } from "react";

export interface Property {
  [x: string]: ReactNode;
  average_rating: any;
  total_reviews: any; 
  id: string;
  listing_name: string;
  earnings: any[];
  location: string;
  image: string;  
  amenities: string[];
  description: string;
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
  nbv: number;
  nights: number;
  authError?: boolean;
}

export interface PropertyRating {
  platform: string;
  logo: string;
  rating: number;
  color: string;
  totalReviews?: number; // Added optional property for total reviews
  reviewCount?: number; // Added optional property for review count
}

export interface PropertyAmenity {
  amenity: string;
  icon: string;
}

export interface PropertyDescription {
  title: string;
  description: string;
}

export interface PropertyMedia {
  type: string;
  url: string;
}

export interface PropertyReview {
  platform: string;
  rating: number;
  review: string;
  date: string;
}

export interface CalendarResponse {
  data: any;
  booking: any;
  property: any;
  rentalInfo: any;
  tariff: any;
  guest: any;
  calendar: Array<{
    id: number;
    start: string;
    end: string; 
    currentStatus: string;
    status: string;
    type: string;
  }>;
  authError?: boolean;
}

export interface BlockBookingResponse {
  success: boolean;
  status: number;
  blocks: any[];
  authError?: boolean;
}

export interface UnblockBookingResponse {
  success: boolean;
  authError?: boolean;
}

export interface PropertyResponse {
  totalNBV: number;
  totalNights: number;
  properties: Property[];
  authError?: boolean;
}