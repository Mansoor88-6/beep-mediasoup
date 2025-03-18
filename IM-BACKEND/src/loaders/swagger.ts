// import swaggerUi from 'swagger-ui-express';
// import swaggerJsdoc from 'swagger-jsdoc';
// import { Application } from 'express';

// export default class SwaggerLoader {
//     private app: Application;

//     constructor(app: Application) {
//         this.app = app;
//         this.initializeSwagger();
//     }

//     private initializeSwagger(): void {
//         const swaggerDefinition = {
//             openapi: '1.0.0',
//             info: {
//                 title: 'API Documentation',
//                 version: '1.0.0',
//                 description: 'API documentation for your application',
//             },
//             servers: [
//                 {
//                     url: 'http://localhost:6600',
//                     description: 'Development server',
//                 }
//             ],
//         };

//         const swaggerOptions = {
//             definition: swaggerDefinition,
//             apis: ['./dist/api/routes/*.js'], // Update to the location of your route files
//         };

//         const swaggerSpec = swaggerJsdoc(swaggerOptions);

//         this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//     }
// }
