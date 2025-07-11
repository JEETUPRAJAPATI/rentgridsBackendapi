import { Op, Sequelize } from 'sequelize';
import { 
  Property, 
  PropertyCategory, 
  PropertyDocument, 
  PropertyImage, 
  PropertyLocation, 
  PropertyFeature, 
  Amenity, 
  User 
} from '../models/sequelize/associations.js';
import { formatResponse, generateSlug } from '../utils/helpers.js';
import logger from '../utils/logger.js';
import path from 'path';
import fs from 'fs/promises';

export class EnhancedPropertyService {
  
  // ============ PROPERTY CRUD OPERATIONS ============
  static async getAllProperties(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        property_type = '',
        listing_type = '',
        status = '',
        city = '',
        min_price = '',
        max_price = '',
        bedroom = '',
        is_featured = '',
        is_verified = '',
        owner_id = '',
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      const offset = (page - 1) * limit;
      const whereClause = {};
      const locationWhereClause = {};

      // Build where clauses
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
          { unique_id: { [Op.iLike]: `%${search}%` } }
        ];
      }

      if (property_type) whereClause.property_type = property_type;
      if (listing_type) whereClause.listing_type = listing_type;
      if (status) whereClause.status = status;
      if (bedroom) whereClause.bedroom = parseInt(bedroom);
      if (is_featured !== '') whereClause.is_featured = is_featured === 'true';
      if (is_verified !== '') whereClause.is_verified = is_verified === 'true';
      if (owner_id) whereClause.owner_id = owner_id;

      if (min_price || max_price) {
        whereClause.price = {};
        if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
        if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
      }

      if (city) locationWhereClause.city = { [Op.iLike]: `%${city}%` };

      const includeArray = [
        { model: PropertyCategory, as: 'category' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: PropertyLocation, as: 'location', where: Object.keys(locationWhereClause).length ? locationWhereClause : undefined },
        { model: PropertyImage, as: 'images', limit: 5 },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ];

      const { count, rows } = await Property.findAndCountAll({
        where: whereClause,
        include: includeArray,
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      return {
        properties: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: count,
          total_pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('EnhancedPropertyService getAllProperties error:', error);
      throw error;
    }
  }

  static async searchProperties(searchParams = {}) {
    try {
      const {
        query = '',
        property_type = '',
        listing_type = '',
        city = '',
        locality = '',
        min_price = '',
        max_price = '',
        bedroom = '',
        bathroom = '',
        furnish_type = '',
        amenities = [],
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = searchParams;

      const offset = (page - 1) * limit;
      const whereClause = { status: 'published' };
      const locationWhereClause = {};

      // Build search conditions
      if (query) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ];
      }

      if (property_type) whereClause.property_type = property_type;
      if (listing_type) whereClause.listing_type = listing_type;
      if (bedroom) whereClause.bedroom = parseInt(bedroom);
      if (bathroom) whereClause.bathroom = parseInt(bathroom);
      if (furnish_type) whereClause.furnish_type = furnish_type;

      if (min_price || max_price) {
        whereClause.price = {};
        if (min_price) whereClause.price[Op.gte] = parseFloat(min_price);
        if (max_price) whereClause.price[Op.lte] = parseFloat(max_price);
      }

      if (city) locationWhereClause.city = { [Op.iLike]: `%${city}%` };
      if (locality) locationWhereClause.locality = { [Op.iLike]: `%${locality}%` };

      const includeArray = [
        { model: PropertyCategory, as: 'category' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: PropertyLocation, as: 'location', where: Object.keys(locationWhereClause).length ? locationWhereClause : undefined },
        { model: PropertyImage, as: 'images', limit: 5 },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ];

      // Add amenity filter if provided
      if (amenities.length > 0) {
        includeArray[includeArray.length - 1].where = {
          id: { [Op.in]: amenities }
        };
      }

      const { count, rows } = await Property.findAndCountAll({
        where: whereClause,
        include: includeArray,
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, sort_order.toUpperCase()]],
        distinct: true
      });

      return {
        properties: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: count,
          total_pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('EnhancedPropertyService searchProperties error:', error);
      throw error;
    }
  }

  static async getFeaturedProperties(filters = {}) {
    try {
      const { limit = 10, property_type = '', city = '' } = filters;
      
      const whereClause = { 
        is_featured: true, 
        status: 'published' 
      };
      const locationWhereClause = {};

      if (property_type) whereClause.property_type = property_type;
      if (city) locationWhereClause.city = { [Op.iLike]: `%${city}%` };

      const includeArray = [
        { model: PropertyCategory, as: 'category' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email'] },
        { model: PropertyLocation, as: 'location', where: Object.keys(locationWhereClause).length ? locationWhereClause : undefined },
        { model: PropertyImage, as: 'images', limit: 3 },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ];

      const properties = await Property.findAll({
        where: whereClause,
        include: includeArray,
        limit: parseInt(limit),
        order: [['created_at', 'DESC']]
      });

      return { properties };
    } catch (error) {
      logger.error('EnhancedPropertyService getFeaturedProperties error:', error);
      throw error;
    }
  }

  static async getPropertyById(id, includeRelations = true) {
    try {
      const includeArray = includeRelations ? [
        { model: PropertyCategory, as: 'category' },
        { model: User, as: 'owner', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'verifier', attributes: ['id', 'name', 'email'] },
        { model: PropertyLocation, as: 'location' },
        { model: PropertyImage, as: 'images' },
        { model: PropertyDocument, as: 'documents' },
        { model: PropertyFeature, as: 'features' },
        { model: Amenity, as: 'amenities', through: { attributes: [] } }
      ] : [];

      const property = await Property.findByPk(id, {
        include: includeArray
      });

      if (!property) {
        throw new Error('Property not found');
      }

      // Increment view count
      await property.increment('views_count');

      return property;
    } catch (error) {
      logger.error('EnhancedPropertyService getPropertyById error:', error);
      throw error;
    }
  }

  static async createProperty(propertyData, files = {}) {
    try {
      // Create property
      const property = await Property.create(propertyData);

      // Create location if provided
      if (propertyData.location) {
        await PropertyLocation.create({
          ...propertyData.location,
          property_id: property.id
        });
      }

      // Create features if provided
      if (propertyData.features && Array.isArray(propertyData.features)) {
        const features = propertyData.features.map(feature => ({
          ...feature,
          property_id: property.id
        }));
        await PropertyFeature.bulkCreate(features);
      }

      // Associate amenities if provided
      if (propertyData.amenities && Array.isArray(propertyData.amenities)) {
        await property.setAmenities(propertyData.amenities);
      }

      // Handle file uploads
      if (files.images && Array.isArray(files.images)) {
        await this.uploadPropertyImages(property.id, files.images);
      }

      if (files.documents && Array.isArray(files.documents)) {
        for (const doc of files.documents) {
          await this.uploadPropertyDocument(property.id, doc, {
            doc_type: doc.doc_type || 'other',
            document_name: doc.document_name || doc.originalname
          });
        }
      }

      return await this.getPropertyById(property.id);
    } catch (error) {
      logger.error('EnhancedPropertyService createProperty error:', error);
      throw error;
    }
  }

  static async updateProperty(id, propertyData, files = {}) {
    try {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Update property
      await property.update(propertyData);

      // Update location if provided
      if (propertyData.location) {
        await PropertyLocation.upsert({
          ...propertyData.location,
          property_id: id
        });
      }

      // Update features if provided
      if (propertyData.features && Array.isArray(propertyData.features)) {
        await PropertyFeature.destroy({ where: { property_id: id } });
        const features = propertyData.features.map(feature => ({
          ...feature,
          property_id: id
        }));
        await PropertyFeature.bulkCreate(features);
      }

      // Update amenities if provided
      if (propertyData.amenities && Array.isArray(propertyData.amenities)) {
        await property.setAmenities(propertyData.amenities);
      }

      // Handle file uploads
      if (files.images && Array.isArray(files.images)) {
        await this.uploadPropertyImages(id, files.images);
      }

      return await this.getPropertyById(id);
    } catch (error) {
      logger.error('EnhancedPropertyService updateProperty error:', error);
      throw error;
    }
  }

  static async updatePropertyStatus(id, status) {
    try {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new Error('Property not found');
      }

      await property.update({ status });
      return property;
    } catch (error) {
      logger.error('EnhancedPropertyService updatePropertyStatus error:', error);
      throw error;
    }
  }

  static async deleteProperty(id) {
    try {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new Error('Property not found');
      }

      // Delete associated files
      const images = await PropertyImage.findAll({ where: { property_id: id } });
      for (const image of images) {
        try {
          await fs.unlink(image.file_path);
        } catch (err) {
          logger.warn(`Failed to delete image file: ${image.file_path}`);
        }
      }

      const documents = await PropertyDocument.findAll({ where: { property_id: id } });
      for (const doc of documents) {
        try {
          await fs.unlink(doc.file_path);
        } catch (err) {
          logger.warn(`Failed to delete document file: ${doc.file_path}`);
        }
      }

      // Delete property and all associated records
      await property.destroy();
      return true;
    } catch (error) {
      logger.error('EnhancedPropertyService deleteProperty error:', error);
      throw error;
    }
  }

  // ============ PROPERTY VERIFICATION OPERATIONS ============
  static async verifyProperty(id, adminId) {
    try {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new Error('Property not found');
      }

      await property.update({
        is_verified: true,
        verified_by: adminId,
        verified_at: new Date(),
        status: 'verified'
      });

      return property;
    } catch (error) {
      logger.error('EnhancedPropertyService verifyProperty error:', error);
      throw error;
    }
  }

  static async rejectProperty(id, reason) {
    try {
      const property = await Property.findByPk(id);
      if (!property) {
        throw new Error('Property not found');
      }

      await property.update({
        status: 'rejected',
        rejection_reason: reason
      });

      return property;
    } catch (error) {
      logger.error('EnhancedPropertyService rejectProperty error:', error);
      throw error;
    }
  }

  // ============ PROPERTY IMAGES OPERATIONS ============
  static async getPropertyImages(propertyId) {
    try {
      const images = await PropertyImage.findAll({
        where: { property_id: propertyId },
        order: [['display_order', 'ASC'], ['created_at', 'ASC']]
      });
      return images;
    } catch (error) {
      logger.error('EnhancedPropertyService getPropertyImages error:', error);
      throw error;
    }
  }

  static async uploadPropertyImages(propertyId, files, uploadedBy = null) {
    try {
      const property = await Property.findByPk(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const uploadedImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageData = {
          property_id: propertyId,
          file_name: file.filename,
          file_path: file.path,
          file_size: file.size,
          mime_type: file.mimetype,
          display_order: i + 1,
          uploaded_by: uploadedBy
        };

        const image = await PropertyImage.create(imageData);
        uploadedImages.push(image);
      }

      return uploadedImages;
    } catch (error) {
      logger.error('EnhancedPropertyService uploadPropertyImages error:', error);
      throw error;
    }
  }

  static async deletePropertyImage(imageId) {
    try {
      const image = await PropertyImage.findByPk(imageId);
      if (!image) {
        throw new Error('Image not found');
      }

      // Delete file
      try {
        await fs.unlink(image.file_path);
      } catch (err) {
        logger.warn(`Failed to delete image file: ${image.file_path}`);
      }

      await image.destroy();
      return true;
    } catch (error) {
      logger.error('EnhancedPropertyService deletePropertyImage error:', error);
      throw error;
    }
  }

  // ============ PROPERTY DOCUMENTS OPERATIONS ============
  static async getPropertyDocuments(propertyId) {
    try {
      const documents = await PropertyDocument.findAll({
        where: { property_id: propertyId },
        order: [['created_at', 'DESC']]
      });
      return documents;
    } catch (error) {
      logger.error('EnhancedPropertyService getPropertyDocuments error:', error);
      throw error;
    }
  }

  static async uploadPropertyDocument(propertyId, file, metadata = {}) {
    try {
      const property = await Property.findByPk(propertyId);
      if (!property) {
        throw new Error('Property not found');
      }

      const documentData = {
        property_id: propertyId,
        document_name: metadata.document_name || file.originalname,
        doc_type: metadata.doc_type || 'other',
        file_name: file.filename,
        file_path: file.path,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: metadata.uploaded_by
      };

      const document = await PropertyDocument.create(documentData);
      return document;
    } catch (error) {
      logger.error('EnhancedPropertyService uploadPropertyDocument error:', error);
      throw error;
    }
  }

  static async deletePropertyDocument(docId) {
    try {
      const document = await PropertyDocument.findByPk(docId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete file
      try {
        await fs.unlink(document.file_path);
      } catch (err) {
        logger.warn(`Failed to delete document file: ${document.file_path}`);
      }

      await document.destroy();
      return true;
    } catch (error) {
      logger.error('EnhancedPropertyService deletePropertyDocument error:', error);
      throw error;
    }
  }

  // ============ OWNER-SPECIFIC OPERATIONS ============
  static async getOwnerProperties(ownerId, filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = '',
        property_type = '',
        sort_by = 'created_at',
        sort_order = 'desc'
      } = filters;

      const offset = (page - 1) * limit;
      const whereClause = { owner_id: ownerId };

      if (status) whereClause.status = status;
      if (property_type) whereClause.property_type = property_type;

      const { count, rows } = await Property.findAndCountAll({
        where: whereClause,
        include: [
          { model: PropertyCategory, as: 'category' },
          { model: PropertyLocation, as: 'location' },
          { model: PropertyImage, as: 'images', limit: 3 }
        ],
        limit: parseInt(limit),
        offset: offset,
        order: [[sort_by, sort_order.toUpperCase()]]
      });

      return {
        properties: rows,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: count,
          total_pages: Math.ceil(count / limit)
        }
      };
    } catch (error) {
      logger.error('EnhancedPropertyService getOwnerProperties error:', error);
      throw error;
    }
  }

  // ============ PROPERTY STATISTICS ============
  static async getPropertyStats() {
    try {
      const totalProperties = await Property.count();
      const publishedProperties = await Property.count({ where: { status: 'published' } });
      const featuredProperties = await Property.count({ where: { is_featured: true } });
      const verifiedProperties = await Property.count({ where: { is_verified: true } });
      
      const statusStats = await Property.findAll({
        attributes: [
          'status',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      const typeStats = await Property.findAll({
        attributes: [
          'property_type',
          [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
        ],
        group: ['property_type']
      });

      const recentProperties = await Property.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          { model: User, as: 'owner', attributes: ['name'] },
          { model: PropertyLocation, as: 'location' }
        ]
      });

      return {
        totals: {
          total: totalProperties,
          published: publishedProperties,
          featured: featuredProperties,
          verified: verifiedProperties
        },
        status_breakdown: statusStats,
        type_breakdown: typeStats,
        recent_properties: recentProperties
      };
    } catch (error) {
      logger.error('EnhancedPropertyService getPropertyStats error:', error);
      throw error;
    }
  }
}