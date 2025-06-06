const db = require('../config/db');
const path = require('path');
const fs = require('fs');

class SchoolDefaultModel {
  static async createSchoolDefault(data, updated_by, school_logo) {
    const {
      school_id,
      school_name,
      school_address,
      region,
      division,
      district,
      school_head,
      contact_number,
      email,
      website
    } = data;

    const [result] = await db.query(
      `INSERT INTO school_defaults (
        school_id, school_name, school_address, region, division, 
        district, school_head, school_logo, contact_number, email, 
        website, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        school_id,
        school_name,
        school_address,
        region,
        division,
        district,
        school_head,
        school_logo,
        contact_number,
        email,
        website,
        updated_by
      ]
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
      [updated_by, `Created school default with ID ${school_id}`]
    );

    // Fetch the created school default with user info
    const [school] = await db.query(
      `SELECT s.*, 
              u.user_id, u.first_name, u.middle_name, u.last_name, u.email
       FROM school_defaults s
       LEFT JOIN users u ON s.updated_by = u.user_id
       WHERE s.school_id = ?`,
      [school_id]
    );

    if (school.length === 0) {
      throw new Error('Created school not found');
    }

    return school[0];
  }

  static async updateSchoolDefault(school_id, data, updated_by, school_logo) {
    const {
      school_name,
      school_address,
      region,
      division,
      district,
      school_head,
      contact_number,
      email,
      website
    } = data;

    // Check if school exists
    const [existing] = await db.query('SELECT * FROM school_defaults WHERE school_id = ?', [school_id]);
    if (existing.length === 0) {
      throw new Error('School not found');
    }

    // Handle old logo deletion if new logo is provided
    if (school_logo && existing[0].school_logo) {
      const oldLogoPath = path.join(__dirname, '../../data', existing[0].school_logo);
      try {
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
          console.log('Deleted old logo:', oldLogoPath);
        }
      } catch (error) {
        console.error('Error deleting old logo:', error);
      }
    }

    const [result] = await db.query(
      `UPDATE school_defaults SET
        school_name = ?,
        school_address = ?,
        region = ?,
        division = ?,
        district = ?,
        school_head = ?,
        school_logo = ?,
        contact_number = ?,
        email = ?,
        website = ?,
        updated_by = ?
      WHERE school_id = ?`,
      [
        school_name,
        school_address,
        region,
        division,
        district,
        school_head,
        school_logo || existing[0].school_logo,
        contact_number,
        email,
        website,
        updated_by,
        school_id
      ]
    );

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (user_id, action) VALUES (?, ?)',
      [updated_by, `Updated school default with ID ${school_id}`]
    );

    // Fetch the updated school default with user info
    const [school] = await db.query(
      `SELECT s.*, 
              u.user_id, u.first_name, u.middle_name, u.last_name, u.email
       FROM school_defaults s
       LEFT JOIN users u ON s.updated_by = u.user_id
       WHERE s.school_id = ?`,
      [school_id]
    );

    if (school.length === 0) {
      throw new Error('Updated school not found');
    }

    return school[0];
  }

  static async getSchoolDefault(school_id) {
    const [school] = await db.query(
      `SELECT s.*, 
              u.user_id, u.first_name, u.middle_name, u.last_name, u.email
       FROM school_defaults s
       LEFT JOIN users u ON s.updated_by = u.user_id
       WHERE s.school_id = ?`,
      [school_id]
    );

    if (school.length === 0) {
      throw new Error('School not found');
    }

    return school[0];
  }
}

module.exports = SchoolDefaultModel;
