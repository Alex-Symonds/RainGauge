import { useEffect, useState } from 'react';

// GET only, reports on loading status
export const useFetchWithLoading = (url : string) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
              const response = await fetch(url);
            
              if (!response.ok) {
                throw new Error("Bad response code");
              }
            
              const newData = await response.json();
              setData(newData);
              setLoaded(true);

            } catch (err : any) {
              setError(err);
              setLoaded(true);
            }
        };
        fetchData();
    }, [url]);

    return { data, error, isLoaded };
};
