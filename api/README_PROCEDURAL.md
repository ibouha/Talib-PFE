# Talib API - Procedural Version

This directory contains a complete procedural (non-OOP) version of the Talib API.

## 🔄 **How to Switch from OOP to Procedural**

### **Step 1: Backup Current Files**
```bash
# Backup your current OOP files
cp index.php index_oop_backup.php
cp .htaccess .htaccess_oop_backup
```

### **Step 2: Switch to Procedural Version**
```bash
# Replace the main index file
cp index_procedural.php index.php

# Replace the .htaccess file
cp .htaccess_procedural .htaccess
```

### **Step 3: Test the API**
Visit: `http://localhost/Talib-PFE/api/`

You should see:
```json
{
  "success": true,
  "data": {
    "message": "Talib API - Procedural Version",
    "version": "v1",
    "endpoints": { ... }
  }
}
```

## 📁 **File Structure**

```
api/
├── models_procedural/          # Procedural models (functions)
│   ├── admin_model.php
│   ├── student_model.php
│   ├── owner_model.php
│   ├── housing_model.php
│   ├── item_model.php
│   └── roommate_model.php
├── controllers_procedural/     # Procedural controllers (functions)
│   ├── auth_controller.php
│   ├── student_controller.php
│   ├── housing_controller.php
│   ├── item_controller.php
│   ├── roommate_controller.php
│   └── admin_controller.php
├── config/
│   └── Database_procedural.php # Procedural database functions
├── auth_procedural.php         # Procedural authentication functions
├── router_procedural.php       # Main procedural router
└── index_procedural.php        # Entry point
```

## 🔧 **Key Differences**

### **OOP Version:**
```php
// Models
$studentModel = new Student();
$student = $studentModel->findById($id);

// Controllers
class StudentController {
    public function getById($id) {
        // ...
    }
}
```

### **Procedural Version:**
```php
// Models
require_once 'models_procedural/student_model.php';
$student = get_student_by_id($id);

// Controllers
function handle_get_student($id) {
    // ...
}
```

## 🚀 **API Endpoints**

All endpoints remain the same:

### **Authentication**
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/admin-login` - Admin login

### **Students**
- `GET /students` - Get all students
- `GET /students/{id}` - Get student by ID
- `PUT /students/{id}` - Update student
- `PUT /students/{id}/status` - Update student status (admin)

### **Housing**
- `GET /housing` - Get all housing listings
- `GET /housing/{id}` - Get housing by ID
- `POST /housing` - Create housing (owners)
- `PUT /housing/{id}` - Update housing
- `DELETE /housing/{id}` - Delete housing
- `POST /housing/{id}/contact` - Contact owner (students)

### **Items**
- `GET /items` - Get all items
- `GET /items/{id}` - Get item by ID
- `GET /items/categories` - Get popular categories
- `POST /items` - Create item (students)
- `PUT /items/{id}` - Update item
- `PUT /items/{id}/sold` - Mark as sold
- `DELETE /items/{id}` - Delete item

### **Roommates**
- `GET /roommates` - Get all roommate profiles
- `GET /roommates/{id}` - Get roommate profile by ID
- `GET /roommates/{id}/compatible` - Get compatible profiles
- `POST /roommates` - Create profile (students)
- `PUT /roommates/{id}` - Update profile
- `DELETE /roommates/{id}` - Delete profile

### **Admin**
- `GET /admin/users` - Get all users
- `GET /admin/stats` - Get user statistics
- `GET /admin/platform-stats` - Get platform statistics
- `PUT /admin/user-status` - Update user status
- `DELETE /admin/users` - Delete user

## ✅ **Advantages of Procedural Version**

1. **Simplicity** - Easier to understand for beginners
2. **Less Memory** - No object instantiation overhead
3. **Direct** - Functions called directly without class context
4. **Familiar** - Many PHP developers comfortable with procedural code

## ⚠️ **Considerations**

1. **Global State** - Uses global variables for database connection
2. **Organization** - May become harder to organize as it grows
3. **Testing** - More difficult to unit test than OOP
4. **Reusability** - Less reusable than OOP classes

## 🔄 **Switching Back to OOP**

To switch back to the OOP version:
```bash
# Restore OOP files
cp index_oop_backup.php index.php
cp .htaccess_oop_backup .htaccess
```

## 🛠️ **Development Notes**

- All authentication logic is in `auth_procedural.php`
- Database functions are in `config/Database_procedural.php`
- Each model file contains functions for one entity
- Controllers are organized by functionality
- Router handles all URL routing and method dispatching

## 📝 **Example Usage**

### **Creating a Student (Procedural)**
```php
// In student_model.php
function create_student($data) {
    $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
    $sql = "INSERT INTO student (name, email, password, phone, university) VALUES (?, ?, ?, ?, ?)";
    return executeInsert($sql, [$data['name'], $data['email'], $data['password'], $data['phone'], $data['university']], "sssss");
}

// In student_controller.php
function handle_create_student() {
    $input = json_decode(file_get_contents('php://input'), true);
    $student_id = create_student($input);
    Response::success(['student_id' => $student_id]);
}
```

The procedural version maintains all the same functionality as the OOP version while using a simpler, function-based approach.
