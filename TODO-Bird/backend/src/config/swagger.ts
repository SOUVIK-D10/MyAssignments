// Swagger Config for documentation of api

import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'To-Do App API Documentation',
            version: '1.0.0',
            description: 'REST API documentation for User Authentication and Task Management.',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/auth/routes/*.ts', './src/task/router/task.router.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);