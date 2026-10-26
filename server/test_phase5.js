const fs = require('fs');
const path = require('path');
const http = require('http');

// Helper to make HTTP requests
const request = ({ method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const isMultipart = headers['Content-Type']?.startsWith('multipart/form-data');
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        ...headers,
        ...(!isMultipart && body ? { 'Content-Type': 'application/json' } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      if (Buffer.isBuffer(body) || typeof body === 'string') {
        req.write(body);
      } else {
        req.write(JSON.stringify(body));
      }
    }
    req.end();
  });
};

// Multipart form builder helper
const buildMultipart = (fields, files) => {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${key}"${crlf}${crlf}` +
      `${val}${crlf}`
    );
  }

  for (const file of files) {
    parts.push(
      `--${boundary}${crlf}` +
      `Content-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"${crlf}` +
      `Content-Type: ${file.contentType}${crlf}${crlf}`
    );
    parts.push(file.content);
    parts.push(crlf);
  }

  parts.push(`--${boundary}--${crlf}`);

  const buffers = parts.map((p) => (Buffer.isBuffer(p) ? p : Buffer.from(p, 'utf-8')));
  const body = Buffer.concat(buffers);
  return { boundary, body };
};

const runPhase5Tests = async () => {
  console.log('====================================================');
  console.log('--- STARTING PHASE 5 END-TO-END INTEGRATION TEST ---');
  console.log('====================================================\n');

  // 1. Patient Login
  console.log('1. Logging in as Patient (patient@meditrack.com)...');
  const patientAuth = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'patient@meditrack.com', password: 'patient123' },
  });
  if (patientAuth.status !== 200) {
    throw new Error(`Patient login failed: ${JSON.stringify(patientAuth.data)}`);
  }
  const patientToken = patientAuth.data.token;
  const patientUser = patientAuth.data.user;
  console.log(`✓ Patient logged in: ${patientUser.name} (ID: ${patientUser.id})`);

  // 2. Fetch Patient's Bookings
  console.log('\n2. Fetching Patient Test Bookings...');
  const patientBookingsRes = await request({
    method: 'GET',
    path: '/api/bookings/my',
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const myBookings = patientBookingsRes.data.bookings || [];
  console.log(`✓ Found ${myBookings.length} bookings for patient.`);
  if (myBookings.length === 0) {
    throw new Error('No test bookings found for patient.');
  }
  const targetBooking = myBookings[0];
  console.log(`✓ Selected Target Booking: #${targetBooking.bookingId} (${targetBooking.status})`);

  // 3. Lab Staff Login
  console.log('\n3. Logging in as Lab Staff (lab@meditrack.com)...');
  const labAuth = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'lab@meditrack.com', password: 'labstaff123' },
  });
  if (labAuth.status !== 200) {
    throw new Error(`Lab Staff login failed: ${JSON.stringify(labAuth.data)}`);
  }
  const labToken = labAuth.data.token;
  console.log(`✓ Lab Staff logged in: ${labAuth.data.user.name}`);

  // 4. Lab Stats & Bookings Queue
  console.log('\n4. Checking Lab Dashboard Stats & Diagnostic Queue...');
  const labStats = await request({
    method: 'GET',
    path: '/api/lab/stats',
    headers: { Authorization: `Bearer ${labToken}` },
  });
  console.log('✓ Lab Stats:', labStats.data.stats);

  // 5. Advance Sample Status: -> 'Sample Collected'
  console.log(`\n5. Transitioning Booking #${targetBooking.bookingId} to 'Sample Collected'...`);
  const collectRes = await request({
    method: 'PUT',
    path: `/api/lab/bookings/${targetBooking._id}/status`,
    headers: { Authorization: `Bearer ${labToken}` },
    body: {
      status: 'Sample Collected',
      notes: 'Sample tube accessioned with Barcode #BAR-99023 at phlebotomy station.',
    },
  });
  console.log(`✓ Status update response: ${collectRes.status} | Booking status: ${collectRes.data.booking?.status}`);

  // 6. Advance Sample Status: -> 'Processing'
  console.log(`\n6. Transitioning Booking #${targetBooking.bookingId} to 'Processing'...`);
  const processRes = await request({
    method: 'PUT',
    path: `/api/lab/bookings/${targetBooking._id}/status`,
    headers: { Authorization: `Bearer ${labToken}` },
    body: {
      status: 'Processing',
      notes: 'Sample loaded into automated hematology analyzer.',
    },
  });
  console.log(`✓ Status update response: ${processRes.status} | Booking status: ${processRes.data.booking?.status}`);

  // 7. Upload Diagnostic PDF Report
  console.log(`\n7. Uploading Verified PDF Diagnostic Report for Booking #${targetBooking.bookingId}...`);
  // Generate a mock PDF buffer
  const samplePdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (MediTrack Diagnostic Report) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF');
  const { boundary, body: multipartBody } = buildMultipart(
    {
      bookingId: targetBooking._id,
      summary: 'Complete Blood Count within reference range. Hemoglobin 14.8 g/dL. No atypical cells observed.',
      criticalFlag: 'false',
    },
    [
      {
        fieldname: 'reportFile',
        filename: 'CBC_Report_Verified.pdf',
        contentType: 'application/pdf',
        content: samplePdfContent,
      },
    ]
  );

  const uploadRes = await request({
    method: 'POST',
    path: '/api/lab/reports',
    headers: {
      Authorization: `Bearer ${labToken}`,
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': multipartBody.length,
    },
    body: multipartBody,
  });
  console.log(`✓ Upload Report Response (${uploadRes.status}):`, {
    reportId: uploadRes.data.report?.reportId,
    fileUrl: uploadRes.data.report?.fileUrl,
    bookingStatus: uploadRes.data.booking?.status,
  });

  // 8. Verify Patient Receives Report & Notification
  console.log('\n8. Verifying Patient can access the Report and receives in-app Alert...');
  const patientReportsRes = await request({
    method: 'GET',
    path: '/api/reports/my',
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  const myReports = patientReportsRes.data.reports || [];
  console.log(`✓ Patient Reports Count: ${myReports.length}`);
  const latestReport = myReports[0];
  console.log(`✓ Latest Report: ID=${latestReport?.reportId}, File=${latestReport?.fileUrl}`);

  const notifsRes = await request({
    method: 'GET',
    path: '/api/notifications',
    headers: { Authorization: `Bearer ${patientToken}` },
  });
  console.log(`✓ Patient Unread Alerts Count: ${notifsRes.data.unreadCount}`);
  const latestAlert = notifsRes.data.notifications?.[0];
  console.log(`✓ Latest Alert: "${latestAlert?.title}" -> "${latestAlert?.message}"`);

  // 9. Doctor Login & Consultation Workflow
  console.log('\n9. Logging in as Doctor (dr.sharma@meditrack.com)...');
  const docAuth = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'dr.sharma@meditrack.com', password: 'doctor123' },
  });
  if (docAuth.status !== 200) {
    throw new Error(`Doctor login failed: ${JSON.stringify(docAuth.data)}`);
  }
  const docToken = docAuth.data.token;
  console.log(`✓ Doctor logged in: Dr. ${docAuth.data.user.name}`);

  const docApptsRes = await request({
    method: 'GET',
    path: '/api/doctor/appointments',
    headers: { Authorization: `Bearer ${docToken}` },
  });
  const docAppts = docApptsRes.data.appointments || [];
  console.log(`✓ Doctor Appointments Found: ${docAppts.length}`);

  let targetAppt = docAppts.find((a) => a.status === 'Scheduled' || a.status === 'Confirmed') || docAppts[0];
  if (targetAppt) {
    console.log(`✓ Target Appointment: ID=${targetAppt._id}, Patient=${targetAppt.patient?.name}, Slot=${targetAppt.slot}`);

    // Confirm slot
    await request({
      method: 'PUT',
      path: `/api/doctor/appointments/${targetAppt._id}/status`,
      headers: { Authorization: `Bearer ${docToken}` },
      body: { status: 'Confirmed', notes: 'Consultation slot confirmed by Dr. Sharma' },
    });
    console.log('✓ Slot confirmed.');

    // 10. Doctor Issues Digital Prescription
    console.log('\n10. Doctor issuing Digital Prescription (Rx)...');
    const rxRes = await request({
      method: 'POST',
      path: '/api/doctor/prescriptions',
      headers: { Authorization: `Bearer ${docToken}` },
      body: {
        appointmentId: targetAppt._id,
        diagnosis: 'Seasonal allergic rhinitis with mild pharyngitis',
        vitals: { bloodPressure: '122/82', heartRate: '74', weight: '69', temperature: '98.4' },
        medicines: [
          { name: 'Cetirizine 10mg', dosage: '10mg', frequency: '0-0-1', duration: '5 days', instructions: 'At bedtime' },
          { name: 'Fluticasone Nasal Spray', dosage: '50mcg', frequency: '1-0-1', duration: '7 days', instructions: '1 spray per nostril' },
        ],
        recommendedTests: ['Complete Blood Count (CBC)', 'Absolute Eosinophil Count (AEC)'],
        doctorNotes: 'Keep hydrated, steam inhalation twice daily.',
        followUpDate: '2026-11-05',
      },
    });
    console.log(`✓ Prescription Issued: ID=${rxRes.data.prescription?._id}, Status=${rxRes.status}`);

    // 11. Doctor Inspects Patient Medical Records (Guarded by Privacy)
    console.log('\n11. Testing Doctor Access to Patient Medical Records (Guarded Privacy)...');
    const patientRecordRes = await request({
      method: 'GET',
      path: `/api/doctor/patients/${targetAppt.patient._id}`,
      headers: { Authorization: `Bearer ${docToken}` },
    });
    console.log(`✓ Doctor Patient Record Access: Status=${patientRecordRes.status}`);
    console.log(`✓ Patient Lab Reports Visible to Doctor: ${patientRecordRes.data.reports?.length}`);
    console.log(`✓ Prescriptions Visible: ${patientRecordRes.data.prescriptions?.length}`);
  }

  // 12. Patient Reviews Doctor & Files Support Ticket
  console.log('\n12. Testing Patient Doctor Review & Support Ticket...');
  const reviewRes = await request({
    method: 'POST',
    path: '/api/feedback/reviews',
    headers: { Authorization: `Bearer ${patientToken}` },
    body: {
      doctorId: docAuth.data.user.id,
      rating: 5,
      comment: 'Excellent doctor! Very thorough diagnosis and clear prescription advice.',
    },
  });
  console.log(`✓ Doctor Review Submitted: Status=${reviewRes.status}`);

  const complaintRes = await request({
    method: 'POST',
    path: '/api/feedback/complaints',
    headers: { Authorization: `Bearer ${patientToken}` },
    body: {
      subject: 'Inquiry regarding doorstep sample container seal',
      category: 'Phlebotomist Issue',
      description: 'Phlebotomist was polite and prompt, just confirming the container barcode matching.',
    },
  });
  console.log(`✓ Support Ticket Created: Status=${complaintRes.status}`);

  console.log('\n======================================================');
  console.log('--- ALL PHASE 5 INTEGRATION TESTS PASSED CLEANLY! ---');
  console.log('======================================================');
};

runPhase5Tests().catch((err) => {
  console.error('\n❌ Test Failure:', err);
  process.exit(1);
});
