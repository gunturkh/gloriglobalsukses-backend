const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const trackingDataValidation = require('../../validations/trackingData.validation');
const trackingDataController = require('../../controllers/trackingData.controller');

const router = express.Router();

router
  .route('/')
  .post(
    auth('manageTrackingData'),
    validate(trackingDataValidation.createTrackingData),
    trackingDataController.createTrackingData
  )
  .get(auth('getTrackingData'), validate(trackingDataValidation.getTrackingDatas), trackingDataController.getTrackingDatas);

router
  .route('/:trackingDataId')
  .get(auth('getTrackingData'), validate(trackingDataValidation.getTrackingData), trackingDataController.getTrackingData)
  .put(
    auth('manageTrackingData'),
    validate(trackingDataValidation.updateTrackingData),
    trackingDataController.updateTrackingData
  )
  .delete(
    auth('manageTrackingData'),
    validate(trackingDataValidation.deleteTrackingData),
    trackingDataController.deleteTrackingData
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Tracking Data
 *   description: Tracking data management and retrieval
 */

/**
 * @swagger
 * /tracking:
 *   post:
 *     summary: Create a tracking data
 *     description: Only authorized users can create tracking data.
 *     tags: [Tracking Data]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - address
 *               - item
 *               - resi
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: number
 *               address:
 *                 type: string
 *               item:
 *                  type: string
 *               resi:
 *                  type: string
 *               status:
 *                  type: string
 *             example:
 *               name: Kevin
 *               phone: 6281261592269
 *               address: Ansley View Tahap 2 Blok F No.22 A
 *               item: Headset Gaming
 *               resi: GGS-00000001
 *               status: Dalam Pengiriman
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TrackingData'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all tracking datas
 *     description: Only authorized users can retrieve all tracking datas.
 *     tags: [Tracking Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Tracking data customer name
 *       - in: query
 *         name: phone
 *         schema:
 *           type: number
 *         description: Tracking data phone number
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Tracking data address
 *       - in: query
 *         name: item
 *         schema:
 *           type: string
 *         description: Tracking data item
 *       - in: query
 *         name: resi
 *         schema:
 *           type: string
 *         description: Tracking data resi number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Tracking data status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of tracking datas
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TrackingData'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /tracking/{id}:
 *   get:
 *     summary: Get a tracking data
 *     description: Only authorized users can fetch tracking data.
 *     tags: [Tracking Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracking data id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TrackingData'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a tracking data
 *     description: Only authorized users can update tracking data.
 *     tags: [Tracking Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracking data id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: number
 *               address:
 *                 type: string
 *               item:
 *                 type: string
 *               resi:
 *                 type: string
 *               status:
 *                 type: string
 *             example:
 *               name: fake name
 *               phone: 6281261592269
 *               address: fake address
 *               item: fake item
 *               resi: GGS-00000002
 *               status: Sampai di Tujuan
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/TrackinData'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a tracking data
 *     description: Only authorized users can delete tracking data.
 *     tags: [Tracking Data]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tracking data id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
