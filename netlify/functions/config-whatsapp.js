exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      success: true, 
      config: { 
        primary_number: "", 
        secondary_number: "", 
        formatted: "", 
        active: false 
      } 
    })
  };
};
