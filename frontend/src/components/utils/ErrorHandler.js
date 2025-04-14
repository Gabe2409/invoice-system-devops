const handleApiError = (error, setError) => {
    console.error("API Error:", error);
    setError(error.response?.data?.message || "An error occurred. Please try again.");
  };
  
  export default handleApiError;
  