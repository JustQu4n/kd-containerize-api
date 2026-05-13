# Hướng Dẫn Test Todo API Endpoints

## 📋 Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Công Cụ Và Khung Làm Việc](#công-cụ-và-khung-làm-việc)
3. [Cấu Trúc Test](#cấu-trúc-test)
4. [Chi Tiết Các Endpoint](#chi-tiết-các-endpoint)
5. [Chạy Test](#chạy-test)
6. [Best Practices](#best-practices)

---

## 🎯 Giới Thiệu

Hướng dẫn này giúp bạn hiểu cách test Todo API endpoints. Todo API cung cấp các tính năng quản lý công việc bao gồm:
- Tạo mới công việc (todo)
- Lấy danh sách công việc
- Lấy chi tiết một công việc
- Cập nhật công việc
- Xóa công việc

---

## 🛠 Công Cụ Và Khung Làm Việc

### Công Cụ Test
| Công Cụ | Mục Đích | Phiên Bản |
|---------|---------|----------|
| **Jest** | Test Runner | 29.7.0 |
| **SuperTest** | HTTP Assertion Library | 6.3.4 |
| **Prisma** | ORM & Database | 5.10.0 |

### Cấu Trúc Project
```
test/
├── helpers.ts          # Hàm hỗ trợ (seed data, cleanup)
├── setup.ts            # Cấu hình test
└── todo.test.ts        # Test cases cho Todo API

src/
├── modules/todos/
│   ├── controllers/    # Xử lý request/response
│   ├── services/       # Business logic
│   ├── repositories/   # Database operations
│   ├── routes/         # API routes
│   └── domain/         # Entity definitions
```

---

## 📐 Cấu Trúc Test

### 1. Setup Và Cleanup

**File: test/helpers.ts**
```typescript
// Seed data cho testing
export async function seedTodo(data?: Partial<Todo>) {
  return db.todo.create({
    data: {
      title: 'Default todo',
      status: TodoStatus.pending,
      userId: 'mock-user-id',
      createdAt: Math.floor(Date.now() / 1000),
      updatedAt: Math.floor(Date.now() / 1000),
      ...data,
    },
  });
}

// Xóa tất cả todo sau mỗi test
export async function cleanup() {
  await db.todo.deleteMany();
}
```

### 2. Cấu Trúc Một Test Suite

```typescript
describe('Todo API', () => {
  // Setup trước mỗi test
  beforeEach(async () => {
    await cleanup();
  });

  // Cleanup sau mỗi test (tùy chọn)
  afterEach(async () => {
    await cleanup();
  });

  describe('POST /api/todos', () => {
    // Test cases ở đây
  });
});
```

---

## 📡 Chi Tiết Các Endpoint

### 1. CREATE - POST /api/todos
**Mục đích:** Tạo một công việc mới

#### ✅ Test Case: Tạo Thành Công
```typescript
it('should return 201 and the created todo for valid data', async () => {
  const todoData = { title: 'New Todo' };
  const res = await request(app)
    .post('/api/todos')
    .send(todoData);
  
  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty('id');
  expect(res.body.title).toBe(todoData.title);
  expect(res.body.status).toBe('pending');
});
```

#### ❌ Test Case: Thiếu Title
```typescript
it('should return 400 if title is missing', async () => {
  const res = await request(app)
    .post('/api/todos')
    .send({});
  
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('error');
});
```

#### ❌ Test Case: Title Rỗng
```typescript
it('should return 400 if title is empty string', async () => {
  const res = await request(app)
    .post('/api/todos')
    .send({ title: '' });
  
  expect(res.status).toBe(400);
});
```

#### ❌ Test Case: Title Quá Dài
```typescript
it('should return 400 if title exceeds max length', async () => {
  const longTitle = 'a'.repeat(256);
  const res = await request(app)
    .post('/api/todos')
    .send({ title: longTitle });
  
  expect(res.status).toBe(400);
});
```

#### ⚙️ Test Case: Với Ngày Hết Hạn
```typescript
it('should create todo with valid dueAt date', async () => {
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 1);
  
  const todoData = { 
    title: 'Todo with due date', 
    dueAt: dueAt.toISOString() 
  };
  
  const res = await request(app)
    .post('/api/todos')
    .send(todoData);
  
  expect(res.status).toBe(201);
  expect(res.body.dueAt).toBeDefined();
});
```

#### ❌ Test Case: DueAt Không Hợp Lệ
```typescript
it('should return 400 if dueAt has invalid ISO format', async () => {
  const todoData = { 
    title: 'Invalid Date', 
    dueAt: 'not-a-date' 
  };
  
  const res = await request(app)
    .post('/api/todos')
    .send(todoData);
  
  expect(res.status).toBe(400);
});
```

**Request Format:**
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Learn TypeScript",
  "description": "Complete TypeScript tutorial",
  "dueAt": "2026-05-20T10:00:00Z"
}
```

**Response (201):**
```json
{
  "todo": {
    "id": "uuid-1234",
    "title": "Learn TypeScript",
    "description": "Complete TypeScript tutorial",
    "status": "pending",
    "userId": "user-123",
    "dueAt": 1716184800,
    "createdAt": 1715600000,
    "updatedAt": 1715600000
  }
}
```

---

### 2. READ - GET /api/todos/:id
**Mục đích:** Lấy chi tiết một công việc

#### ✅ Test Case: Lấy Todo Thành Công
```typescript
it('should return 200 and todo details for valid id', async () => {
  const todo = await seedTodo({ title: 'Test Todo' });
  
  const res = await request(app)
    .get(`/api/todos/${todo.id}`);
  
  expect(res.status).toBe(200);
  expect(res.body.todo).toBeDefined();
  expect(res.body.todo.id).toBe(todo.id);
  expect(res.body.todo.title).toBe('Test Todo');
});
```

#### ❌ Test Case: ID Không Tồn Tại
```typescript
it('should return 404 if todo does not exist', async () => {
  const nonExistentId = 'non-existent-id';
  
  const res = await request(app)
    .get(`/api/todos/${nonExistentId}`);
  
  expect(res.status).toBe(404);
  expect(res.body).toHaveProperty('error');
});
```

#### ✅ Test Case: ID Dạng UUID
```typescript
it('should handle UUID format correctly', async () => {
  const todo = await seedTodo({ 
    title: 'UUID Todo' 
  });
  
  const res = await request(app)
    .get(`/api/todos/${todo.id}`);
  
  expect(res.status).toBe(200);
  expect(res.body.todo.id).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  );
});
```

**Request Format:**
```bash
GET /api/todos/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Learn TypeScript",
    "description": "Complete TypeScript tutorial",
    "status": "pending",
    "userId": "user-123",
    "dueAt": null,
    "createdAt": 1715600000,
    "updatedAt": 1715600000
  }
}
```

---

### 3. LIST - GET /api/todos
**Mục đích:** Lấy danh sách tất cả công việc

#### ✅ Test Case: Danh Sách Rỗng
```typescript
it('should return 200 and empty array if no todos exist', async () => {
  const res = await request(app)
    .get('/api/todos');
  
  expect(res.status).toBe(200);
  expect(res.body.data).toEqual([]);
  expect(res.body.total).toBe(0);
});
```

#### ✅ Test Case: Danh Sách Có Dữ Liệu
```typescript
it('should return 200 and list all todos', async () => {
  await seedTodo({ title: 'Todo 1' });
  await seedTodo({ title: 'Todo 2' });
  await seedTodo({ title: 'Todo 3' });
  
  const res = await request(app)
    .get('/api/todos');
  
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(3);
  expect(res.body.total).toBe(3);
});
```

#### 🔍 Test Case: Phân Trang
```typescript
it('should handle pagination correctly', async () => {
  // Tạo 5 todos
  for (let i = 1; i <= 5; i++) {
    await seedTodo({ title: `Todo ${i}` });
  }
  
  // Page 1, limit 2
  const res1 = await request(app)
    .get('/api/todos?page=1&limit=2');
  
  expect(res1.status).toBe(200);
  expect(res1.body.data.length).toBe(2);
  expect(res1.body.meta.page).toBe(1);
  expect(res1.body.meta.limit).toBe(2);
  expect(res1.body.meta.total).toBe(5);
  
  // Page 2, limit 2
  const res2 = await request(app)
    .get('/api/todos?page=2&limit=2');
  
  expect(res2.status).toBe(200);
  expect(res2.body.data.length).toBe(2);
  expect(res2.body.meta.page).toBe(2);
});
```

#### 🔍 Test Case: Lọc Theo Status
```typescript
it('should filter by status=completed', async () => {
  await seedTodo({ 
    title: 'Todo 1', 
    status: TodoStatus.completed 
  });
  await seedTodo({ 
    title: 'Todo 2', 
    status: TodoStatus.pending 
  });
  await seedTodo({ 
    title: 'Todo 3', 
    status: TodoStatus.completed 
  });
  
  const res = await request(app)
    .get('/api/todos?status=completed');
  
  expect(res.status).toBe(200);
  expect(res.body.data.length).toBe(2);
  res.body.data.forEach((todo: Todo) => {
    expect(todo.status).toBe(TodoStatus.completed);
  });
});
```

**Request Format:**
```bash
# Danh sách tất cả
GET /api/todos

# Với phân trang
GET /api/todos?page=1&limit=10

# Với lọc
GET /api/todos?status=completed
GET /api/todos?userId=user-123
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "title": "Todo 1",
      "status": "pending",
      "userId": "user-123",
      "createdAt": 1715600000,
      "updatedAt": 1715600000
    },
    {
      "id": "uuid-2",
      "title": "Todo 2",
      "status": "completed",
      "userId": "user-123",
      "createdAt": 1715600100,
      "updatedAt": 1715600100
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2
  }
}
```

---

### 4. UPDATE - PUT /api/todos/:id
**Mục đích:** Cập nhật thông tin công việc

#### ✅ Test Case: Cập Nhật Title Thành Công
```typescript
it('should update todo title successfully', async () => {
  const todo = await seedTodo({ title: 'Old Title' });
  
  const res = await request(app)
    .put(`/api/todos/${todo.id}`)
    .send({ title: 'Updated Title' });
  
  expect(res.status).toBe(200);
  expect(res.body.todo.title).toBe('Updated Title');
  expect(res.body.todo.id).toBe(todo.id);
});
```

#### ✅ Test Case: Cập Nhật Status
```typescript
it('should update todo status to completed', async () => {
  const todo = await seedTodo({ 
    title: 'Test Todo',
    status: TodoStatus.pending 
  });
  
  const res = await request(app)
    .put(`/api/todos/${todo.id}`)
    .send({ status: 'completed' });
  
  expect(res.status).toBe(200);
  expect(res.body.todo.status).toBe(TodoStatus.completed);
});
```

#### ✅ Test Case: Cập Nhật Nhiều Trường
```typescript
it('should update multiple fields at once', async () => {
  const todo = await seedTodo({ title: 'Old' });
  const newDescription = 'Updated description';
  
  const res = await request(app)
    .put(`/api/todos/${todo.id}`)
    .send({ 
      title: 'New Title',
      description: newDescription,
      status: 'completed'
    });
  
  expect(res.status).toBe(200);
  expect(res.body.todo.title).toBe('New Title');
  expect(res.body.todo.description).toBe(newDescription);
  expect(res.body.todo.status).toBe('completed');
});
```

#### ❌ Test Case: Status Không Hợp Lệ
```typescript
it('should return 400 if status is invalid', async () => {
  const todo = await seedTodo({ title: 'Test' });
  
  const res = await request(app)
    .put(`/api/todos/${todo.id}`)
    .send({ status: 'invalid-status' });
  
  expect(res.status).toBe(400);
});
```

#### ❌ Test Case: ID Không Tồn Tại
```typescript
it('should return 404 if todo does not exist', async () => {
  const res = await request(app)
    .put('/api/todos/non-existent-id')
    .send({ title: 'New Title' });
  
  expect(res.status).toBe(404);
});
```

#### ⚙️ Test Case: Cập Nhật DueAt
```typescript
it('should update todo dueAt date', async () => {
  const todo = await seedTodo({ title: 'Test' });
  const newDueAt = new Date();
  newDueAt.setDate(newDueAt.getDate() + 5);
  
  const res = await request(app)
    .put(`/api/todos/${todo.id}`)
    .send({ dueAt: newDueAt.toISOString() });
  
  expect(res.status).toBe(200);
  expect(res.body.todo.dueAt).toBeDefined();
});
```

**Request Format:**
```bash
PUT /api/todos/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "completed",
  "dueAt": "2026-05-25T15:30:00Z"
}
```

**Response (200):**
```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Updated Title",
    "description": "Updated description",
    "status": "completed",
    "userId": "user-123",
    "dueAt": 1716650400,
    "createdAt": 1715600000,
    "updatedAt": 1715700000
  }
}
```

---

### 5. DELETE - DELETE /api/todos/:id
**Mục đích:** Xóa một công việc

#### ✅ Test Case: Xóa Thành Công
```typescript
it('should delete todo successfully', async () => {
  const todo = await seedTodo({ title: 'To Delete' });
  
  const res = await request(app)
    .delete(`/api/todos/${todo.id}`);
  
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('message', 'Todo deleted');
});
```

#### ✅ Test Case: Xác Nhận Todo Đã Bị Xóa
```typescript
it('should verify todo is deleted from database', async () => {
  const todo = await seedTodo({ title: 'To Delete' });
  
  await request(app)
    .delete(`/api/todos/${todo.id}`);
  
  // Cố gắng lấy todo đã xóa
  const res = await request(app)
    .get(`/api/todos/${todo.id}`);
  
  expect(res.status).toBe(404);
});
```

#### ❌ Test Case: Xóa ID Không Tồn Tại
```typescript
it('should return 404 when deleting non-existent todo', async () => {
  const res = await request(app)
    .delete('/api/todos/non-existent-id');
  
  expect(res.status).toBe(404);
});
```

#### ✅ Test Case: Xóa Không Ảnh Hưởng Todo Khác
```typescript
it('should not delete other todos', async () => {
  const todo1 = await seedTodo({ title: 'Todo 1' });
  const todo2 = await seedTodo({ title: 'Todo 2' });
  
  await request(app)
    .delete(`/api/todos/${todo1.id}`);
  
  // Kiểm tra todo2 vẫn tồn tại
  const res = await request(app)
    .get(`/api/todos/${todo2.id}`);
  
  expect(res.status).toBe(200);
  expect(res.body.todo.id).toBe(todo2.id);
});
```

**Request Format:**
```bash
DELETE /api/todos/550e8400-e29b-41d4-a716-446655440000
```

**Response (200):**
```json
{
  "message": "Todo deleted successfully"
}
```

---

## 🚀 Chạy Test

### 1. Chạy Tất Cả Test
```bash
npm test
```

### 2. Chạy Test Cụ Thể
```bash
# Chạy chỉ test file todo
npm test -- test/todo.test.ts

# Chạy test với từ khóa
npm test -- --testNamePattern="POST /api/todos"

# Chạy test một suite
npm test -- --testNamePattern="CREATE"
```

### 3. Chạy Test Với Watch Mode
```bash
npm test -- --watch
```

### 4. Chạy Test Và Xem Coverage
```bash
npm test -- --coverage
```

### 5. Chạy Test Cụ Thể (Test System)
```bash
npm run test-system
```

### Ví Dụ Chạy Test
```bash
# Chạy tất cả test
npm test

# Output example:
# PASS  test/todo.test.ts
#   Todo API
#     POST /api/todos
#       ✓ should return 201 and the created todo (45ms)
#       ✓ should return 400 if title is missing (12ms)
#     GET /api/todos
#       ✓ should return empty array if no todos (8ms)
#     GET /api/todos/:id
#       ✓ should return 200 and todo details (15ms)
#     PUT /api/todos/:id
#       ✓ should update todo successfully (22ms)
#     DELETE /api/todos/:id
#       ✓ should delete todo successfully (18ms)
#
# Test Suites: 1 passed, 1 total
# Tests:       6 passed, 6 total
```

---

## 📋 Best Practices

### ✅ DO's (Nên Làm)

#### 1. **Cleanup Dữ Liệu Sau Mỗi Test**
```typescript
describe('Todo API', () => {
  beforeEach(async () => {
    await cleanup();  // Xóa dữ liệu cũ
  });

  it('should create todo', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: 'Test' });
    expect(res.status).toBe(201);
  });
});
```

#### 2. **Sử Dụng Descriptive Test Names**
```typescript
// ✅ GOOD - Mô tả rõ ràng
it('should return 400 when title exceeds 255 characters', async () => {
  // ...
});

// ❌ BAD - Không rõ
it('should fail', async () => {
  // ...
});
```

#### 3. **Test Cả Happy Path Và Error Cases**
```typescript
// Happy path
it('should create todo with valid data', async () => { });

// Error cases
it('should return 400 if title is missing', async () => { });
it('should return 400 if title is empty', async () => { });
it('should return 400 if title exceeds max length', async () => { });
```

#### 4. **Seed Data Đầy Đủ**
```typescript
const todoWithAllFields = await seedTodo({
  title: 'Complete project',
  description: 'Finish by Friday',
  status: TodoStatus.pending,
  userId: 'user-123',
  dueAt: Math.floor(new Date('2026-05-20').getTime() / 1000)
});
```

#### 5. **Verify Response Structure**
```typescript
it('should have correct response structure', async () => {
  const res = await request(app)
    .post('/api/todos')
    .send({ title: 'Test' });
  
  expect(res.body).toHaveProperty('todo');
  expect(res.body.todo).toHaveProperty('id');
  expect(res.body.todo).toHaveProperty('title');
  expect(res.body.todo).toHaveProperty('status');
  expect(res.body.todo).toHaveProperty('createdAt');
});
```

#### 6. **Test Edge Cases**
```typescript
// Whitespace handling
it('should trim whitespace from title', async () => {
  const res = await request(app)
    .post('/api/todos')
    .send({ title: '  Test Todo  ' });
  
  expect(res.body.todo.title).toBe('Test Todo');
});

// Special characters
it('should handle special characters in title', async () => {
  const specialTitle = 'Test & <Script> "Todo"';
  const res = await request(app)
    .post('/api/todos')
    .send({ title: specialTitle });
  
  expect(res.status).toBe(201);
});

// Unicode
it('should handle unicode characters', async () => {
  const res = await request(app)
    .post('/api/todos')
    .send({ title: '🎯 Nhiệm vụ Tiếng Việt' });
  
  expect(res.status).toBe(201);
});
```

### ❌ DON'Ts (Không Nên)

#### 1. **Không Để Dữ Liệu Từ Test Trước Ảnh Hưởng Test Sau**
```typescript
// ❌ BAD
describe('Todo API', () => {
  it('creates a todo', async () => {
    await request(app).post('/api/todos').send({ title: 'Todo 1' });
  });

  it('should list one todo', async () => {
    // Phụ thuộc vào test trước!
    const res = await request(app).get('/api/todos');
    expect(res.body.data.length).toBe(1);
  });
});

// ✅ GOOD
describe('Todo API', () => {
  beforeEach(async () => {
    await cleanup();
  });

  it('creates a todo', async () => {
    await request(app).post('/api/todos').send({ title: 'Todo 1' });
  });

  it('should list one todo', async () => {
    const todo = await seedTodo({ title: 'Todo 1' });
    const res = await request(app).get('/api/todos');
    expect(res.body.data.length).toBe(1);
  });
});
```

#### 2. **Không Hardcode Magic Strings/Numbers**
```typescript
// ❌ BAD
it('should validate title length', async () => {
  const longTitle = 'a'.repeat(256);  // Magic number!
  // ...
});

// ✅ GOOD
const MAX_TITLE_LENGTH = 255;
it('should validate title length', async () => {
  const longTitle = 'a'.repeat(MAX_TITLE_LENGTH + 1);
  // ...
});
```

#### 3. **Không Viết Test Quá Dài**
```typescript
// ❌ BAD - Test quá phức tạp
it('should do everything', async () => {
  const todo = await seedTodo();
  await request(app).post('/api/todos').send({ title: 'T1' });
  await request(app).put(`/api/todos/${todo.id}`).send({ status: 'completed' });
  // ... 50 dòng code
});

// ✅ GOOD - Một test một trách nhiệm
it('should create todo', async () => { });
it('should update todo status', async () => { });
```

#### 4. **Không Ignrore Failed Tests**
```typescript
// ❌ BAD
it.skip('should handle error case', async () => {
  // ...
});

// Nếu test fail, xem xét tại sao:
// 1. API có bug?
// 2. Test case không hợp lệ?
// 3. Database không ready?
```

---

## 📊 Cheat Sheet - HTTP Status Codes

| Status | Ý Nghĩa | Khi Nào Dùng |
|--------|---------|-------------|
| **200** | OK | Request thành công, có response body |
| **201** | Created | Resource được tạo thành công |
| **204** | No Content | Request thành công, không có response body |
| **400** | Bad Request | Validation error, dữ liệu không hợp lệ |
| **404** | Not Found | Resource không tồn tại |
| **500** | Server Error | Lỗi server |

---

## 📚 Tài Liệu Thêm

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [SuperTest Documentation](https://github.com/visionmedia/supertest)
- [Prisma Testing](https://www.prisma.io/docs/guides/testing)
- [Express Testing Patterns](https://expressjs.com/en/guide/testing.html)

---

## 🎓 Ví Dụ Hoàn Chỉnh

Xem file `test/todo.test.ts` để xem ví dụ hoàn chỉnh của tất cả test cases.

---

## 📞 Troubleshooting

### ❓ Vấn Đề: Test Timeout

**Giải Pháp:**
```typescript
describe('Todo API', () => {
  // Tăng timeout nếu cần
  jest.setTimeout(10000);
  
  it('should handle slow operation', async () => {
    // ...
  }, 15000);  // 15 giây timeout cho test này
});
```

### ❓ Vấn Đề: Database Connection Error

**Giải Pháp:**
```bash
# Đảm bảo database đang chạy
docker-compose up -d

# Hoặc kiểm tra .env file
echo "DATABASE_URL=postgresql://..."
```

### ❓ Vấn Đề: Test Pass Locally Nhưng Fail Trên CI/CD

**Giải Pháp:**
1. Kiểm tra environment variables
2. Đảm bảo cleanup() được gọi
3. Sử dụng `--runInBand` để chạy sequential

```bash
npm test -- --runInBand
```

---

**Tạo bởi:** Todo API Testing Team
**Cập nhật lần cuối:** 2026-05-13
