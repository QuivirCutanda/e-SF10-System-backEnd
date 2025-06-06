const SchoolDefaultModel = require('../models/schoolDefault.model');

exports.createSchoolDefault = async (req, res) => {
  try {
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
    } = req.body;

    const updated_by = req.user.user_id;
    let school_logo = null;

    if (req.file) {
      school_logo = `/school_logos/${req.file.filename}`;
    }

    const school = await SchoolDefaultModel.createSchoolDefault(
      {
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
      },
      updated_by,
      school_logo
    );

    // Format response to include user info instead of updated_by
    const schoolData = {
      school_id: school.school_id,
      school_name: school.school_name,
      school_address: school.school_address,
      region: school.region,
      division: school.division,
      district: school.district,
      school_head: school.school_head,
      school_logo: school.school_logo,
      contact_number: school.contact_number,
      email: school.email,
      website: school.website,
      created_at: school.created_at,
      updated_at: school.updated_at,
      user: school.user_id ? {
        user_id: school.user_id,
        first_name: school.first_name,
        middle_name: school.middle_name,
        last_name: school.last_name,
        email: school.email
      } : null
    };

    res.status(201).json({
      message: 'School default created successfully',
      data: schoolData
    });
  } catch (error) {
    console.error('Error creating school default:', error);
    if (error.message === 'Created school not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating school default', error: error.message });
  }
};

exports.updateSchoolDefault = async (req, res) => {
  try {
    const { school_id } = req.params;
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
    } = req.body;

    const updated_by = req.user.user_id;
    let school_logo = null;

    if (req.file) {
      school_logo = `/school_logos/${req.file.filename}`;
    }

    const school = await SchoolDefaultModel.updateSchoolDefault(
      school_id,
      {
        school_name,
        school_address,
        region,
        division,
        district,
        school_head,
        contact_number,
        email,
        website
      },
      updated_by,
      school_logo
    );

    // Format response to include user info instead of updated_by
    const schoolData = {
      school_id: school.school_id,
      school_name: school.school_name,
      school_address: school.school_address,
      region: school.region,
      division: school.division,
      district: school.district,
      school_head: school.school_head,
      school_logo: school.school_logo,
      contact_number: school.contact_number,
      email: school.email,
      website: school.website,
      created_at: school.created_at,
      updated_at: school.updated_at,
      user: school.user_id ? {
        user_id: school.user_id,
        first_name: school.first_name,
        middle_name: school.middle_name,
        last_name: school.last_name,
        email: school.email
      } : null
    };

    res.status(200).json({
      message: 'School default updated successfully',
      data: schoolData
    });
  } catch (error) {
    console.error('Error updating school default:', error);
    if (error.message === 'School not found' || error.message === 'Updated school not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ message: 'Error updating school default', error: error.message });
  }
};

exports.getSchoolDefault = async (req, res) => {
  try {
    const { school_id } = req.params;

    const school = await SchoolDefaultModel.getSchoolDefault(school_id);

    // Format response to include user info instead of updated_by
    const schoolData = {
      school_id: school.school_id,
      school_name: school.school_name,
      school_address: school.school_address,
      region: school.region,
      division: school.division,
      district: school.district,
      school_head: school.school_head,
      school_logo: school.school_logo,
      contact_number: school.contact_number,
      email: school.email,
      website: school.website,
      created_at: school.created_at,
      updated_at: school.updated_at,
      user: school.user_id ? {
        user_id: school.user_id,
        first_name: school.first_name,
        middle_name: school.middle_name,
        last_name: school.last_name,
        email: school.email
      } : null
    };

    res.status(200).json(schoolData);
  } catch (error) {
    console.error('Error fetching school default:', error);
    if (error.message === 'School not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ message: 'Error fetching school default', error: error.message });
  }
};
