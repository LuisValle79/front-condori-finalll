
export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api/v1'
};

export const environmentDev1 = {
    production: false,
    apiUrl: 'http://localhost:8080/api/v1'
};


export const environmentDev2 = {
    production: false, // Indica que estás en desarrollo
    apiUrl: 'http://localhost:8080/api/v1', // URL base de la API
    logLevel: 'debug', // Nivel de registros para desarrollo
  };
  
  export const environmentWebSocker = {
    production: false, // Indica que estás en desarrollo
    apiUrl: 'http://localhost:8080', // URL base de la API
    logLevel: 'debug', // Nivel de registros para desarrollo
  };
