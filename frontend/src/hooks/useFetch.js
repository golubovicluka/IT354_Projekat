import { useState, useEffect, useCallback } from 'react';

const useFetch = (asyncFunction, immediate = true) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const execute = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);
            try {
                const response = await asyncFunction(...args);
                setData(response);
                return response;
            } catch (err) {
                setError(err.response?.data?.error || err.message || 'Something went wrong');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [asyncFunction]
    );

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [execute, immediate]);

    return { data, loading, error, execute };
};

export default useFetch;
