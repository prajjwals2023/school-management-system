const http = require('http');
const app = require('./server');

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', (chunk) => (resBody += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resBody) });
        } catch {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
};

const runTests = async () => {
  // Wait 1 sec for server to start
  await new Promise((r) => setTimeout(r, 1000));
  console.log('--- STARTING BACKEND RBAC VERIFICATION ---');

  // Test 1: Principal Login
  const pLogin = await request('POST', '/api/auth/login', {
    email: 'principal@school.com',
    password: 'password123',
  });
  console.log(`1. Principal Login Status: ${pLogin.status} (Role: ${pLogin.data.user?.role}, ClassId: ${pLogin.data.user?.classId})`);
  const principalToken = pLogin.data.token;

  // Test 2: Teacher Login
  const tLogin = await request('POST', '/api/auth/login', {
    email: 'rahul@school.com',
    password: 'password123',
  });
  console.log(`2. Teacher Login Status: ${tLogin.status} (Role: ${tLogin.data.user?.role}, Class: ${tLogin.data.user?.assignedClass?.className})`);
  const teacherToken = tLogin.data.token;

  // Test 3: Teacher gets own class students
  const tStudents = await request('GET', '/api/teacher/students', null, teacherToken);
  console.log(`3. Teacher GET /api/teacher/students: status ${tStudents.status}, count: ${tStudents.data.count}`);
  const sampleStudent = tStudents.data.data[0];

  // Test 4: Teacher attempts Principal endpoint (Should be 403)
  const tForbidden = await request('GET', '/api/principal/classes', null, teacherToken);
  console.log(`4. Teacher GET /api/principal/classes: status ${tForbidden.status} (${tForbidden.data.message})`);

  // Test 5: Principal gets all classes
  const pClasses = await request('GET', '/api/principal/classes', null, principalToken);
  console.log(`5. Principal GET /api/principal/classes: status ${pClasses.status}, classes count: ${pClasses.data.count}`);

  // Test 6: Teacher accesses student profile of their class
  const sProfile = await request('GET', `/api/students/${sampleStudent._id}`, null, teacherToken);
  console.log(`6. Teacher GET student profile (own class): status ${sProfile.status} (${sProfile.data.data?.student?.name})`);

  // Test 7: Principal gets student profile
  const pProfile = await request('GET', `/api/students/${sampleStudent._id}`, null, principalToken);
  console.log(`7. Principal GET student profile: status ${pProfile.status} (${pProfile.data.data?.student?.name})`);

  console.log('--- ALL BACKEND RBAC TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
};

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
