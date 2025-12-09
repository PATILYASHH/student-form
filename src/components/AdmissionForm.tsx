import React, { useState, FormEvent, ChangeEvent } from 'react';
import { supabase } from '../lib/supabase';

interface FormData {
  // Student Information
  student_name: string;
  marks_10: string;
  marks_12: string;
  photo_file: File | null;
  marksheet_10_file: File | null;
  marksheet_12_file: File | null;
  blood_group: string;
  disability_status: string;
  caste: string;
  religion: string;
  contact_number: string;
  email: string;
  aadhaar_number: string;
  
  // Parents Information
  father_name: string;
  mother_name: string;
  guardian_name: string;
  parent_contact_number: string;
  parent_email: string;
  parent_education: string;
  
  // Personal Information
  address: string;
  annual_household_income: string;
  parent_business: string;
  
  // Bank Information
  bank_account_number: string;
  ifsc_code: string;
  bank_name: string;
  
  // Agreements
  terms_accepted: boolean;
  data_consent: boolean;
}

const AdmissionForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    student_name: '',
    marks_10: '',
    marks_12: '',
    photo_file: null,
    marksheet_10_file: null,
    marksheet_12_file: null,
    blood_group: '',
    disability_status: '',
    caste: '',
    religion: '',
    contact_number: '',
    email: '',
    aadhaar_number: '',
    father_name: '',
    mother_name: '',
    guardian_name: '',
    parent_contact_number: '',
    parent_email: '',
    parent_education: '',
    address: '',
    annual_household_income: '',
    parent_business: '',
    bank_account_number: '',
    ifsc_code: '',
    bank_name: '',
    terms_accepted: false,
    data_consent: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{ applicationId: string; password: string } | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Convert IFSC code to uppercase
      const finalValue = name === 'ifsc_code' ? value.toUpperCase() : value;
      setFormData(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Required text fields
    if (!formData.student_name.trim()) newErrors.push('Student name is required');
    if (!formData.marks_10.trim()) newErrors.push('10th marks is required');
    if (!formData.marks_12.trim()) newErrors.push('12th marks is required');
    if (!formData.contact_number.trim()) newErrors.push('Contact number is required');
    if (!formData.email.trim()) newErrors.push('Email is required');
    if (!formData.aadhaar_number.trim()) newErrors.push('Aadhaar number is required');
    if (!formData.father_name.trim()) newErrors.push('Father\'s name is required');
    if (!formData.address.trim()) newErrors.push('Address is required');
    if (!formData.bank_account_number.trim()) newErrors.push('Bank account number is required');
    if (!formData.ifsc_code.trim()) {
      newErrors.push('IFSC code is required');
    } else if (formData.ifsc_code.length !== 11) {
      newErrors.push('IFSC code must be exactly 11 characters');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
      newErrors.push('IFSC code format is invalid (e.g., SBIN0001234)');
    }
    if (!formData.bank_name.trim()) newErrors.push('Bank name is required');

    // Required files
    if (!formData.photo_file) newErrors.push('Student photo is required');
    if (!formData.marksheet_10_file) newErrors.push('10th marksheet is required');
    if (!formData.marksheet_12_file) newErrors.push('12th marksheet is required');

    // Required checkboxes
    if (!formData.terms_accepted) newErrors.push('You must accept the terms');
    if (!formData.data_consent) newErrors.push('You must provide data consent');

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    try {
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      return data.path;
    } catch (error) {
      console.error('Upload exception:', error);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSubmitSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload files
      const photoPath = formData.photo_file 
        ? await uploadFile(formData.photo_file, 'photos')
        : null;
      
      const marksheet10Path = formData.marksheet_10_file
        ? await uploadFile(formData.marksheet_10_file, 'marksheets')
        : null;
      
      const marksheet12Path = formData.marksheet_12_file
        ? await uploadFile(formData.marksheet_12_file, 'marksheets')
        : null;

      if (!photoPath || !marksheet10Path || !marksheet12Path) {
        setErrors(['Failed to upload one or more files. Please try again.']);
        setIsSubmitting(false);
        return;
      }

      // Generate a simple password (6 random characters)
      const generatedPassword = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Insert data into Supabase
      const { data: insertedData, error } = await supabase
        .from('admissions')
        .insert([
          {
            // Student Information
            student_name: formData.student_name,
            marks_10: parseFloat(formData.marks_10),
            marks_12: parseFloat(formData.marks_12),
            photo_path: photoPath,
            marksheet_10_path: marksheet10Path,
            marksheet_12_path: marksheet12Path,
            blood_group: formData.blood_group,
            disability_status: formData.disability_status,
            caste: formData.caste,
            religion: formData.religion,
            contact_number: formData.contact_number,
            email: formData.email,
            aadhaar_number: formData.aadhaar_number,
            
            // Parents Information
            father_name: formData.father_name,
            mother_name: formData.mother_name,
            guardian_name: formData.guardian_name || null,
            parent_contact_number: formData.parent_contact_number,
            parent_email: formData.parent_email,
            parent_education: formData.parent_education,
            
            // Personal Information
            address: formData.address,
            annual_household_income: formData.annual_household_income ? parseFloat(formData.annual_household_income) : null,
            parent_business: formData.parent_business,
            
            // Bank Information
            bank_account_number: formData.bank_account_number,
            ifsc_code: formData.ifsc_code,
            bank_name: formData.bank_name,
            
            // Agreements
            terms_accepted: formData.terms_accepted,
            data_consent: formData.data_consent,
            
            // Password for login (stored as plain text for simplicity)
            password_hash: generatedPassword,
            
            // Default status
            status: 'pending',
          },
        ])
        .select();

      if (error) {
        console.error('Database error:', error);
        setErrors([`Failed to submit form: ${error.message}`]);
      } else if (insertedData && insertedData[0]) {
        setSubmitSuccess(true);
        // Store credentials to display
        setCredentials({
          applicationId: insertedData[0].application_id,
          password: generatedPassword
        });
        
        // Reset formailed to submit form: ${error.message}`]);
      } else {
        setSubmitSuccess(true);
        // Reset form
        setFormData({
          student_name: '',
          marks_10: '',
          marks_12: '',
          photo_file: null,
          marksheet_10_file: null,
          marksheet_12_file: null,
          blood_group: '',
          disability_status: '',
          caste: '',
          religion: '',
          contact_number: '',
          email: '',
          aadhaar_number: '',
          father_name: '',
          mother_name: '',
          guardian_name: '',
          parent_contact_number: '',
          parent_email: '',
          parent_education: '',
          address: '',
          annual_household_income: '',
          parent_business: '',
          bank_account_number: '',
          ifsc_code: '',
          bank_name: '',
          terms_accepted: false,
          data_consent: false,
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admission-form-container">
      <div className="form-header">
        <h1>Student Admission Form</h1>
        <p>Please fill in all required information carefully</p>
      </div>

      <form onSubmit={handleSubmit} className="admission-form">
        {/* Section 1: Student Information */}
        <section className="form-section">
          <h2>1. Student Information</h2>
          
          <div className="form-group">
            <label htmlFor="student_name">
              Student Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="student_name"
              name="student_name"
              value={formData.student_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marks_10">
                10th Marks (%) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="marks_10"
                name="marks_10"
                min="0"
                max="100"
                step="0.01"
                value={formData.marks_10}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="marks_12">
                12th Marks (%) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="marks_12"
                name="marks_12"
                min="0"
                max="100"
                step="0.01"
                value={formData.marks_12}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="photo_file">
              Student Photo <span className="required">*</span>
            </label>
            <input
              type="file"
              id="photo_file"
              name="photo_file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            <small>Passport size photo (Max 5MB)</small>
          </div>

          <div className="form-group">
            <label htmlFor="marksheet_10_file">
              10th Marksheet <span className="required">*</span>
            </label>
            <input
              type="file"
              id="marksheet_10_file"
              name="marksheet_10_file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required
            />
            <small>Image or PDF format (Max 5MB)</small>
          </div>

          <div className="form-group">
            <label htmlFor="marksheet_12_file">
              12th Marksheet <span className="required">*</span>
            </label>
            <input
              type="file"
              id="marksheet_12_file"
              name="marksheet_12_file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              required
            />
            <small>Image or PDF format (Max 5MB)</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blood_group">Blood Group</label>
              <select
                id="blood_group"
                name="blood_group"
                value={formData.blood_group}
                onChange={handleInputChange}
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="disability_status">Disability Status</label>
              <select
                id="disability_status"
                name="disability_status"
                value={formData.disability_status}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                <option value="none">None</option>
                <option value="physically_disabled">Physically Disabled</option>
                <option value="visually_impaired">Visually Impaired</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="caste">Caste</label>
              <input
                type="text"
                id="caste"
                name="caste"
                value={formData.caste}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="religion">Religion</label>
              <input
                type="text"
                id="religion"
                name="religion"
                value={formData.religion}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact_number">
                Contact Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleInputChange}
                required
              />
              <small>10 digit mobile number</small>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="aadhaar_number">
              Aadhaar Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="aadhaar_number"
              name="aadhaar_number"
              value={formData.aadhaar_number}
              onChange={handleInputChange}
              maxLength={12}
              required
            />
            <small>12 digit Aadhaar number</small>
          </div>
        </section>

        {/* Section 2: Parents Information */}
        <section className="form-section">
          <h2>2. Parents Information</h2>
          
          <div className="form-group">
            <label htmlFor="father_name">
              Father's Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="father_name"
              name="father_name"
              value={formData.father_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mother_name">Mother's Name</label>
            <input
              type="text"
              id="mother_name"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="guardian_name">Guardian Name (if applicable)</label>
            <input
              type="text"
              id="guardian_name"
              name="guardian_name"
              value={formData.guardian_name}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="parent_contact_number">Parent Contact Number</label>
              <input
                type="text"
                id="parent_contact_number"
                name="parent_contact_number"
                value={formData.parent_contact_number}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="parent_email">Parent Email</label>
              <input
                type="email"
                id="parent_email"
                name="parent_email"
                value={formData.parent_email}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="parent_education">Parent Education</label>
            <input
              type="text"
              id="parent_education"
              name="parent_education"
              value={formData.parent_education}
              onChange={handleInputChange}
            />
          </div>
        </section>

        {/* Section 3: Personal Information */}
        <section className="form-section">
          <h2>3. Personal Information</h2>
          
          <div className="form-group">
            <label htmlFor="address">
              Address <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              rows={4}
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="annual_household_income">
              Annual Household Income (₹)
            </label>
            <input
              type="number"
              id="annual_household_income"
              name="annual_household_income"
              min="0"
              step="1000"
              value={formData.annual_household_income}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="parent_business">Parent's Business/Occupation</label>
            <input
              type="text"
              id="parent_business"
              name="parent_business"
              value={formData.parent_business}
              onChange={handleInputChange}
            />
          </div>
        </section>

        {/* Section 4: Bank Information */}
        <section className="form-section">
          <h2>4. Bank Information</h2>
          
          <div className="form-group">
            <label htmlFor="bank_account_number">
              Bank Account Number <span className="required">*</span>
            </label>
            <input
              type="text"
              id="bank_account_number"
              name="bank_account_number"
              value={formData.bank_account_number}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ifsc_code">
                IFSC Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="ifsc_code"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                maxLength={11}
                minLength={11}
                pattern="[A-Z]{4}0[A-Z0-9]{6}"
                placeholder="SBIN0001234"
                style={{ textTransform: 'uppercase' }}
                required
              />
              <small>11 characters (e.g., SBIN0001234)</small>
            </div>

            <div className="form-group">
              <label htmlFor="bank_name">
                Bank Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="bank_name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Section 5: Agreements */}
        <section className="form-section">
          <h2>5. Declaration and Agreement</h2>
          
          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                id="terms_accepted"
                name="terms_accepted"
                checked={formData.terms_accepted}
                onChange={handleInputChange}
                required
              />
              <span>
                I hereby declare that all the information provided is true and correct 
                to the best of my knowledge. <span className="required">*</span>
              </span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                id="data_consent"
                name="data_consent"
                checked={formData.data_consent}
                onChange={handleInputChange}
                required
              />
              <span>
                I consent to the processing of my personal data for admission purposes. 
                <span className="required">*</span>
              </span>
            </label>
          </div>
        </section>

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="error-message">
            <h3>Please fix the following errors:</h3>
            <ul>
              {errors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Success Message with Credentials */}
        {submitSuccess && credentials && (
          <div className="credentials-box">
            <div className="credentials-header">
              <h3>✓ Application Submitted Successfully!</h3>
              <p>Please save these credentials to track your application</p>
            </div>
            <div className="credentials-content">
              <div className="credential-item">
                <label>Application ID:</label>
                <div className="credential-value">
                  <strong>{credentials.applicationId}</strong>
                  <button 
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(credentials.applicationId)}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="credential-item">
                <label>Password:</label>
                <div className="credential-value">
                  <strong>{credentials.password}</strong>
                  <button 
                    className="copy-btn"
                    onClick={() => navigator.clipboard.writeText(credentials.password)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
            <div className="credentials-footer">
              <p>⚠️ <strong>Important:</strong> Save these credentials safely. You'll need them to login and track your application status.</p>
              <button 
                className="btn-primary"
                onClick={() => window.location.href = '/login'}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdmissionForm;
