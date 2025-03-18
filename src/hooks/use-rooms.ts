import { useState, useEffect } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export type Room = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
};

export function useRooms() {
  const fetchRooms = async (): Promise<Room[]> => {
    const response = await axios.get('/api/rooms');
    return response.data;
  };

  const { 
    data: rooms = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  });

  return { rooms, isLoading, isError, refetch };
} 